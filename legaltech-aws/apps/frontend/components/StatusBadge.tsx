import { cn } from "@/lib/cn";

type Cfg = {
  label: string;
  dot:   string;
  bg:    string;
  text:  string;
};

const map: Record<string, Cfg> = {
  /* ── Case ──────────────────────────────────────────────────────── */
  draft:                    { label: "Rascunho",       dot: "bg-slate-500",                       bg: "bg-slate-500/10",  text: "text-slate-400"  },
  submitted:                { label: "Enviado",         dot: "bg-blue-400",                        bg: "bg-blue-500/10",   text: "text-blue-300"   },
  triagem_pendente:         { label: "Triagem",         dot: "bg-amber-400",                       bg: "bg-amber-500/10",  text: "text-amber-300"  },
  coleta_pendente:          { label: "Coleta",          dot: "bg-orange-400",                      bg: "bg-orange-500/10", text: "text-orange-300" },
  processamento_documental: { label: "Processando",     dot: "bg-purple-400 animate-ping",         bg: "bg-purple-500/10", text: "text-purple-300" },
  analise_contratual:       { label: "Análise IA",      dot: "bg-violet-400 animate-ping",         bg: "bg-violet-500/10", text: "text-violet-300" },
  compliance:               { label: "Compliance",      dot: "bg-cyan-400",                        bg: "bg-cyan-500/10",   text: "text-cyan-300"   },
  minuta_relatorio:         { label: "Minuta",          dot: "bg-indigo-400",                      bg: "bg-indigo-500/10", text: "text-indigo-300" },
  revisao_humana:           { label: "Revisão humana",  dot: "bg-yellow-400 animate-pulse",        bg: "bg-yellow-500/10", text: "text-yellow-300" },
  processing:               { label: "Processando",     dot: "bg-purple-400 animate-ping",         bg: "bg-purple-500/10", text: "text-purple-300" },
  review:                   { label: "Revisão",         dot: "bg-yellow-400 animate-pulse",        bg: "bg-yellow-500/10", text: "text-yellow-300" },
  approved:                 { label: "Aprovado",        dot: "bg-teal-400",                        bg: "bg-teal-500/10",   text: "text-teal-300"   },
  delivered:                { label: "Entregue",        dot: "bg-emerald-400",                     bg: "bg-emerald-500/10",text: "text-emerald-300"},
  completed:                { label: "Concluído",       dot: "bg-green-400",                       bg: "bg-green-500/10",  text: "text-green-300"  },
  failed:                   { label: "Falha",           dot: "bg-red-400",                         bg: "bg-red-500/10",    text: "text-red-300"    },
  cancelled:                { label: "Cancelado",       dot: "bg-slate-600",                       bg: "bg-slate-600/10",  text: "text-slate-500"  },
  /* ── Document ───────────────────────────────────────────────────── */
  pending_upload:           { label: "Aguardando",      dot: "bg-slate-500",                       bg: "bg-slate-500/10",  text: "text-slate-400"  },
  uploaded:                 { label: "Enviado",         dot: "bg-blue-400",                        bg: "bg-blue-500/10",   text: "text-blue-300"   },
  processed:                { label: "Processado",      dot: "bg-teal-400",                        bg: "bg-teal-500/10",   text: "text-teal-300"   },
  validated:                { label: "Validado",        dot: "bg-emerald-400",                     bg: "bg-emerald-500/10",text: "text-emerald-300"},
  /* ── Report ─────────────────────────────────────────────────────── */
  in_review:                { label: "Em revisão",      dot: "bg-yellow-400 animate-pulse",        bg: "bg-yellow-500/10", text: "text-yellow-300" },
  /* ── Client / generic ───────────────────────────────────────────── */
  active:                   { label: "Ativo",           dot: "bg-emerald-400",                     bg: "bg-emerald-500/10",text: "text-emerald-300"},
  inactive:                 { label: "Inativo",         dot: "bg-slate-600",                       bg: "bg-slate-600/10",  text: "text-slate-500"  },
  /* ── Risk ───────────────────────────────────────────────────────── */
  low:                      { label: "Risco baixo",     dot: "bg-green-400",                       bg: "bg-green-500/10",  text: "text-green-300"  },
  medium:                   { label: "Risco médio",     dot: "bg-amber-400",                       bg: "bg-amber-500/10",  text: "text-amber-300"  },
  high:                     { label: "Risco alto",      dot: "bg-red-400",                         bg: "bg-red-500/10",    text: "text-red-300"    }
};

type StatusBadgeProps = {
  status:    string;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = map[status] ?? {
    label: status,
    dot:   "bg-slate-500",
    bg:    "bg-slate-500/10",
    text:  "text-slate-400"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px]",
        "text-[11px] font-semibold tracking-wide",
        cfg.bg,
        cfg.text,
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          cfg.dot
        )}
      />
      {cfg.label}
    </span>
  );
}
