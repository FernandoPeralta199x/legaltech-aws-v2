# AGENTS.md

## Regras Do Projeto

- Nunca confiar em `organization_id` vindo do frontend.
- Toda tabela sensivel deve ter `organization_id`.
- Toda acao sensivel deve gerar `audit_log`.
- Upload deve usar presigned URL.
- Arquivos devem ficar em S3 privado.
- Frontend nunca recebe chave de API externa.
- Backend deve validar autenticacao, tenant e permissao.
- Relatorio juridico final exige revisao humana.
- Separar rotas, services, schemas, repositories e models.

## Diretrizes De Arquitetura

- O frontend deve tratar `organization_id`, permissoes e identidade como informacoes derivadas da sessao autenticada, nunca como fonte de autoridade.
- O backend deve centralizar regras de autenticacao, tenant, RBAC e auditoria em camadas reutilizaveis.
- Integracoes externas devem ser encapsuladas em services/adapters, com interfaces testaveis e sem exposicao de credenciais ao cliente.
- Operacoes assincronas devem ser desenhadas para filas e workers desde o inicio, mesmo quando ainda nao implementadas.
- Documentos e resultados juridicos devem manter rastreabilidade, logs de auditoria e etapa obrigatoria de revisao humana.
