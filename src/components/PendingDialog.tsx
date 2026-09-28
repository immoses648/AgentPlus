import { useState } from "react";
import type { AgentId, AgentState } from "../api";
import { type Draft, agentsWithOps, opCount } from "../draft";
import { t, tn } from "../i18n";
import { AgentIcon } from "./icons";
import { usePreviews } from "../hooks";
import { joinList } from "../format";
import { ErrorBox, Seg } from "./controls";
import { Modal } from "./Modal";
import { DiffGroups } from "./Aside";
import { previewReadiness } from "../review";

interface Props {
  title: string;
  agents: AgentState[];
  drafts: Record<string, Draft>;
  busy: boolean;
  /** Review keeps unselected drafts; leaving explicitly discards them. */
  mode?: "leave" | "review";
  error?: string | null;
  /** The caller only discards unselected changes in leave mode. */
  onConfirm: (apply: AgentId[]) => void;
  onCancel: () => void;
}

/** Reviews pending writes; environment switching also offers an explicit discard choice. */
export function PendingDialog({ title, agents, drafts, busy, mode = "leave", error, onConfirm, onCancel }: Props) {
  const withOps = agentsWithOps(agents, drafts);
  const [keep, setKeep] = useState<Record<string, boolean>>(() => Object.fromEntries(withOps.map((a) => [a.id, true])));
  const [revision, setRevision] = useState(0);
  const diffs = usePreviews(agents, drafts, revision);

  const applying = withOps.filter((a) => keep[a.id]);
  const ids = applying.map((a) => a.id);
  const readiness = previewReadiness(ids, diffs);
  const blocked = busy || readiness === "loading" || readiness === "error" || (mode === "review" && readiness === "empty");
  const rest = withOps.length > applying.length;
  return (
    // Like the backdrop and the close button, Esc does nothing while the changes are being written.
    <Modal label={title} title={title} wide busy={busy} onClose={onCancel} foot={<>
      <span className="muted tiny grow">
        {readiness === "loading" ? t("pendingDialog.waitPreviews") : readiness === "error" ? t("pendingDialog.previewError")
          : !applying.length ? t(mode === "review" ? "pendingDialog.selectAgents" : "common.discardAll")
          : t(rest ? mode === "review" ? "pendingDialog.willWriteRestKept" : "pendingDialog.willWriteRestDiscarded" : "pendingDialog.willWrite", { names: joinList(applying.map((a) => a.name)) })}
      </span>
      <button className="btn" disabled={busy} onClick={onCancel}>{t("common.cancel")}</button>
      <button className="btn primary" disabled={blocked} onClick={() => { if (!blocked) onConfirm(ids); }}>
        {t(busy ? "common.writing" : mode === "review" ? "pendingDialog.applySelected" : applying.length ? "pendingDialog.applyContinue" : "pendingDialog.discardContinue")}
      </button>
    </>}>
      <span className="muted small">{t(mode === "review" ? "pendingDialog.reviewIntro" : "pendingDialog.intro")}</span>
      <span className="muted small">{t("pendingDialog.partialNote")}</span>
      {error && <ErrorBox text={error} alert />}
      <button className="btn small" disabled={busy} onClick={() => setRevision((r) => r + 1)}>{t("pendingDialog.refreshPreviews")}</button>
      {withOps.map((a) => {
        const d = diffs[a.id];
        const on = keep[a.id];
        return (
          <section key={a.id} className={`pend${!on && mode === "leave" ? " drop" : ""}`}>
            <div className="row gap10">
              <AgentIcon id={a.id} size={24} />
              <strong className="grow">{a.name}<span className="tiny muted">{tn("pendingDialog.changeCount", opCount(drafts[a.id]))}</span></strong>
              <Seg value={on ? "apply" : "skip"} label={a.name} onChange={(value) => setKeep((k) => ({ ...k, [a.id]: value === "apply" }))}
                options={[{ value: "apply", label: t("common.apply"), disabled: busy }, { value: "skip", label: <span style={mode === "leave" ? { color: "var(--del)" } : undefined}>{t(mode === "review" ? "pendingDialog.keepPending" : "common.discard")}</span>, disabled: busy }]} />
            </div>
            {typeof d === "string" && <ErrorBox text={d} />}
            {Array.isArray(d) && (
              <div className="pend-lines">
                <DiffGroups groups={d} />
              </div>
            )}
            {d === undefined && <span className="tiny muted">{t("common.reading")}</span>}
          </section>
        );
      })}
    </Modal>
  );
}
