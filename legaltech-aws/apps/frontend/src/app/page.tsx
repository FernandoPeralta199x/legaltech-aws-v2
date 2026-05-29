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

import { ThemeToggle } from "@/components/ThemeToggle";

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
    <div className="cv-public-shell">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand shadow-glow-teal">
              <Scale className="text-white" size={18} />
            </span>
            <span className="text-sm font-bold text-[var(--text)]">Contrato Visto</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              className="text-sm text-[var(--text2)] transition hover:text-[var(--teal)]"
              href="#como-funciona"
            >
              Como funciona
            </Link>
            <Link
              className="text-sm text-[var(--text2)] transition hover:text-[var(--teal)]"
              href="#produtos"
            >
              Produtos
            </Link>
            <Link
              className="text-sm text-[var(--text2)] transition hover:text-[var(--teal)]"
              href="#seguranca"
            >
              Segurança
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden sm:flex" />
            <Link
              className="hidden text-sm text-[var(--text2)] transition hover:text-[var(--teal)] sm:block"
              href="/login"
            >
              Entrar
            </Link>
            <Link
              className="cv-btn cv-btn-primary inline-flex items-center px-4 py-2 text-sm font-semibold"
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
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1.5">
            <Sparkles className="text-brand-teal" size={13} />
            <span className="text-xs font-semibold text-brand-teal">
              Plataforma LegalTech com IA
            </span>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Análise jurídica inteligente
            <br />
            <span className="text-gradient-brand">
              para contratos, partes e documentos
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600">
            Uma plataforma com inteligência artificial para agilizar a análise
            contratual, organizar casos, acompanhar etapas e entregar relatórios
            jurídicos com mais clareza e segurança.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-6 py-3 text-sm font-semibold text-white shadow-glow-teal hover:bg-brand-teal-dark transition"
              href="/login"
            >
              Solicitar demonstração
              <ArrowRight size={16} />
            </Link>
            <a
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
              href="#como-funciona"
            >
              Ver como funciona
            </a>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-brand-teal/30 bg-brand-teal/10 px-6 py-3 text-sm font-semibold text-brand-teal-dark hover:bg-brand-teal/20 transition"
              href="/login"
            >
              Entrar na plataforma
            </Link>
          </div>
        </div>

        {/* Dashboard preview mockup */}
        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-card-rest">
            <div className="mb-3 flex items-center gap-2 px-2">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-slate-500">dashboard — Contrato Visto</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { l: "Casos em análise", v: "3", c: "text-brand-teal" },
                { l: "Relatórios aprovados", v: "2", c: "text-teal-700" },
                { l: "Documentos enviados", v: "9", c: "text-violet-700" },
                { l: "Revisões pendentes", v: "1", c: "text-amber-700" }
              ].map((m) => (
                <div
                  className="rounded-lg border border-slate-200 bg-white p-4"
                  key={m.l}
                >
                  <p className="text-xs text-slate-600">{m.l}</p>
                  <p className={`mt-2 text-3xl font-bold ${m.c}`}>{m.v}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-700">Casos recentes</p>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-brand-teal">
                  Live
                </span>
              </div>
              {[
                { code: "CASO-2026-001", type: "Análise contratual", status: "Revisão humana", color: "border border-amber-200 bg-amber-50 text-amber-700" },
                { code: "CASO-2026-002", type: "Due diligence", status: "Análise IA", color: "border border-violet-200 bg-violet-50 text-violet-700" },
                { code: "CASO-2026-003", type: "Consulta de objeto", status: "Processando", color: "border border-emerald-200 bg-emerald-50 text-emerald-700" }
              ].map((c) => (
                <div
                  className="flex items-center justify-between border-t border-slate-100 py-2"
                  key={c.code}
                >
                  <div>
                    <p className="text-xs font-medium text-slate-800">{c.code}</p>
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
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              Como funciona
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Do envio do documento ao relatório final em 4 etapas claras.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                className="group relative rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-emerald-300 hover:bg-slate-100"
                key={step.num}
              >
                <span className="text-4xl font-black text-slate-950/10 group-hover:text-brand-teal/20 transition">
                  {step.num}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">
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
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              Tudo que você precisa
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  className="rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-emerald-200 hover:bg-slate-100"
                  key={feat.title}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200">
                    <Icon className="text-brand-teal" size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
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
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              Escolha o tipo de análise
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((p) => (
              <div
                className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-brand-teal/30"
                key={p.label}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-teal/10 border border-brand-teal/20">
                  <Zap className="text-brand-teal" size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{p.label}</p>
                  <p className="text-xs text-slate-600">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Segurança e confiança ──────────────────────────────── */}
      <section className="px-6 py-20" id="seguranca">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-brand-teal/20 bg-brand-teal/5 p-10 text-center">
            <Lock className="mx-auto mb-4 text-brand-teal" size={32} />
            <h2 className="text-2xl font-bold text-slate-950">
              Segurança e conformidade
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Construído com boas práticas de segurança, privacidade e compliance
              jurídico em cada etapa.
            </p>
            <ul className="mt-8 space-y-3">
              {trustItems.map((item) => (
                <li className="flex items-center justify-center gap-3" key={item}>
                  <CheckCircle2 className="shrink-0 text-brand-teal" size={16} />
                  <span className="text-sm text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-slate-950">
            Pronto para começar?
          </h2>
          <p className="mt-4 text-sm text-slate-600">
            Solicite uma demonstração e veja como o Contrato Visto pode
            transformar a análise jurídica da sua equipe.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-6 py-3 text-sm font-semibold text-white shadow-glow-teal hover:bg-brand-teal-dark transition"
              href="/login"
            >
              Solicitar demonstração
              <ArrowRight size={16} />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
              href="/login"
            >
              Entrar na plataforma
            </Link>
          </div>
        </div>
      </section>

      {/* ── Rodapé ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Scale className="text-brand-teal" size={18} />
            <span className="text-sm font-semibold text-slate-700">
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
