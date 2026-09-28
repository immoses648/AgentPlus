import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { nextFocusIndex } from "../focus";

export interface TabItem<T extends string> {
  id: T;
  label: ReactNode;
  count?: number | null;
}

interface Props<T extends string> {
  id: string;
  label: string;
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
}

/** Tab strip with an underline that slides to the chosen tab. */
export function TabBar<T extends string>({ id, label, items, value, onChange }: Props<T>) {
  const root = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState<{ left: number; width: number } | null>(null);

  const ids = items.map((t) => t.id).join("\n");
  useLayoutEffect(() => {
    const measure = () => {
      const el = root.current?.querySelector<HTMLElement>(`[data-tab="${value}"]`);
      if (el) setBar((b) => (b && b.left === el.offsetLeft && b.width === el.offsetWidth ? b : { left: el.offsetLeft, width: el.offsetWidth }));
    };
    measure();
    // Labels change width (counts, a language switch, fonts loading), which moves the tabs
    // after them: watch every tab, not just the strip (it spans the page either way).
    const ro = new ResizeObserver(measure);
    if (root.current) {
      ro.observe(root.current);
      root.current.querySelectorAll("[data-tab]").forEach((el) => ro.observe(el));
    }
    return () => ro.disconnect();
  }, [value, ids]);

  return (
    <div className="tabs" role="tablist" aria-label={label} ref={root}>
      {items.map((t, i) => (
        <button key={t.id} id={`${id}-${t.id}`} data-tab={t.id} type="button" role="tab" aria-selected={value === t.id}
          aria-controls={`${id}-panel`} tabIndex={value === t.id ? 0 : -1}
          className={`tab${value === t.id ? " on" : ""}`} onClick={() => onChange(t.id)}
          onKeyDown={(e) => {
            const next = nextFocusIndex(e.key, i, items.map(() => true));
            if (next === null) return;
            e.preventDefault();
            onChange(items[next].id);
            root.current?.querySelectorAll<HTMLButtonElement>("[role='tab']")[next]?.focus();
          }}>
          {t.label}{t.count != null && <span className="tab-count">{t.count}</span>}
        </button>
      ))}
      {bar && <span className="tab-bar" style={{ transform: `translateX(${bar.left}px)`, width: bar.width }} aria-hidden="true" />}
    </div>
  );
}

/** The mounted panel is shared by the tabs and named by the active tab. */
export function tabPanelProps(id: string, value: string) {
  return { id: `${id}-panel`, role: "tabpanel", "aria-labelledby": `${id}-${value}`, tabIndex: 0 };
}

/**
 * Direction for the tab content's entrance: "fwd" when moving to a tab on the
 * right, "back" when moving left. Pair with `key={value}` on the content.
 */
export function useSlideDir<T extends string>(value: T, order: readonly T[]): "fwd" | "back" {
  const prev = useRef(value);
  const dir = useRef<"fwd" | "back">("fwd");
  if (prev.current !== value) {
    dir.current = order.indexOf(value) >= order.indexOf(prev.current) ? "fwd" : "back";
    prev.current = value;
  }
  return dir.current;
}
