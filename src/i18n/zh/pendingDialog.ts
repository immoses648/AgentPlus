// src/components/PendingDialog.tsx
import type en from "../en/pendingDialog";

const zh: typeof en = {
  intro: "还有没写入的改动。选择每个 Agent 是先应用还是放弃：",
  reviewIntro: "检查每个 Agent 的文件和改动。只应用选中的草稿，其余保留为待写入。",
  partialNote: "逐个写入 Agent，并先备份。任何一项失败都会停止本批次：已成功的保持已应用，其余草稿继续待写入。修复错误并刷新预览后，可以一起重试，也可以每次只选一个 Agent。",
  waitPreviews: "请等待所有选中项的预览完成后再应用。",
  previewError: "选中项的预览失败。修复错误后刷新预览，或暂不选择该 Agent。",
  selectAgents: "请至少选择一个 Agent。所有草稿都会保留，直到你应用或放弃。",
  refreshPreviews: "刷新预览",
  keepPending: "保留待写入",
  applySelected: "应用选中改动",
  willWriteRestKept: "将写入 {names}（先备份），其余保留待写入",
  changeCount: " · {n} 项",
  willWrite: "将写入 {names}（先备份）",
  willWriteRestDiscarded: "将写入 {names}（先备份），其余放弃",
  applyContinue: "应用并继续",
  discardContinue: "放弃并继续",
};

export default zh;
