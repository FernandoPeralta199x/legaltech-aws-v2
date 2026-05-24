import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileSearch,
  Lock,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  Zap
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: FileSearch,
    title: "Análise Contratual",
    description:
      "IA identifica cláusulas críticas, riscos e inconsistências em contratos complexos em minutos."
  },
  {
    icon: Bot,
    title: "Agentes Especializados",
    description:
      "Pipeline de agentes autônomos: triagem, processamento documental, compliance e geração de relatório."
  },
  {
    icon: Users,
    title: "Consulta de Partes",
    description:
      "Verificação automática de dados das partes envolvidas com validação e histórico jurídico."
  },
  {
    icon: ShieldCheck,
    title: "Due Diligence",
    description:
      "Análise completa de documentação, certidões e riscos para tomada de decisão segura."
  },
  {
    icon: Lock,
    title: "Revisão Humana Obrigatória",
    description:
      "Nenhum relatório é entregue sem validação de um analista jurídico. Segurança e responsabilidade."
  },
  {
    icon: Sparkles,
    title: "Relatórios Profissionais",
    description:
      "Relatórios claros, objetivos e estruturados, prontos para uso jurídico e tomada de decisão."
  }
];

const steps = [
  {
    num: "01",
    title: "Crie um caso",
    description: "Escolha o produto, informe as partes e faça upload dos documentos."
  },
  {
    num: "02",
    title: "IA processa tudo",
    description:
      "Agentes especializados analisam, extraem insights e identificam riscos automaticamente."
  },
  {
    num: "03",
    title: "Analista revisa",
    description:
      "Um especialista jurídico valida o relatório antes de qualquer entrega ao cliente."
  },
  {
    num: "04",
    title: "Relatório entregue",
    description:
      "Relatório final aprovado, com riscos, recomendações e documentação estruturada."
  }
];

const products = [
  { label: "Dados das Partes", desc: "Verificação cadastral e histórico" },
  { label: "Consulta do Objeto", desc: "Análise do bem ou serviço contratado" },
  { label: "Análise Contratual", desc: "Cláusulas, riscos e recomendações" },
  { label: "Reunião com Advogado", desc: "Consultoria especializada online" }
];

const trustItems = [
  "Dados processados em ambiente seguro",
  "Sem armazenamento de documentos sensíveis em texto",
  "Revisão humana obrigatória antes da entrega",
  "Auditoria completa de todas as ações",
  "LGPD compliance por design"
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-900 text-slate-100">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-surface-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-brand shadow-glow-teal">
              <Scale className="text-white" size={18} />
            </span>
            <span className="text-sm font-bold text-white">Contrato Visto</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              className="text-sm text-slate-400 transition hover:text-slate-100"
              href="#como-funciona"
            >
              Como funciona
            </Link>
            <Link
              className="text-sm text-slate-400 transition hover:text-slate-100"
              href="#produtos"
            >
              Produtos
            </Link>
            <Link
              className="text-sm text-slate-400 transition hover:text-slate-100"
              href="#seguranca"
            >
              Segurança
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              className="hidden text-sm text-slate-300 hover:text-white transition sm:block"
              href="/login"
            >
              Entrar
            </Link>
            <Link
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white shadow-glow hover:bg-brand-blue-dark transition"
              href="/login"
            >
              Solicitar demo
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-20 pt-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-glow" />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-blue/30 bg-brand-blue/10 px-4 py-1.5">
            <Sparkles className="text-brand-blue-light" size={13} />
            <span className="text-xs font-semibold text-brand-blue-light">
              Plataforma LegalTech com IA
            </span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Análise jurídica inteligente
            <br />
            <span className="text-gradient-brand">
              para contratos, partes e documentos
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400">
            Uma plataforma com inteligência artificial para agilizar a análise
            contratual, organizar casos, acompanhar etapas e entregar relatórios
            jurídicos com mais clareza e segurança.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-glow hover:bg-brand-blue-dark transition"
              href="/login"
            >
              Solicitar demonstração
              <ArrowRight size={16} />
            </Link>
            <a
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-white/[0.08] transition"
              href="#como-funciona"
            >
              Ver como funciona
            </a>
            <Link
              className="inline-flex items-center gap-2 rounded-xl border border-brand-teal/30 bg-brand-teal/10 px-6 py-3 text-sm font-semibold text-brand-teal-light hover:bg-brand-teal/20 transition"
              href="/login"
            >
              Entrar na plataforma
            </Link>
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="rounded-2xl border border-white/[0.08] bg-surface-800 p-4 shadow-card">
            <div className="mb-3 flex items-center gap-2 px-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-slate-500">dashboard — Contrato Visto</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { l: "Casos em análise", v: "3", c: "text-brand-blue-light" },
                { l: "Relatórios aprovados", v: "2", c: "text-teal-400" },
                { l: "Documentos enviados", v: "9", c: "text-violet-400" },
                { l: "Revisões pendentes", v: "1", c: "text-amber-400" }
              ].map((m) => (
                <div
                  className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4"
                  key={m.l}
                >
                  <p className="text-xs text-slate-400">{m.l}</p>
                  <p className={`mt-2 text-3xl font-bold ${m.c}`}>{m.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-300">Casos recentes</p>
                <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] text-brand-blue-light">
                  Live
                </span>
              </div>
              {[
                { code: "CASO-2026-001", type: "Análise contratual", status: "Revisão humana", color: "text-yellow-400 bg-yellow-500/10" },
                { code: "CASO-2026-002", type: "Due diligence", status: "Análise IA", color: "text-violet-400 bg-violet-500/10" },
                { code: "CASO-2026-003", type: "Consulta de objeto", status: "Processando", color: "text-purple-400 bg-purple-500/10" }
              ].map((c) => (
                <div
                  className="flex items-center justify-between border-t border-white/[0.04] py-2"
                  key={c.code}
                >
                  <div>
                    <p className="text-xs font-medium text-slate-200">{c.code}</p>
                    <p className="text-[11px] text-slate-500">{c.type}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.color}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Como funciona ──────────────────────────────────────── */}
      <section className="px-6 py-20" id="como-funciona">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal">
              Processo
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              Como funciona
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Do envio do documento ao relatório final em 4 etapas claras.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                className="group relative rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all hover:border-brand-blue/30 hover:bg-white/[0.05]"
                key={step.num}
              >
                <span className="text-4xl font-black text-white/10 group-hover:text-brand-blue/20 transition">
                  {step.num}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-slate-100">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal">
              Funcionalidades
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              Tudo que você precisa
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all hover:border-brand-blue/20 hover:bg-white/[0.05]"
                  key={feat.title}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/10 border border-brand-blue/20">
                    <Icon className="text-brand-blue-light" size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Produtos ───────────────────────────────────────────── */}
      <section className="px-6 py-20" id="produtos">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-teal">
              Produtos
            </p>
            <h2 className="mt-2 text-3xl font-bold text-white">
              Escolha o tipo de análise
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((p) => (
              <div
                className="flex items-center gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all hover:border-brand-teal/30"
                key={p.label}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 border border-brand-teal/20">
                  <Zap className="text-brand-teal" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">{p.label}</p>
                  <p className="text-xs text-slate-400">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Segurança e confiança ──────────────────────────────── */}
      <section className="px-6 py-20" id="seguranca">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-brand-teal/20 bg-brand-teal/5 p-10 text-center">
            <Lock className="mx-auto mb-4 text-brand-teal" size={32} />
            <h2 className="text-2xl font-bold text-white">
              Segurança e conformidade
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Construído com boas práticas de segurança, privacidade e compliance
              jurídico em cada etapa.
            </p>
            <ul className="mt-8 space-y-3">
              {trustItems.map((item) => (
                <li className="flex items-center justify-center gap-3" key={item}>
                  <CheckCircle2 className="shrink-0 text-brand-teal" size={16} />
                  <span className="text-sm text-slate-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white">
            Pronto para começar?
          </h2>
          <p className="mt-4 text-sm text-slate-400">
            Solicite uma demonstração e veja como o Contrato Visto pode
            transformar a análise jurídica da sua equipe.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-glow hover:bg-brand-blue-dark transition"
              href="/login"
            >
              Solicitar demonstração
              <ArrowRight size={16} />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-6 py-3 text-sm font-semibold text-slate-200 hover:bg-white/[0.08] transition"
              href="/login"
            >
              Entrar na plataforma
            </Link>
          </div>
        </div>
      </section>

      {/* ── Rodapé ─────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Scale className="text-brand-teal" size={18} />
            <span className="text-sm font-semibold text-slate-300">
              Contrato Visto
            </span>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 Contrato Visto — Análise jurídica inteligente. Dados
            demonstrativos, sem contratos reais.
          </p>
        </div>
      </footer>
    </div>
  );
}
