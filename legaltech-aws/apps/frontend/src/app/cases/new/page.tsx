"use client";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Check,
  FileSearch,
  Plus,
  Send,
  Trash2,
  Upload,
  Users
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { AuthGuard } from "@/components/AuthGuard";
import { Button } from "@/components/Button";
import { UploadBox } from "@/components/UploadBox";
import { mockClients } from "@/lib/mockData";

const STEPS = [
  "Produto",
  "Dados do caso",
  "Partes",
  "Objeto",
  "Documentos",
  "Revisão"
];

const products = [
  {
    id: "dados_partes",
    label: "Dados das Partes",
    desc: "Verificação cadastral das partes envolvidas no contrato.",
    icon: Users
  },
  {
    id: "consulta_objeto",
    label: "Consulta do Objeto",
    desc: "Análise do bem, imóvel ou serviço objeto do contrato.",
    icon: FileSearch
  },
  {
    id: "analise_contratual",
    label: "Análise Contratual",
    desc: "Análise completa de cláusulas, riscos e recomendações.",
    icon: BriefcaseBusiness
  },
  {
    id: "reuniao_equipe",
    label: "Reunião com Advogado",
    desc: "Sessão de consultoria jurídica com especialista da equipe.",
    icon: Bot
  }
];

const contractTypes = [
  { id: "compra_venda", label: "Compra e Venda" },
  { id: "prestacao_servicos", label: "Prestação de Serviços" },
  { id: "locacao", label: "Locação" },
  { id: "parceria", label: "Parceria" },
  { id: "confidencialidade", label: "Confidencialidade (NDA)" },
  { id: "due_diligence", label: "Due Diligence" },
  { id: "outro", label: "Outro" }
];

const partyTypes = [
  "contratante",
  "contratada",
  "avalista",
  "fiador",
  "testemunha",
  "outro"
];

type Party = {
  name: string;
  document: string;
  type: string;
  email: string;
  phone: string;
  notes: string;
};

export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [product, setProduct] = useState("analise_contratual");
  const [caseName, setCaseName] = useState("");
  const [contractType, setContractType] = useState("compra_venda");
  const [priority, setPriority] = useState("normal");
  const [clientId, setClientId] = useState(mockClients[0].id);
  const [notes, setNotes] = useState("");

  const [parties, setParties] = useState<Party[]>([
    { name: "", document: "", type: "contratante", email: "", phone: "", notes: "" }
  ]);

  const [objectType, setObjectType] = useState("");
  const [objectDesc, setObjectDesc] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [objectNotes, setObjectNotes] = useState("");

  function addParty() {
    setParties((prev) => [
      ...prev,
      { name: "", document: "", type: "contratada", email: "", phone: "", notes: "" }
    ]);
  }

  function removeParty(i: number) {
    setParties((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateParty(i: number, field: keyof Party, value: string) {
    setParties((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p))
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    router.push("/cases");
  }

  const selectedProduct = products.find((p) => p.id === product);
  const selectedClient = mockClients.find((c) => c.id === clientId);

  return (
    <AuthGuard>
      <AppLayout>
        {/* Header */}
        <div className="mb-8">
          <Link
            className="mb-4 flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
            href="/cases"
          >
            <ArrowLeft size={14} />
            Voltar para casos
          </Link>
          <h1 className="text-2xl font-bold text-white">Criar novo caso</h1>
          <p className="mt-1 text-sm text-slate-400">
            Preencha as informações para iniciar a análise jurídica.
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 overflow-x-auto">
          <ol className="flex min-w-max items-center gap-0">
            {STEPS.map((label, idx) => {
              const done = idx < step;
              const current = idx === step;
              return (
                <li className="flex items-center" key={label}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                        done
                          ? "border-teal-500 bg-teal-500 text-white"
                          : current
                          ? "border-brand-blue bg-brand-blue/20 text-brand-blue-light shadow-glow"
                          : "border-white/[0.12] bg-white/[0.04] text-slate-500"
                      }`}
                    >
                      {done ? <Check size={14} /> : idx + 1}
                    </div>
                    <span
                      className={`mt-1.5 whitespace-nowrap text-[11px] font-medium ${
                        current
                          ? "text-brand-blue-light"
                          : done
                          ? "text-teal-400"
                          : "text-slate-500"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`mx-3 h-px w-12 transition ${
                        done ? "bg-teal-500" : "bg-white/[0.08]"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mx-auto max-w-2xl">
          {/* Step 0: Product */}
          {step === 0 && (
            <div className="animate-in">
              <h2 className="mb-1 text-lg font-semibold text-white">
                Escolha o produto
              </h2>
              <p className="mb-6 text-sm text-slate-400">
                Selecione o tipo de análise jurídica que deseja realizar.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {products.map((p) => {
                  const Icon = p.icon;
                  const active = product === p.id;
                  return (
                    <button
                      className={`group flex flex-col gap-3 rounded-xl border p-5 text-left transition-all ${
                        active
                          ? "border-brand-blue/40 bg-brand-blue/10 shadow-glow"
                          : "border-white/[0.08] bg-white/[0.02] hover:border-brand-blue/20 hover:bg-white/[0.04]"
                      }`}
                      key={p.id}
                      onClick={() => setProduct(p.id)}
                      type="button"
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                          active
                            ? "border-brand-blue/40 bg-brand-blue/20 text-brand-blue-light"
                            : "border-white/[0.08] bg-white/[0.04] text-slate-400"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div>
                        <p
                          className={`text-sm font-semibold ${
                            active ? "text-white" : "text-slate-200"
                          }`}
                        >
                          {p.label}
                        </p>
                        <p className="mt-0.5 text-xs leading-4 text-slate-400">
                          {p.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Case data */}
          {step === 1 && (
            <div className="animate-in space-y-5">
              <div>
                <h2 className="mb-1 text-lg font-semibold text-white">Dados do caso</h2>
                <p className="text-sm text-slate-400">
                  Informações básicas sobre o caso jurídico.
                </p>
              </div>

              <Field label="Nome do caso">
                <input
                  className={inputClass}
                  onChange={(e) => setCaseName(e.target.value)}
                  placeholder="Ex: Contrato de Compra e Venda — Imóvel Alpha"
                  value={caseName}
                />
              </Field>

              <Field label="Cliente vinculado">
                <select
                  className={inputClass}
                  onChange={(e) => setClientId(e.target.value)}
                  value={clientId}
                >
                  {mockClients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tipo de contrato">
                  <select
                    className={inputClass}
                    onChange={(e) => setContractType(e.target.value)}
                    value={contractType}
                  >
                    {contractTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Prioridade">
                  <select
                    className={inputClass}
                    onChange={(e) => setPriority(e.target.value)}
                    value={priority}
                  >
                    <option value="low">Baixa</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </Field>
              </div>

              <Field label="Observações">
                <textarea
                  className={`${inputClass} min-h-24 resize-y`}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Informações adicionais relevantes para análise..."
                  value={notes}
                />
              </Field>
            </div>
          )}

          {/* Step 2: Parties */}
          {step === 2 && (
            <div className="animate-in">
              <div className="mb-6">
                <h2 className="mb-1 text-lg font-semibold text-white">Partes envolvidas</h2>
                <p className="text-sm text-slate-400">
                  Cadastre todas as partes do contrato ou operação.
                </p>
              </div>

              <div className="space-y-4">
                {parties.map((party, i) => (
                  <div
                    className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5"
                    key={i}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-300">
                        Parte {i + 1}
                      </p>
                      {parties.length > 1 && (
                        <button
                          className="flex items-center gap-1.5 text-[11px] text-red-400 hover:text-red-300 transition"
                          onClick={() => removeParty(i)}
                          type="button"
                        >
                          <Trash2 size={12} />
                          Remover
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Nome completo / Razão social">
                        <input
                          className={inputClass}
                          onChange={(e) => updateParty(i, "name", e.target.value)}
                          placeholder="Nome da parte"
                          value={party.name}
                        />
                      </Field>
                      <Field label="Tipo de parte">
                        <select
                          className={inputClass}
                          onChange={(e) => updateParty(i, "type", e.target.value)}
                          value={party.type}
                        >
                          {partyTypes.map((t) => (
                            <option key={t} value={t}>
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="CPF / CNPJ">
                        <input
                          className={inputClass}
                          onChange={(e) => updateParty(i, "document", e.target.value)}
                          placeholder="Documento (protegido)"
                          value={party.document}
                        />
                      </Field>
                      <Field label="E-mail">
                        <input
                          className={inputClass}
                          onChange={(e) => updateParty(i, "email", e.target.value)}
                          placeholder="email@exemplo.com"
                          type="email"
                          value={party.email}
                        />
                      </Field>
                      <Field label="Telefone">
                        <input
                          className={inputClass}
                          onChange={(e) => updateParty(i, "phone", e.target.value)}
                          placeholder="+55 11 99999-0000"
                          value={party.phone}
                        />
                      </Field>
                      <Field label="Observações">
                        <input
                          className={inputClass}
                          onChange={(e) => updateParty(i, "notes", e.target.value)}
                          placeholder="Observações sobre esta parte"
                          value={party.notes}
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-white/[0.12] bg-white/[0.02] px-4 py-3 text-xs font-medium text-slate-400 hover:border-brand-blue/30 hover:text-brand-blue-light w-full justify-center transition"
                onClick={addParty}
                type="button"
              >
                <Plus size={14} />
                Adicionar outra parte
              </button>
            </div>
          )}

          {/* Step 3: Object */}
          {step === 3 && (
            <div className="animate-in space-y-5">
              <div>
                <h2 className="mb-1 text-lg font-semibold text-white">Objeto do contrato</h2>
                <p className="text-sm text-slate-400">
                  Descreva o objeto ou bem envolvido na operação.
                </p>
              </div>

              <Field label="Tipo de objeto">
                <select className={inputClass} onChange={(e) => setObjectType(e.target.value)} value={objectType}>
                  <option value="">Selecione...</option>
                  <option value="imovel">Imóvel</option>
                  <option value="servico">Serviço</option>
                  <option value="bem_movel">Bem móvel</option>
                  <option value="participacao">Participação societária</option>
                  <option value="outro">Outro</option>
                </select>
              </Field>

              <Field label="Descrição do objeto">
                <textarea
                  className={`${inputClass} min-h-24 resize-y`}
                  onChange={(e) => setObjectDesc(e.target.value)}
                  placeholder="Descreva detalhadamente o objeto do contrato..."
                  value={objectDesc}
                />
              </Field>

              <Field label="Valor estimado (R$)">
                <input
                  className={inputClass}
                  onChange={(e) => setEstimatedValue(e.target.value)}
                  placeholder="0,00"
                  type="number"
                  value={estimatedValue}
                />
              </Field>

              <Field label="Informações adicionais">
                <textarea
                  className={`${inputClass} min-h-20 resize-y`}
                  onChange={(e) => setObjectNotes(e.target.value)}
                  placeholder="Características especiais, restrições, histórico..."
                  value={objectNotes}
                />
              </Field>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="animate-in">
              <div className="mb-6">
                <h2 className="mb-1 text-lg font-semibold text-white">Upload de documentos</h2>
                <p className="text-sm text-slate-400">
                  Envie contratos, certidões, documentos das partes e materiais complementares.
                </p>
              </div>
              <UploadBox />
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="animate-in">
              <div className="mb-6">
                <h2 className="mb-1 text-lg font-semibold text-white">Revisão antes de enviar</h2>
                <p className="text-sm text-slate-400">
                  Confirme as informações antes de enviar para análise.
                </p>
              </div>

              <div className="space-y-4">
                <ReviewSection label="Produto selecionado">
                  <p className="text-sm text-slate-100">{selectedProduct?.label}</p>
                  <p className="text-xs text-slate-400">{selectedProduct?.desc}</p>
                </ReviewSection>

                <ReviewSection label="Dados do caso">
                  <dl className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-[11px] text-slate-500">Nome</dt>
                      <dd className="text-xs text-slate-200">{caseName || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-500">Cliente</dt>
                      <dd className="text-xs text-slate-200">{selectedClient?.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-500">Tipo de contrato</dt>
                      <dd className="text-xs text-slate-200">{contractType}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] text-slate-500">Prioridade</dt>
                      <dd className="text-xs text-slate-200">{priority}</dd>
                    </div>
                  </dl>
                  {notes && (
                    <p className="mt-2 text-xs text-slate-400">{notes}</p>
                  )}
                </ReviewSection>

                <ReviewSection label={`Partes (${parties.length})`}>
                  {parties.map((p, i) => (
                    <div className="py-1" key={i}>
                      <p className="text-xs font-medium text-slate-200">
                        {p.name || "—"} <span className="text-slate-500">({p.type})</span>
                      </p>
                    </div>
                  ))}
                </ReviewSection>

                <ReviewSection label="Objeto do contrato">
                  <p className="text-xs text-slate-200">{objectDesc || "—"}</p>
                </ReviewSection>

                <div className="rounded-xl border border-brand-blue/20 bg-brand-blue/5 p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Send className="text-brand-blue" size={16} />
                    <p className="text-sm font-semibold text-white">
                      Pronto para enviar
                    </p>
                  </div>
                  <p className="text-xs leading-5 text-slate-400">
                    Ao confirmar, o caso será criado e os agentes de análise serão
                    ativados. O relatório final só será disponibilizado após revisão
                    humana de um analista especializado.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-white/[0.06] pt-6">
            <button
              className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.07] transition disabled:opacity-40"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              type="button"
            >
              <ArrowLeft size={15} />
              Anterior
            </button>

            {step < STEPS.length - 1 ? (
              <button
                className="flex items-center gap-2 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-glow hover:bg-brand-blue-dark transition"
                onClick={() => setStep((s) => s + 1)}
                type="button"
              >
                Próximo
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                className={`flex items-center gap-2 rounded-lg bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white shadow-glow-teal hover:bg-brand-teal-dark transition ${
                  submitting ? "opacity-70 cursor-wait" : ""
                }`}
                disabled={submitting}
                onClick={handleSubmit}
                type="button"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Enviar para análise
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </AppLayout>
    </AuthGuard>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none transition focus:border-brand-blue/40 focus:bg-white/[0.06] [&_option]:bg-surface-800";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1.5 text-xs font-medium text-slate-400">{label}</label>
      {children}
    </div>
  );
}

function ReviewSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-5">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      {children}
    </div>
  );
}
