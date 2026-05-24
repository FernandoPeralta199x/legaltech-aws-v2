import { AlertCircle, CheckCircle2, Clock, Loader2, Play, SkipForward } from "lucide-react";

import type { AgentExecution } from "@/types";
import { cn } from "@/lib/cn";

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 60000) return `${(ms / 1000).toFixed(0)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
}

const agentTypeLabel: Record<string, string> = {
  triagem: "Triagem",
  coleta: "Coleta Externa",
  doc_processor: "Processador Documental",
  contrato_analyzer: "Análise Contratual",
  compliance: "Compliance",
  report_writer: "Gerador de Relatório"
};

type AgentCardProps = {
  execution: AgentExecution;
};

export function AgentCard({ execution }: AgentCardProps) {
  const statusIcon = {
    queued: <Clock className="text-slate-400" size={16} />,
    running: <Loader2 className="animate-spin text-brand-blue" size={16} />,
    completed: <CheckCircle2 className="text-teal-400" size={16} />,
    failed: <AlertCircle className="text-red-400" size={16} />,
    skipped: <SkipForward className="text-slate-500" size={16} />
  };

  const statusClass: Record<string, string> = {
    queued: "border-white/[0.08] bg-white/[0.02]",
    running: "border-brand-blue/30 bg-brand-blue/5 shadow-glow",
    completed: "border-teal-500/20 bg-teal-500/5",
    failed: "border-red-500/20 bg-red-500/5",
    skipped: "border-white/[0.06] bg-white/[0.02] opacity-60"
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        statusClass[execution.status]
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
              execution.status === "running"
                ? "border-brand-blue/30 bg-brand-blue/10"
                : execution.status === "completed"
                ? "border-teal-500/20 bg-teal-500/10"
                : execution.status === "failed"
                ? "border-red-500/20 bg-red-500/10"
                : "border-white/[0.08] bg-white/[0.04]"
            )}
          >
            {statusIcon[execution.status]}
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-100">
              {execution.agentName}
            </p>
            <p className="text-[11px] text-slate-500">
              {agentTypeLabel[execution.agentType] ?? execution.agentType}
            </p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400">
          {formatDuration(execution.durationMs)}
        </span>
      </div>

      {execution.outputSummary && (
        <p className="mt-3 text-xs leading-5 text-slate-300">
          {execution.outputSummary}
        </p>
      )}

      {execution.errorMessage && (
        <p className="mt-2 text-xs text-red-300">{execution.errorMessage}</p>
      )}

      {execution.status === "running" && (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-1 w-1/2 animate-pulse rounded-full bg-brand-blue" />
        </div>
      )}
    </div>
  );
}
