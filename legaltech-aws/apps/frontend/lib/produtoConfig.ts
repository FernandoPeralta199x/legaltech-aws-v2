/**
 * Catálogo de produtos, módulos e matriz produto × módulo.
 *
 * Mapeamento canônico do wizard de criação de caso. As chaves de Produto
 * (`dados_partes` | `consulta_objeto` | `analise_contratual` | `reuniao_equipe`)
 * coincidem com o `ProductType` já usado em `services/cases.ts` e
 * `types/index.ts`. Os módulos refletem os agentes/integrações expostos pelo
 * pipeline SQS do backend.
 */

export type Produto =
  | "dados_partes"
  | "consulta_objeto"
  | "analise_contratual"
  | "reuniao_equipe";

export type Modulo =
  | "escavador"
  | "targetdata"
  | "ia_deepseek"
  | "serasa_procon"
  | "analise_contratual_ia"
  | "revisao_humana";

export type ProdutoMeta = {
  titulo: string;
  descricao: string;
  inclui: string[];
  precoBaseCents: number;
  slaHoras: number;
};

export type ModuloMeta = {
  titulo: string;
  descricao: string;
  precoCents: number;
};

export const PRODUTOS: Record<Produto, ProdutoMeta> = {
  dados_partes: {
    titulo: "Dados das partes",
    descricao: "Levantamento completo das partes envolvidas no contrato.",
    inclui: ["Consulta cadastral", "Histórico jurídico", "Reputação pública"],
    precoBaseCents: 18700,
    slaHoras: 24
  },
  consulta_objeto: {
    titulo: "Consulta do objeto",
    descricao: "Verificação do objeto contratual e informações públicas correlatas.",
    inclui: ["Validação do objeto", "Pesquisa pública", "Resumo por IA"],
    precoBaseCents: 14900,
    slaHoras: 24
  },
  analise_contratual: {
    titulo: "Análise contratual",
    descricao: "Leitura cláusula a cláusula com identificação de riscos e obrigações.",
    inclui: ["Análise por IA", "Identificação de riscos", "Mapeamento de obrigações"],
    precoBaseCents: 28900,
    slaHoras: 48
  },
  reuniao_equipe: {
    titulo: "Reunião com advogado",
    descricao: "Conversa direta com profissional do time jurídico.",
    inclui: ["Análise prévia", "Reunião dedicada", "Parecer final"],
    precoBaseCents: 49000,
    slaHoras: 72
  }
};

export const MODULOS: Record<Modulo, ModuloMeta> = {
  escavador: {
    titulo: "Escavador",
    descricao:
      "Consulta processos judiciais, histórico jurídico e informações públicas das partes.",
    precoCents: 4900
  },
  targetdata: {
    titulo: "TargetData",
    descricao: "Consulta dados cadastrais, comerciais e enriquecimento de informações.",
    precoCents: 3900
  },
  ia_deepseek: {
    titulo: "Inteligência Artificial",
    descricao: "Organiza dados coletados, resume informações e classifica riscos.",
    precoCents: 2900
  },
  serasa_procon: {
    titulo: "Serasa / Procon",
    descricao: "Consulta score, restrições, reputação e reclamações públicas.",
    precoCents: 5900
  },
  analise_contratual_ia: {
    titulo: "Análise Contratual por IA",
    descricao: "Lê o contrato e identifica cláusulas, riscos, obrigações e inconsistências.",
    precoCents: 7900
  },
  revisao_humana: {
    titulo: "Revisão Humana",
    descricao: "Envia os relatórios para avaliação da equipe interna ou advogado responsável.",
    precoCents: 12900
  }
};

export type ModuloConfig = {
  /** Estado inicial do switch ao entrar na etapa. */
  default: boolean;
  /** Mostra o badge "Recomendado". */
  recomendado?: boolean;
  /** Mostra o badge "Obrigatório" — sempre ativo e bloqueado. */
  obrigatorio?: boolean;
  /** Impede o usuário de alterar o switch (par com obrigatório, ou para módulos indisponíveis). */
  bloqueado?: boolean;
};

export const MATRIZ: Record<Produto, Record<Modulo, ModuloConfig>> = {
  dados_partes: {
    escavador: { default: true, obrigatorio: true, bloqueado: true },
    targetdata: { default: true, obrigatorio: true, bloqueado: true },
    ia_deepseek: { default: true, obrigatorio: true, bloqueado: true },
    serasa_procon: { default: false, recomendado: true },
    analise_contratual_ia: { default: false },
    revisao_humana: { default: false }
  },
  consulta_objeto: {
    escavador: { default: false },
    targetdata: { default: false },
    ia_deepseek: { default: true, obrigatorio: true, bloqueado: true },
    serasa_procon: { default: false },
    analise_contratual_ia: { default: false },
    revisao_humana: { default: false }
  },
  analise_contratual: {
    escavador: { default: false },
    targetdata: { default: false },
    ia_deepseek: { default: true, obrigatorio: true, bloqueado: true },
    serasa_procon: { default: false },
    analise_contratual_ia: { default: true, obrigatorio: true, bloqueado: true },
    revisao_humana: { default: true, recomendado: true }
  },
  reuniao_equipe: {
    escavador: { default: false },
    targetdata: { default: false },
    ia_deepseek: { default: true, recomendado: true },
    serasa_procon: { default: false },
    analise_contratual_ia: { default: false, recomendado: true },
    revisao_humana: { default: true, obrigatorio: true, bloqueado: true }
  }
};

export type Papel =
  | "contratante"
  | "contratada"
  | "comprador"
  | "vendedor"
  | "locador"
  | "locatario"
  | "avalista"
  | "fiador"
  | "testemunha"
  | "outro";

export const PAPEIS: { id: Papel; label: string }[] = [
  { id: "contratante", label: "Contratante" },
  { id: "contratada", label: "Contratada" },
  { id: "comprador", label: "Comprador" },
  { id: "vendedor", label: "Vendedor" },
  { id: "locador", label: "Locador" },
  { id: "locatario", label: "Locatário" },
  { id: "avalista", label: "Avalista" },
  { id: "fiador", label: "Fiador" },
  { id: "testemunha", label: "Testemunha" },
  { id: "outro", label: "Outro" }
];

export type TipoPessoa = "pf" | "pj";

export function estimarValor(produto: Produto, modulosAtivos: Modulo[]): number {
  const base = PRODUTOS[produto].precoBaseCents;
  const adicionais = modulosAtivos.reduce(
    (sum, m) => sum + (MODULOS[m]?.precoCents ?? 0),
    0
  );
  return base + adicionais;
}

export function estimarPrazoHoras(produto: Produto, modulosAtivos: Modulo[]): number {
  const base = PRODUTOS[produto].slaHoras;
  const ajusteRevisao = modulosAtivos.includes("revisao_humana") ? 24 : 0;
  const ajusteReuniao = produto === "reuniao_equipe" ? 24 : 0;
  return base + ajusteRevisao + ajusteReuniao;
}
