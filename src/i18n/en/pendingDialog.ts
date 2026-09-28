// src/components/PendingDialog.tsx
export default {
  intro: "Some changes haven't been written yet. For each agent, choose whether to apply them first or discard them:",
  reviewIntro: "Review the files and changes for each agent. Apply the selected drafts; the others stay pending.",
  partialNote: "Agents are written one at a time, with backups. If one fails, the batch stops: successful writes stay applied and remaining drafts stay pending. Fix the error, refresh the previews, then retry together or one agent at a time.",
  waitPreviews: "Wait for all selected previews to finish before applying.",
  previewError: "A selected preview failed. Fix the error and refresh previews, or leave that agent unselected.",
  selectAgents: "Select at least one agent. All drafts stay pending until you apply or discard them.",
  refreshPreviews: "Refresh previews",
  keepPending: "Keep pending",
  applySelected: "Apply selected changes",
  willWriteRestKept: "Will write {names} (backed up first); the rest stay pending",
  changeCount: " · {n} change| · {n} changes",
  willWrite: "Will write {names} (backed up first)",
  willWriteRestDiscarded: "Will write {names} (backed up first); the rest are discarded",
  applyContinue: "Apply and continue",
  discardContinue: "Discard and continue",
};
