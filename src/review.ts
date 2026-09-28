import type { AgentId, DiffGroup } from "./api";

/** Unselected failures do not block a batch; every selected preview must have completed. */
export function previewReadiness(ids: readonly AgentId[], diffs: Record<string, DiffGroup[] | string>): "empty" | "loading" | "error" | "ready" {
  if (!ids.length) return "empty";
  if (ids.some((id) => typeof diffs[id] === "string")) return "error";
  return ids.every((id) => Array.isArray(diffs[id])) ? "ready" : "loading";
}
