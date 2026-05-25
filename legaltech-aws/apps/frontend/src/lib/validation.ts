export type ValidationErrors = Record<string, string>;

export type ValidationResult = {
  errors: ValidationErrors;
  valid: boolean;
};

const allowedPriorities = new Set(["low", "normal", "high", "urgent"]);
const allowedDocumentStatuses = new Set([
  "pending_upload",
  "uploaded",
  "processing",
  "processed"
]);
const allowedContentTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);

function result(errors: ValidationErrors): ValidationResult {
  return {
    errors,
    valid: Object.keys(errors).length === 0
  };
}

function hasOnlySafeIdentifierCharacters(value: string): boolean {
  return /^[A-Za-z0-9./-]+$/.test(value);
}

export function validateClientForm(input: {
  document?: string | null;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
}): ValidationResult {
  const errors: ValidationErrors = {};
  const name = input.name?.trim() ?? "";
  const document = input.document?.trim() ?? "";
  const email = input.email?.trim() ?? "";

  if (!name) {
    errors.name = "Informe o nome do cliente.";
  }

  if (document && !hasOnlySafeIdentifierCharacters(document)) {
    errors.document = "Use apenas números, letras, pontos, barras ou hífens.";
  }

  if (email && !email.includes("@")) {
    errors.email = "Informe um e-mail válido ou deixe o campo vazio.";
  }

  return result(errors);
}

export function validateCaseForm(input: {
  caseType?: string | null;
  clientId?: string | null;
  priority?: string | null;
  title?: string | null;
}): ValidationResult {
  const errors: ValidationErrors = {};

  if (!input.title?.trim()) {
    errors.title = "Informe o título do caso.";
  }

  if (!input.clientId?.trim()) {
    errors.clientId = "Selecione um cliente vinculado.";
  }

  if (!input.caseType?.trim()) {
    errors.caseType = "Selecione um tipo de caso.";
  }

  if (!input.priority || !allowedPriorities.has(input.priority)) {
    errors.priority = "Selecione uma prioridade válida.";
  }

  return result(errors);
}

export function validateDocumentForm(input: {
  caseId?: string | null;
  contentType?: string | null;
  filename?: string | null;
  sizeBytes?: number | string | null;
  status?: string | null;
}): ValidationResult {
  const errors: ValidationErrors = {};
  const filename = input.filename?.trim() ?? "";
  const sizeBytes = Number(input.sizeBytes);

  if (!input.caseId?.trim()) {
    errors.caseId = "Selecione um caso vinculado.";
  }

  if (!filename) {
    errors.filename = "Informe o nome do documento.";
  }

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    errors.sizeBytes = "Informe um tamanho válido em bytes.";
  }

  if (!input.contentType || !allowedContentTypes.has(input.contentType)) {
    errors.contentType = "Selecione um tipo de arquivo válido.";
  }

  if (!input.status || !allowedDocumentStatuses.has(input.status)) {
    errors.status = "Selecione um status válido.";
  }

  return result(errors);
}

export function validateDevJwtForm(token: string): ValidationResult {
  const trimmedToken = token.trim();

  if (!trimmedToken) {
    return result({});
  }

  if (trimmedToken.split(".").length !== 3) {
    return result({
      token:
        "Cole um JWT dev válido com três partes ou deixe o campo vazio para usar apenas a sessão visual local."
    });
  }

  return result({});
}
