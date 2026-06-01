"use client";

import { ContractDropzone } from "./ContractDropzone";
import type { WizardFile } from "./types";

type ContractStepProps = {
  arquivo: WizardFile | null;
  onChange: (file: WizardFile | null) => void;
};

export function ContractStep({ arquivo, onChange }: ContractStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Documento base do pedido
        </h2>
        <p className="mt-1 text-sm text-[var(--text2)]">
          Selecione um contrato ou documento fictício para compor a simulação.
          O arquivo não é enviado para storage real nesta etapa.
        </p>
      </div>
      <ContractDropzone file={arquivo} onChange={onChange} />
    </div>
  );
}
