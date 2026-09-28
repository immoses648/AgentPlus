import { describe, expect, it } from "vitest";
import { previewReadiness } from "./review";

describe("batch review readiness", () => {
  it("requires an explicit selection even when every preview is ready", () => {
    expect(previewReadiness([], { codex: [], claude: [] })).toBe("empty");
  });

  it("waits for every selected agent instead of applying a partially loaded batch", () => {
    expect(previewReadiness(["codex", "claude"], { codex: [] })).toBe("loading");
    expect(previewReadiness(["codex", "claude"], { codex: [], claude: [] })).toBe("ready");
  });

  it("blocks selected failures but allows keeping a failed agent pending", () => {
    const diffs = { codex: [], claude: "The config could not be read" };
    expect(previewReadiness(["codex", "claude"], diffs)).toBe("error");
    expect(previewReadiness(["codex"], diffs)).toBe("ready");
    expect(previewReadiness(["claude"], { codex: [] })).toBe("loading");
  });

  it("accepts a completed empty diff but never an empty error message", () => {
    expect(previewReadiness(["codex"], { codex: [] })).toBe("ready");
    expect(previewReadiness(["codex"], { codex: "" })).toBe("error");
  });

  it("requires new previews after invalidation or a retry", () => {
    expect(previewReadiness(["codex"], { codex: [] })).toBe("ready");
    expect(previewReadiness(["codex"], {})).toBe("loading");
    expect(previewReadiness(["codex"], { codex: "Invalid config" })).toBe("error");
    expect(previewReadiness(["codex"], { codex: [] })).toBe("ready");
  });
});
