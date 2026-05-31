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
        <h2 className="text-lg font-semibold text-[var(--text)]">Upload do contrato</h2>
        <p className="mt-1 text-sm text-[var(--text2)]">
          Envie o contrato em PDF, DOCX ou imagem. Para imagens executamos OCR
          automaticamente; para PDFs extraímos o texto.
        </p>
      </div>
      <ContractDropzone file={arquivo} onChange={onChange} />
    </div>
  );
}
