export type ValidationErrors = Record<string, string>;

export type ValidationResult = {
  errors: ValidationErrors;
  valid: boolean;
};

export type PasswordRequirementState = {
  hasLowercase: boolean;
  hasMinLength: boolean;
  hasSpecial: boolean;
  hasUppercase: boolean;
};

export type PasswordValidationResult = ValidationResult & {
  requirements: PasswordRequirementState;
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

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const payload = token.split(".")[1];
  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    const decoded = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    return typeof decoded === "object" && decoded !== null
      ? (decoded as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
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
    return result({
      token: "Cole o JWT dev gerado pelo backend para acessar o ambiente local."
    });
  }

  if (
    trimmedToken.split(".").length !== 3 ||
    trimmedToken.split(".").some((part) => part.length === 0)
  ) {
    return result({
      token:
        "Cole um JWT dev válido com três partes no formato header.payload.signature."
    });
  }

  const payload = decodeJwtPayload(trimmedToken);
  if (!payload) {
    return result({
      token: "O payload do JWT dev não pôde ser lido."
    });
  }

  if (typeof payload.exp === "number" && payload.exp <= Math.floor(Date.now() / 1000)) {
    return result({
      token: "JWT dev expirado. Gere um novo token no backend."
    });
  }

  return result({});
}

export function getPasswordRequirements(password: string): PasswordRequirementState {
  return {
    hasLowercase: /[a-z]/.test(password),
    hasMinLength: password.length >= 8,
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    hasUppercase: /[A-Z]/.test(password)
  };
}

export function validatePasswordChange(input: {
  confirmPassword?: string | null;
  currentPassword?: string | null;
  newPassword?: string | null;
}): PasswordValidationResult {
  const errors: ValidationErrors = {};
  const currentPassword = input.currentPassword ?? "";
  const newPassword = input.newPassword ?? "";
  const confirmPassword = input.confirmPassword ?? "";
  const requirements = getPasswordRequirements(newPassword);
  const meetsAllRequirements = Object.values(requirements).every(Boolean);

  if (!currentPassword) {
    errors.currentPassword = "Informe a senha atual.";
  }

  if (!newPassword) {
    errors.newPassword = "Informe a nova senha.";
  } else if (!meetsAllRequirements) {
    errors.newPassword = "A senha deve atender todos os requisitos.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirme a nova senha.";
  } else if (confirmPassword !== newPassword) {
    errors.confirmPassword = "A confirmação deve ser igual à nova senha.";
  }

  return {
    ...result(errors),
    requirements
  };
}
