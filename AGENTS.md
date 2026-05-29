# AGENTS.md — Instruções para agentes de código

## Projeto

Este repositório contém o projeto LegalTech AWS / Contrato Visto.

O sistema pode lidar com documentos jurídicos, contratos, dados de clientes, dados pessoais e informações sensíveis.

Qualquer alteração deve priorizar:

- segurança;
- confiabilidade;
- privacidade;
- preservação do comportamento aprovado;
- compatibilidade com o MVP local.

## Regras gerais

Antes de alterar código:

1. Rode `git status --short`.
2. Leia este arquivo.
3. Leia a documentação relevante em `docs/`.
4. Apresente um plano curto.
5. Liste arquivos que pretende alterar.
6. Explique o risco de cada alteração.

Não fazer deploy.

Não criar recursos AWS reais.

Não adicionar secrets reais.

Não usar dados reais.

Não quebrar login dev com JWT.

Não quebrar front-end/back-end já aprovados.

Não quebrar tema claro/escuro.

Não quebrar mobile.

Não alterar contratos de API sem necessidade objetiva.

## Skills/checklists de segurança disponíveis

Quando a tarefa envolver segurança, aplicar os seguintes checklists:

- `docs/security/SECURITY_CODE_REVIEW.md`
- `docs/security/THREAT_MODELING.md`
- `docs/security/SECRETS_SCANNING.md`
- `docs/security/AUTH_JWT_REVIEW.md`
- `docs/security/CORS_HARDENING.md`
- `docs/security/SECURE_LOGGING.md`
- `docs/security/DEPENDENCY_AUDIT.md`
- `docs/security/SECURE_DOCUMENTATION.md`

## Tarefa de segurança padrão

Quando o usuário pedir hardening, auditoria, segurança, revisão antes de deploy ou proteção de dados sensíveis, executar:

1. Security Code Review.
2. Threat Modeling.
3. Secrets Scanning.
4. Auth/JWT Review.
5. CORS Hardening.
6. Secure Logging.
7. Dependency Audit.
8. Secure Documentation.

## Proibições

Não exibir segredo completo no relatório.

Não imprimir JWT completo.

Não logar conteúdo integral de contratos.

Não commitar `.env`.

Não commitar logs locais.

Não transformar MVP local em produção sem solicitação explícita.

Não declarar o sistema como production-ready.

## Resultado final esperado

Ao final de uma tarefa de segurança, informar:

- plano executado;
- arquivos analisados;
- arquivos modificados;
- riscos encontrados;
- riscos corrigidos;
- riscos pendentes;
- comandos executados;
- resultado das validações;
- se pode commitar;
- mensagem de commit sugerida.

Conclusão padrão:

“Projeto reforçado para MVP local controlado, ainda não production-ready.”
