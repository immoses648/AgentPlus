const FOCUSABLE = "button, input, select, textarea, a[href], area[href], summary, [tabindex], [contenteditable='true']";

/** Next enabled item for the native radio/tab keyboard conventions. */
export function nextFocusIndex(key: string, current: number, enabled: readonly boolean[], vertical = false): number | null {
  const choices = enabled.flatMap((on, i) => on ? [i] : []);
  if (!choices.length) return null;
  if (key === "Home") return choices[0];
  if (key === "End") return choices[choices.length - 1];
  const dir = key === "ArrowRight" || (vertical && key === "ArrowDown") ? 1
    : key === "ArrowLeft" || (vertical && key === "ArrowUp") ? -1 : 0;
  if (!dir) return null;
  const at = choices.indexOf(current);
  return choices[at < 0 ? (dir > 0 ? 0 : choices.length - 1) : (at + dir + choices.length) % choices.length];
}

function usable(el: HTMLElement): boolean {
  return el.isConnected && !el.matches(":disabled") && !el.closest("[hidden], [inert], [aria-hidden='true']")
    && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden";
}

function tabbable(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.tabIndex >= 0 && usable(el));
}

type Surface = { root: HTMLElement; dismiss: () => void };
type Layer = { root: HTMLElement; restore: HTMLElement | null; last: HTMLElement | null; surfaces: Set<Surface> };
const layers: Layer[] = [];
const isolated = new Map<HTMLElement, { inert: boolean; hidden: string | null }>();
let observer: MutationObserver | null = null;

function rootsOf(layer: Layer): HTMLElement[] {
  const roots = [layer.root, ...[...layer.surfaces].map((surface) => surface.root)];
  return roots.filter((root) => !roots.some((other) => other !== root && other.contains(root)));
}

function contains(layer: Layer, target: Node | null): boolean {
  return !!target && (layer.root.contains(target) || [...layer.surfaces].some((surface) => surface.root.contains(target)));
}

function dismissSurfaces(layer: Layer) {
  const surfaces = [...layer.surfaces];
  layer.surfaces.clear();
  for (const surface of surfaces) surface.dismiss();
}

function restoreBackground() {
  for (const [el, previous] of isolated) {
    el.inert = previous.inert;
    if (previous.hidden === null) el.removeAttribute("aria-hidden");
    else el.setAttribute("aria-hidden", previous.hidden);
  }
  isolated.clear();
}

function isolateBackground() {
  restoreBackground();
  const top = layers[layers.length - 1];
  if (!top) return;
  // Move focus before hiding its previous ancestor from assistive technologies.
  if (!contains(top, document.activeElement)) focusInside(top);
  // Walk the active dialog's ancestor path: nested dialogs may share a parent with
  // another overlay. Owned floating surfaces keep only their own ancestor paths open.
  const roots = rootsOf(top);
  for (const root of roots) {
    for (let branch: HTMLElement = root; branch.parentElement; branch = branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (!(sibling instanceof HTMLElement) || roots.some((allowed) => sibling.contains(allowed)) || isolated.has(sibling)) continue;
        isolated.set(sibling, { inert: sibling.inert, hidden: sibling.getAttribute("aria-hidden") });
        sibling.inert = true;
        sibling.setAttribute("aria-hidden", "true");
      }
      if (branch.parentElement === document.body) break;
    }
  }
}

function focusInside(layer: Layer) {
  const target = layer.last && contains(layer, layer.last) && usable(layer.last) ? layer.last
    : tabbable(layer.root)[0] ?? layer.root;
  target.focus({ preventScroll: true });
}

function onFocus(e: FocusEvent) {
  const top = layers[layers.length - 1];
  if (!top) return;
  if (e.target instanceof HTMLElement && contains(top, e.target)) top.last = e.target;
  else focusInside(top);
}

function onTab(e: KeyboardEvent) {
  const top = layers[layers.length - 1];
  if (!top || e.key !== "Tab" || e.defaultPrevented) return;
  const items = rootsOf(top).flatMap(tabbable).sort((a, b) =>
    a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  const active = document.activeElement;
  const index = items.indexOf(active as HTMLElement);
  if (!items.length || index < 0 || (e.shiftKey ? index === 0 : index === items.length - 1)) {
    e.preventDefault();
    (items[e.shiftKey ? items.length - 1 : 0] ?? top.root).focus({ preventScroll: true });
  }
}

/** A detached popover belongs only to the modal that contains its originating control. */
export function containModalSurface(root: HTMLElement, origin: Element, dismiss: () => void): () => void {
  const top = layers[layers.length - 1];
  if (!top) return () => {};
  if (!contains(top, origin)) {
    dismiss();
    return () => {};
  }
  const surface: Surface = { root, dismiss };
  top.surfaces.add(surface);
  isolateBackground();
  return () => {
    top.surfaces.delete(surface);
    isolateBackground();
  };
}

/** Activate one modal; cleanup releases its background and restores the originating focus. */
export function containModalFocus(root: HTMLElement, restore: HTMLElement | null): () => void {
  const previous = layers[layers.length - 1];
  const layer: Layer = { root, restore, last: null, surfaces: new Set() };
  const child = layers.findIndex((other) => root.contains(other.root));
  if (child < 0) layers.push(layer);
  else layers.splice(child, 0, layer);
  if (previous && layers[layers.length - 1] !== previous) dismissSurfaces(previous);
  if (layers.length === 1) {
    document.addEventListener("focusin", onFocus);
    document.addEventListener("keydown", onTab, true);
    observer = new MutationObserver(isolateBackground);
    observer.observe(document.body, { childList: true, subtree: true });
  }
  isolateBackground();
  if (root.contains(document.activeElement)) layer.last = document.activeElement as HTMLElement;
  else if (layers[layers.length - 1] === layer) focusInside(layer);

  return () => {
    const index = layers.indexOf(layer);
    if (index < 0) return;
    const wasTop = index === layers.length - 1;
    layers.splice(index, 1);
    // If a parent closes before its child, the child must restore to the parent's
    // trigger instead of trying to focus a detached control inside the old dialog.
    for (const other of layers) if (other.restore && contains(layer, other.restore)) other.restore = layer.restore;
    dismissSurfaces(layer);
    isolateBackground();
    if (!layers.length) {
      observer?.disconnect();
      observer = null;
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("keydown", onTab, true);
    }
    if (!wasTop) return;
    const top = layers[layers.length - 1];
    if (layer.restore && usable(layer.restore) && (!top || contains(top, layer.restore))) layer.restore.focus({ preventScroll: true });
    else if (top) focusInside(top);
  };
}
