import type { ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AgentState } from "../api";
import { t } from "../i18n";
import { Aside } from "./Aside";

const agent = {
  id: "opencode", name: "OpenCode", current: [], readonly: false, restartable: false,
} as unknown as AgentState;

function render(overrides: Partial<ComponentProps<typeof Aside>> = {}) {
  return renderToStaticMarkup(<Aside st={agent} diff={[]} pending={1} error={null}
    previewReady busy={false} detail={null} onDiscard={() => {}} onApply={() => {}}
    onRefresh={() => {}} {...overrides} />);
}

function applyButton(html: string) {
  const button = html.match(/<button class="btn primary full"[^>]*>/)?.[0];
  expect(button).toBeDefined();
  return button!;
}

describe("single-agent change preview", () => {
  it("keeps Apply disabled while a new or refreshed preview is loading", () => {
    const html = render({ previewReady: false });
    expect(applyButton(html)).toContain("disabled");
    expect(html).toContain(t("common.reading"));
    expect(html).toContain(t("aside.refreshPreview"));
  });

  it("does not enable Apply from an old diff after invalidation", () => {
    const html = render({ previewReady: false, diff: [{ file: "config.json", lines: [{ text: "old preview", add: true }] }] });
    expect(applyButton(html)).toContain("disabled");
  });

  it("shows a failed preview and offers refresh without allowing a write", () => {
    const html = render({ previewReady: false, error: "The config could not be read" });
    expect(applyButton(html)).toContain("disabled");
    expect(html).toContain("The config could not be read");
    expect(html).toContain(t("aside.refreshPreview"));
    expect(html).not.toContain(t("common.reading"));
  });

  it("accepts a successfully completed empty diff", () => {
    expect(applyButton(render())).not.toContain("disabled");
  });

  it.each([
    { pending: 0 },
    { busy: true },
    { st: { ...agent, readonly: true } },
    { error: "" },
  ])("still blocks Apply when another write constraint applies: %j", (overrides) => {
    expect(applyButton(render(overrides))).toContain("disabled");
  });
});
