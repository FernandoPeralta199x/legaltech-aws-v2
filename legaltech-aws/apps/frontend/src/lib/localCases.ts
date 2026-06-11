import { MODULOS, PRODUTOS, type Modulo } from "../../lib/produtoConfig";
import type { Case, Priority, ProductType } from "../../types";

export const LOCAL_CASES_STORAGE_KEY = "legaltech.local.cases.v1";

type WizardPartySummary = {
  id: string;
  nome: string;
  papel: string;
};

type WizardFileSummary = {
  status: string;
} | null;

export type LocalCaseWizardInput = {
  arquivo: WizardFileSummary;
  modulos: Record<Modulo, boolean>;
  parties: WizardPartySummary[];
  produto: ProductType;
};

function getLocalStorage(): Storage | null {
  try {
    return typeof globalThis.localStorage === "undefined"
      ? null
      : globalThis.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStoredCase(value: unknown): value is Case {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.code === "string" &&
    typeof value.clientId === "string" &&
    typeof value.clientName === "string" &&
    typeof value.caseType === "string" &&
    typeof value.product === "string" &&
    typeof value.status === "string" &&
    typeof value.priority === "string" &&
    typeof value.documentsCount === "number" &&
    typeof value.progressPercent === "number" &&
    typeof value.notes === "string" &&
    Array.isArray(value.parties) &&
    typeof value.updatedAt === "string" &&
    typeof value.createdAt === "string" &&
    (typeof value.submittedAt === "string" || value.submittedAt === null)
  );
}

function selectedModules(modulos: Record<Modulo, boolean>): Modulo[] {
  return (Object.keys(MODULOS) as Modulo[]).filter((modulo) => modulos[modulo]);
}

function caseTypeForProduct(product: ProductType): string {
  const map: Record<ProductType, string> = {
    analise_contratual: "contract_analysis",
    consulta_objeto: "outro",
    dados_partes: "due_diligence",
    reuniao_equipe: "outro"
  };

  return map[product];
}

function normalizeIdPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(-12);
}

function makeLocalCaseCode(now: Date): string {
  return `CASO-LOCAL-${now.getTime().toString().slice(-6)}`;
}

function makeLocalCaseId(now: Date, partyId: string): string {
  const timestamp = now.getTime().toString(36);
  const suffix = normalizeIdPart(partyId) || "wizard";
  return `case-local-${timestamp}-${suffix}`;
}

function dedupeCases(cases: Case[]): Case[] {
  const seen = new Set<string>();
  const result: Case[] = [];

  cases.forEach((legalCase) => {
    const keys = [legalCase.id, legalCase.code].filter(Boolean);
    if (keys.some((key) => seen.has(key))) {
      return;
    }

    keys.forEach((key) => seen.add(key));
    result.push(legalCase);
  });

  return result;
}

export function getStoredLocalCases(): Case[] {
  const storage = getLocalStorage();
  if (!storage) return [];

  try {
    const raw = storage.getItem(LOCAL_CASES_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter(isStoredCase) : [];
  } catch {
    return [];
  }
}

export function saveStoredLocalCase(legalCase: Case): Case {
  const storage = getLocalStorage();
  if (!storage) return legalCase;

  const next = dedupeCases([
    legalCase,
    ...getStoredLocalCases().filter(
      (storedCase) =>
        storedCase.id !== legalCase.id && storedCase.code !== legalCase.code
    )
  ]);

  storage.setItem(LOCAL_CASES_STORAGE_KEY, JSON.stringify(next));
  return legalCase;
}

export function findStoredLocalCase(caseId: string): Case | undefined {
  return getStoredLocalCases().find(
    (legalCase) => legalCase.id === caseId || legalCase.code === caseId
  );
}

export function isLocalOnlyCase(legalCase: Case): boolean {
  return (
    legalCase.id.startsWith("case-local-") ||
    legalCase.metadata?.origin === "local" ||
    legalCase.metadata?.syncStatus === "local_only"
  );
}

export function mergeCasesWithLocalCases(cases: Case[]): Case[] {
  return dedupeCases([...getStoredLocalCases(), ...cases]);
}

export function createLocalCaseFromWizard(
  input: LocalCaseWizardInput,
  now = new Date()
): Case {
  const primaryParty = input.parties.find((party) => party.nome.trim()) ?? input.parties[0];
  const clientName = primaryParty?.nome.trim() || "Cliente local";
  const product = input.produto;
  const activeModules = selectedModules(input.modulos);
  const productName = PRODUTOS[product].titulo;
  const nowIso = now.toISOString();
  const title = `${productName} - ${clientName}`;

  return {
    id: makeLocalCaseId(now, primaryParty?.id ?? "wizard"),
    code: makeLocalCaseCode(now),
    clientId: primaryParty?.id ?? "local-client",
    clientName,
    caseType: caseTypeForProduct(product),
    product,
    status: "submitted",
    priority: "normal" satisfies Priority,
    documentsCount: input.arquivo?.status === "done" ? 1 : 0,
    progressPercent: 15,
    assignedTo: null,
    notes: "Registro local criado pelo fluxo Novo Pedido do MVP.",
    metadata: {
      modules: activeModules,
      moduleNames: activeModules.map((modulo) => MODULOS[modulo].titulo),
      origin: "local",
      product,
      productName,
      source: "new_case_wizard",
      syncStatus: "local_only",
      title
    },
    parties: [],
    updatedAt: nowIso,
    createdAt: nowIso,
    submittedAt: nowIso
  };
}

export function saveLocalCaseFromWizard(input: LocalCaseWizardInput): Case {
  return saveStoredLocalCase(createLocalCaseFromWizard(input));
}
