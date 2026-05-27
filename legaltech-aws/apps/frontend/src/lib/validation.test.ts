import assert from "node:assert/strict";
import test from "node:test";

import {
  validateCaseForm,
  validateClientForm,
  validateDevJwtForm,
  validateDocumentForm,
  validatePasswordChange
} from "./validation";

test("validateClientForm requires a client name", () => {
  const result = validateClientForm({ name: "   " });

  assert.equal(result.valid, false);
  assert.equal(result.errors.name, "Informe o nome do cliente.");
});

test("validateClientForm validates optional document format lightly", () => {
  const result = validateClientForm({ document: "abc@", name: "Cliente Dev" });

  assert.equal(result.valid, false);
  assert.equal(result.errors.document, "Use apenas números, letras, pontos, barras ou hífens.");
});

test("validateCaseForm requires title and linked client", () => {
  const result = validateCaseForm({
    caseType: "contract_analysis",
    clientId: "",
    priority: "normal",
    title: ""
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.title, "Informe o título do caso.");
  assert.equal(result.errors.clientId, "Selecione um cliente vinculado.");
});

test("validateCaseForm rejects uncontrolled priority values", () => {
  const result = validateCaseForm({
    caseType: "contract_analysis",
    clientId: "client-1",
    priority: "critical",
    title: "Análise contratual"
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.priority, "Selecione uma prioridade válida.");
});

test("validateDocumentForm requires case, filename and positive size", () => {
  const result = validateDocumentForm({
    caseId: "",
    contentType: "application/pdf",
    filename: "",
    sizeBytes: "0",
    status: "pending_upload"
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.caseId, "Selecione um caso vinculado.");
  assert.equal(result.errors.filename, "Informe o nome do documento.");
  assert.equal(result.errors.sizeBytes, "Informe um tamanho válido em bytes.");
});

test("validateDocumentForm rejects uncontrolled status values", () => {
  const result = validateDocumentForm({
    caseId: "case-1",
    contentType: "application/pdf",
    filename: "contrato.pdf",
    sizeBytes: "1024",
    status: "unknown"
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.status, "Selecione um status válido.");
});

test("validateDevJwtForm accepts empty token for local placeholder and validates pasted shape", () => {
  assert.equal(validateDevJwtForm("").valid, true);
  assert.equal(validateDevJwtForm("header.payload.signature").valid, true);

  const invalid = validateDevJwtForm("token-invalido");
  assert.equal(invalid.valid, false);
  assert.equal(
    invalid.errors.token,
    "Cole um JWT dev válido com três partes ou deixe o campo vazio para usar apenas a sessão visual local."
  );
});

test("validatePasswordChange requires a strong new password and matching confirmation", () => {
  const result = validatePasswordChange({
    confirmPassword: "Senha-fraca-2",
    currentPassword: "",
    newPassword: "senha"
  });

  assert.equal(result.valid, false);
  assert.equal(result.errors.currentPassword, "Informe a senha atual.");
  assert.equal(result.errors.newPassword, "A senha deve atender todos os requisitos.");
  assert.equal(result.errors.confirmPassword, "A confirmação deve ser igual à nova senha.");
  assert.deepEqual(result.requirements, {
    hasLowercase: true,
    hasMinLength: false,
    hasSpecial: false,
    hasUppercase: false
  });
});

test("validatePasswordChange accepts valid local password change input", () => {
  const result = validatePasswordChange({
    confirmPassword: "Senha@123",
    currentPassword: "Atual@123",
    newPassword: "Senha@123"
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.deepEqual(result.requirements, {
    hasLowercase: true,
    hasMinLength: true,
    hasSpecial: true,
    hasUppercase: true
  });
});
