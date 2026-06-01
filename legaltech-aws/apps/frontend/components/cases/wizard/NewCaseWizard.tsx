"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { WizardActions, WizardShell } from "@/components/wizard";
import { Notification } from "@/components/Notification";
import {
  MATRIZ,
  type Modulo,
  type Produto
} from "@/lib/produtoConfig";

import { ContractStep } from "./ContractStep";
import { ModulesStep } from "./ModulesStep";
import { PartiesStep } from "./PartiesStep";
import { ProductStep } from "./ProductStep";
import { ReviewStep } from "./ReviewStep";
import {
  newParty,
  partyIsComplete,
  type Party,
  type WizardFile
} from "./types";

const TOTAL_STEPS = 5;

const STEP_TITLES: Record<number, string> = {
  1: "Identifique partes e cliente",
  2: "Anexe contrato ou documento",
  3: "Escolha o produto jurídico",
  4: "Ajuste os módulos da análise",
  5: "Revise o Novo Pedido"
};

function defaultModulesFor(produto: Produto): Record<Modulo, boolean> {
  const matriz = MATRIZ[produto];
  const next = {} as Record<Modulo, boolean>;
  (Object.keys(matriz) as Modulo[]).forEach((m) => {
    next[m] = matriz[m].default;
  });
  return next;
}

export function NewCaseWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitNotice, setSubmitNotice] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const [parties, setParties] = useState<Party[]>(() => [newParty()]);
  const [arquivo, setArquivo] = useState<WizardFile | null>(null);
  const [produto, setProduto] = useState<Produto | null>(null);
  const [modulos, setModulos] = useState<Record<Modulo, boolean>>(
    () => ({}) as Record<Modulo, boolean>
  );

  function handleProductChange(next: Produto) {
    setProduto(next);
    if (next !== produto) {
      setModulos(defaultModulesFor(next));
    }
  }

  const canAdvance = useMemo(() => {
    if (step === 1) {
      return parties.length > 0 && parties.every(partyIsComplete);
    }
    if (step === 2) {
      return Boolean(arquivo && arquivo.status === "done");
    }
    if (step === 3) {
      return Boolean(produto);
    }
    if (step === 4) {
      return Boolean(produto);
    }
    if (step === 5) {
      return Boolean(produto && arquivo?.status === "done");
    }
    return false;
  }, [step, parties, arquivo, produto]);

  async function handleSubmit() {
    if (!canAdvance || !produto) return;
    setSubmitting(true);
    setSubmitNotice({
      title: "Simulação concluída",
      description:
        "Nenhum pedido foi enviado para um backend real. Você será redirecionado para Casos para seguir o fluxo operacional do MVP local."
    });
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);
    router.push("/cases");
  }

  return (
    <WizardShell
      backHref="/cases"
      description="Preencha as informações que futuramente poderão originar um caso real. Nesta etapa, tudo permanece no frontend."
      step={step}
      title={STEP_TITLES[step]}
      totalSteps={TOTAL_STEPS}
    >
      {submitNotice && (
        <Notification compact tone="success" title={submitNotice.title}>
          {submitNotice.description}
        </Notification>
      )}

      {step === 1 && <PartiesStep onChange={setParties} parties={parties} />}
      {step === 2 && <ContractStep arquivo={arquivo} onChange={setArquivo} />}
      {step === 3 && <ProductStep onChange={handleProductChange} produto={produto} />}
      {step === 4 && produto && (
        <ModulesStep onChange={setModulos} produto={produto} state={modulos} />
      )}
      {step === 5 && produto && (
        <ReviewStep
          arquivo={arquivo}
          modulos={modulos}
          parties={parties}
          produto={produto}
        />
      )}

      <WizardActions
        canAdvance={canAdvance}
        onBack={() => setStep((s) => Math.max(1, s - 1))}
        onNext={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
        onSubmit={handleSubmit}
        submitLabel="Concluir simulação"
        step={step}
        submitting={submitting}
        totalSteps={TOTAL_STEPS}
      />
    </WizardShell>
  );
}
