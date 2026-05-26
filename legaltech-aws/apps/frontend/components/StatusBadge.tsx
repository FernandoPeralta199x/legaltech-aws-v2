import { cn } from "@/lib/cn";

type Cfg = {
  label: string;
  dot:   string;
  bg:    string;
  text:  string;
};

const map: Record<string, Cfg> = {
  /* ── Case ──────────────────────────────────────────────────────── */
  draft:                    { label: "Rascunho",       dot: "bg-slate-500",                       bg: "bg-slate-100",     text: "text-slate-700"   },
  submitted:                { label: "Enviado",         dot: "bg-blue-500",                        bg: "bg-blue-50",       text: "text-blue-700"    },
  triagem_pendente:         { label: "Triagem",         dot: "bg-amber-500",                       bg: "bg-amber-50",      text: "text-amber-700"   },
  coleta_pendente:          { label: "Coleta",          dot: "bg-orange-500",                      bg: "bg-orange-50",     text: "text-orange-700"  },
  processamento_documental: { label: "Processando",     dot: "bg-purple-500 animate-ping",         bg: "bg-purple-50",     text: "text-purple-700"  },
  analise_contratual:       { label: "Análise IA",      dot: "bg-violet-500 animate-ping",         bg: "bg-violet-50",     text: "text-violet-700"  },
  compliance:               { label: "Compliance",      dot: "bg-cyan-500",                        bg: "bg-cyan-50",       text: "text-cyan-700"    },
  minuta_relatorio:         { label: "Minuta",          dot: "bg-indigo-500",                      bg: "bg-indigo-50",     text: "text-indigo-700"  },
  revisao_humana:           { label: "Revisão humana",  dot: "bg-yellow-500 animate-pulse",        bg: "bg-yellow-50",     text: "text-yellow-700"  },
  processing:               { label: "Processando",     dot: "bg-purple-500 animate-ping",         bg: "bg-purple-50",     text: "text-purple-700"  },
  review:                   { label: "Revisão",         dot: "bg-yellow-500 animate-pulse",        bg: "bg-yellow-50",     text: "text-yellow-700"  },
  approved:                 { label: "Aprovado",        dot: "bg-teal-500",                        bg: "bg-teal-50",       text: "text-teal-700"    },
  delivered:                { label: "Entregue",        dot: "bg-emerald-500",                     bg: "bg-emerald-50",    text: "text-emerald-700" },
  completed:                { label: "Concluído",       dot: "bg-green-500",                       bg: "bg-green-50",      text: "text-green-700"   },
  failed:                   { label: "Falha",           dot: "bg-red-500",                         bg: "bg-red-50",        text: "text-red-700"     },
  cancelled:                { label: "Cancelado",       dot: "bg-slate-600",                       bg: "bg-slate-100",     text: "text-slate-600"   },
  /* ── Document ───────────────────────────────────────────────────── */
  pending_upload:           { label: "Aguardando",      dot: "bg-slate-500",                       bg: "bg-slate-100",     text: "text-slate-700"   },
  uploaded:                 { label: "Enviado",         dot: "bg-blue-500",                        bg: "bg-blue-50",       text: "text-blue-700"    },
  processed:                { label: "Processado",      dot: "bg-teal-500",                        bg: "bg-teal-50",       text: "text-teal-700"    },
  validated:                { label: "Validado",        dot: "bg-emerald-500",                     bg: "bg-emerald-50",    text: "text-emerald-700" },
  /* ── Report ─────────────────────────────────────────────────────── */
  in_review:                { label: "Em revisão",      dot: "bg-yellow-500 animate-pulse",        bg: "bg-yellow-50",     text: "text-yellow-700"  },
  /* ── Client / generic ───────────────────────────────────────────── */
  active:                   { label: "Ativo",           dot: "bg-emerald-500",                     bg: "bg-emerald-50",    text: "text-emerald-700" },
  inactive:                 { label: "Inativo",         dot: "bg-slate-600",                       bg: "bg-slate-100",     text: "text-slate-600"   },
  /* ── Risk ───────────────────────────────────────────────────────── */
  low:                      { label: "Risco baixo",     dot: "bg-green-500",                       bg: "bg-green-50",      text: "text-green-700"   },
  medium:                   { label: "Risco médio",     dot: "bg-amber-500",                       bg: "bg-amber-50",      text: "text-amber-700"   },
  high:                     { label: "Risco alto",      dot: "bg-red-500",                         bg: "bg-red-50",        text: "text-red-700"     }
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
    text:  "text-slate-700"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-current/10 px-2.5 py-[3px]",
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
