//! AgentPlus's own state in `~/.agentplus/store.json`:
//! per-agent switches and definitions stashed while a model/provider is hidden.
//!
//! The file is read from many threads at once (the gateway reads it on every request),
//! so it is only ever replaced whole (temp file + rename): a reader sees the old or the
//! new content, never half of it. Writes are serialized by `WRITE`; code that runs off
//! the main thread and changes the store uses `update` so the load and save happen
//! under that one lock.

use crate::util::agentplus_dir;
use anyhow::{anyhow, bail, Result};
use serde_json::{json, Map, Value};
use std::fs;
use std::path::Path;
use std::sync::Mutex;
use std::time::Duration;

static WRITE: Mutex<()> = Mutex::new(());

fn read(p: &Path) -> Result<Value> {
    let text = match fs::read_to_string(p) {
        Ok(text) => text,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound
            && fs::symlink_metadata(p).is_err_and(|e| e.kind() == std::io::ErrorKind::NotFound) => return Ok(json!({})),
        Err(e) => bail!("{}", tr!("Can't read {}: {e}. Restore access before saving; the file has not been changed", "无法读取 {}：{e}。请恢复访问权限后再保存；原文件未改动", p.display())),
    };
    if text.trim().is_empty() {
        bail!("{}", tr!("{} is empty. Restore a valid store before saving; the file has not been changed", "{} 是空文件。请先恢复有效的数据文件再保存；原文件未改动", p.display()));
    }
    // Every writer indexes into the top level as an object: `[]` or `1` counts as broken.
    let value = serde_json::from_str::<Value>(&text).map_err(|_| anyhow!(tr!("{} is not valid JSON. Repair it or restore a backup before saving; the file has not been changed", "{} 不是有效的 JSON。请修复或从备份恢复后再保存；原文件未改动", p.display())))?;
    if !value.is_object() {
        bail!("{}", tr!("{} must contain a JSON object. Repair it or restore a backup before saving; the file has not been changed", "{} 的顶层必须是 JSON 对象。请修复或从备份恢复后再保存；原文件未改动", p.display()));
    }
    Ok(value)
}

/// Compatibility for read-only views; mutations and important flows use `load_checked`.
pub fn load() -> Value {
    load_checked().unwrap_or_else(|_| json!({}))
}

/// Only a missing store is a new store. Existing unreadable or damaged data is an error.
pub fn load_checked() -> Result<Value> {
    load_checked_in(&agentplus_dir())
}

fn load_checked_in(dir: &Path) -> Result<Value> {
    let p = dir.join("store.json");
    // Another program may be halfway through writing it: give it a moment. A file that
    // has been broken for a while is not retried (the gateway loads this on every request).
    let fresh = || fs::metadata(&p).and_then(|m| m.modified()).ok().and_then(|t| t.elapsed().ok()).is_some_and(|age| age < Duration::from_secs(2));
    for i in 0..3 {
        match read(&p) {
            Ok(v) => return Ok(v),
            Err(e) if i == 2 || !fresh() => return Err(e),
            Err(_) => {}
        }
        std::thread::sleep(Duration::from_millis(30));
    }
    unreachable!()
}

thread_local! {
    /// This thread holds `WRITE` through `transaction`.
    static HELD: std::cell::Cell<bool> = const { std::cell::Cell::new(false) };
}

/// Takes `WRITE` unless this thread already holds it (inside `transaction`).
fn lock() -> Option<std::sync::MutexGuard<'static, ()>> {
    if HELD.with(|h| h.get()) {
        return None;
    }
    Some(crate::util::lock(&WRITE))
}

/// Runs `f` holding the write lock, so a `load` … `save` inside it can't lose a change
/// another thread makes with `update` in between. `save` / `update` inside `f` don't lock again.
pub fn transaction<T>(f: impl FnOnce() -> T) -> T {
    struct Release(Option<std::sync::MutexGuard<'static, ()>>);
    impl Drop for Release {
        fn drop(&mut self) {
            if self.0.is_some() {
                HELD.with(|h| h.set(false));
            }
        }
    }
    let _r = Release(lock());
    HELD.with(|h| h.set(true));
    f()
}

pub fn save(v: &Value) -> anyhow::Result<()> {
    let _g = lock();
    write(v)
}

/// Load, change, save under the write lock (for callers outside the main thread).
pub fn update<T>(f: impl FnOnce(&mut Value) -> anyhow::Result<T>) -> anyhow::Result<T> {
    let _g = lock();
    let mut v = load_checked()?;
    let out = f(&mut v)?;
    write(&v)?;
    Ok(out)
}

fn write(v: &Value) -> anyhow::Result<()> {
    write_in(&agentplus_dir(), v)
}

fn write_in(dir: &Path, v: &Value) -> anyhow::Result<()> {
    if !v.is_object() {
        bail!("{}", crate::i18n::l("AgentPlus data must be a JSON object; nothing was saved", "AgentPlus 数据必须是 JSON 对象；未保存任何内容"));
    }
    load_checked_in(dir)?;
    crate::util::ensure_private_dir(dir)?;
    let path = dir.join("store.json");
    crate::util::write_private_atomic(&path, &serde_json::to_vec_pretty(v)?)
}

/// Per-agent entries are kept apart per environment: "codex" on Windows, "codex@wsl:Ubuntu" in WSL.
pub(crate) fn scoped(agent: &str) -> String {
    if crate::env::is_wsl() && crate::adapters::ALL.contains(&agent) {
        format!("{agent}@{}", crate::env::id())
    } else {
        agent.to_string()
    }
}

fn agent_obj<'a>(root: &'a mut Value, agent: &str) -> &'a mut Map<String, Value> {
    let agent = &scoped(agent);
    if !root.is_object() {
        *root = json!({});
    }
    let a = root
        .as_object_mut()
        .unwrap()
        .entry(agent.to_string())
        .or_insert_with(|| json!({}));
    if !a.is_object() {
        *a = json!({});
    }
    a.as_object_mut().unwrap()
}

/// Returns `store[agent][key]` as an object, creating it as needed.
pub fn section<'a>(root: &'a mut Value, agent: &str, key: &str) -> &'a mut Map<String, Value> {
    let s = agent_obj(root, agent).entry(key.to_string()).or_insert_with(|| json!({}));
    if !s.is_object() {
        *s = json!({});
    }
    s.as_object_mut().unwrap()
}

/// `store[agent][key]` for the current environment.
pub fn agent_get<'a>(root: &'a Value, agent: &str, key: &str) -> Option<&'a Value> {
    root.get(scoped(agent)).and_then(|a| a.get(key))
}

/// A copy of `store[agent][key]` as an object; empty when it is missing or not an object.
pub fn get_obj(root: &Value, agent: &str, key: &str) -> Map<String, Value> {
    agent_get(root, agent, key).and_then(|x| x.as_object()).cloned().unwrap_or_default()
}

/// A copy of `store[agent][key]` as an array; empty when it is missing or not an array.
pub fn get_arr(root: &Value, agent: &str, key: &str) -> Vec<Value> {
    agent_get(root, agent, key).and_then(|x| x.as_array()).cloned().unwrap_or_default()
}

pub fn get_flag(root: &Value, agent: &str, key: &str) -> bool {
    root.get(scoped(agent)).and_then(|a| a.get(key)).and_then(|v| v.as_bool()).unwrap_or(false)
}

pub fn set_flag(root: &mut Value, agent: &str, key: &str, v: bool) {
    agent_obj(root, agent).insert(key.to_string(), Value::Bool(v));
}

pub fn get_str(root: &Value, agent: &str, key: &str) -> Option<String> {
    root.get(scoped(agent)).and_then(|a| a.get(key)).and_then(|v| v.as_str()).map(String::from)
}

pub fn set_str(root: &mut Value, agent: &str, key: &str, v: &str) {
    agent_obj(root, agent).insert(key.to_string(), Value::from(v));
}

pub fn set_value(root: &mut Value, agent: &str, key: &str, v: Value) {
    agent_obj(root, agent).insert(key.to_string(), v);
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::util::TestHome;

    #[cfg(unix)]
    #[test]
    fn valid_store_writes_are_private() {
        use std::os::unix::fs::PermissionsExt;
        let h = crate::util::TestHome::new("store-private");
        let d = h.0.join(".agentplus");
        let p = d.join("store.json");
        let mode = |p: &Path| fs::metadata(p).unwrap().permissions().mode() & 0o777;
        write_in(&d, &json!({ "library": [{ "apiKey": "dummy" }] })).unwrap();
        assert_eq!(mode(&d), 0o700);
        assert_eq!(mode(&p), 0o600);
        fs::set_permissions(&d, fs::Permissions::from_mode(0o755)).unwrap();
        fs::set_permissions(&p, fs::Permissions::from_mode(0o644)).unwrap();
        write_in(&d, &json!({})).unwrap();
        assert_eq!(mode(&d), 0o700);
        for e in fs::read_dir(&d).unwrap().flatten() {
            assert_eq!(mode(&e.path()), 0o600);
        }
    }

    /// Readers running while the store is rewritten over and over never see a partial file.
    #[test]
    fn readers_never_see_a_torn_file() {
        let h = TestHome::new("store-torn");
        let d = h.0.join(".agentplus");
        let big: Vec<String> = (0..2000).map(|i| format!("entry-{i}")).collect();
        write_in(&d, &json!({ "library": big, "n": 0 })).unwrap();
        let stop = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(false));
        let readers: Vec<_> = (0..4)
            .map(|_| {
                let (d, stop) = (d.clone(), stop.clone());
                std::thread::spawn(move || {
                    let mut n = 0;
                    while !stop.load(std::sync::atomic::Ordering::SeqCst) {
                        let v = load_checked_in(&d).unwrap();
                        assert_eq!(v["library"].as_array().map(|a| a.len()), Some(2000), "read a partial store");
                        n += 1;
                    }
                    n
                })
            })
            .collect();
        for i in 1..40 {
            write_in(&d, &json!({ "library": big, "n": i })).unwrap();
        }
        stop.store(true, std::sync::atomic::Ordering::SeqCst);
        for r in readers {
            assert!(r.join().unwrap() > 0);
        }
        assert_eq!(load_checked_in(&d).unwrap()["n"], 39);
        assert!(!fs::read_dir(&d).unwrap().any(|e| e.unwrap().file_name().to_string_lossy().ends_with(".tmp")), "temp file left behind");
    }

    /// A missing store can be created, but damaged data is never replaced with defaults.
    #[test]
    fn missing_store_can_be_created() {
        let _h = TestHome::new("store-missing");
        assert_eq!(load_checked().unwrap(), json!({}));
        update(|root| { root["library"] = json!([]); Ok(()) }).unwrap();
        assert_eq!(load_checked().unwrap(), json!({ "library": [] }));
        assert!(save(&json!([])).is_err());
        assert_eq!(load_checked().unwrap(), json!({ "library": [] }));
    }

    #[test]
    fn damaged_store_blocks_all_mutations_and_stays_untouched() {
        let _h = TestHome::new("store-damaged");
        let dir = agentplus_dir();
        fs::create_dir_all(&dir).unwrap();
        let path = dir.join("store.json");
        for body in ["", " \n", "{ \"library\": [ half written", "[]", "1", "\"x\"", "null"] {
            fs::write(&path, body).unwrap();
            assert!(load_checked().is_err(), "{body}");
            assert_eq!(load(), json!({}), "read-only compatibility");
            assert!(save(&json!({ "gateway": {} })).is_err(), "{body}");
            let mut called = false;
            assert!(update(|root| { called = true; root["a"] = json!(1); Ok(()) }).is_err(), "{body}");
            assert!(!called, "a failed read must not run a mutation");
            assert_eq!(fs::read_to_string(&path).unwrap(), body);
            assert_eq!(fs::read_dir(&dir).unwrap().count(), 1, "no replacement or recovery files created");
        }
    }

    #[test]
    fn unreadable_store_is_not_a_missing_store() {
        let _h = TestHome::new("store-unreadable");
        let path = agentplus_dir().join("store.json");
        fs::create_dir_all(&path).unwrap();
        fs::write(path.join("keep"), "untouched").unwrap();
        assert!(load_checked().is_err());
        assert!(save(&json!({})).is_err());
        assert!(update(|_| Ok(())).is_err());
        assert_eq!(fs::read_to_string(path.join("keep")).unwrap(), "untouched");
    }

    #[cfg(unix)]
    #[test]
    fn dangling_store_symlink_is_not_a_missing_store() {
        let h = TestHome::new("store-dangling");
        fs::create_dir_all(agentplus_dir()).unwrap();
        let target = h.0.join("missing.json");
        let path = agentplus_dir().join("store.json");
        std::os::unix::fs::symlink(&target, &path).unwrap();
        assert!(load_checked().is_err());
        assert!(save(&json!({})).is_err());
        assert!(fs::symlink_metadata(&path).unwrap().file_type().is_symlink());
        assert!(!target.exists());
    }
}
