"use client";

import { useMemo } from "react";

import {
  estimarPrazoHoras,
  estimarValor,
  MATRIZ,
  type Modulo,
  type Produto
} from "@/lib/produtoConfig";

import { EstimateCard } from "./EstimateCard";
import { ModuleRow } from "./ModuleRow";

type ModulesStepProps = {
  produto: Produto;
  state: Record<Modulo, boolean>;
  onChange: (state: Record<Modulo, boolean>) => void;
};

export function ModulesStep({ produto, state, onChange }: ModulesStepProps) {
  const matriz = MATRIZ[produto];
  const modulos = Object.keys(matriz) as Modulo[];

  const ativos = useMemo(
    () => modulos.filter((m) => state[m]),
    [modulos, state]
  );

  const valor = useMemo(() => estimarValor(produto, ativos), [produto, ativos]);
  const prazo = useMemo(() => estimarPrazoHoras(produto, ativos), [produto, ativos]);

  function toggle(modulo: Modulo, value: boolean) {
    onChange({ ...state, [modulo]: value });
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text)]">
          Ajuste os módulos da análise
        </h2>
        <p className="mt-1 text-sm text-[var(--text2)]">
          Ative módulos opcionais para montar a simulação do pedido. Os módulos
          representam o fluxo futuro e não acionam integrações reais agora.
        </p>
      </div>

      <div className="space-y-3">
        {modulos.map((m) => (
          <ModuleRow
            checked={state[m] ?? false}
            config={matriz[m]}
            key={m}
            modulo={m}
            onCheckedChange={(value) => toggle(m, value)}
          />
        ))}
      </div>

      <EstimateCard prazoHoras={prazo} valorCents={valor} />
    </div>
  );
}
