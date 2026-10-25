# 0005 Registrar, editar e acompanhar serviços (consertos) dos clientes

**Data:** 2026-10-24
**Status:** Em andamento
**Escopo:** master
**Responsável:** Diego
**Contrato:** servicos@1
**Regras:** SRV-01, SRV-02, SRV-03, SRV-05
**Spec mestre:** —
**Specs filhas:** —
**Dependências:** master/0004
**Solicitação original:** "Vamos cadastrar serviços primeiro"

> Desbloqueada em 2026-10-24: Diego aprovou `servicos@1` ("Também aprovo o contrato de serviços").

## Objetivo e demonstração

Antes: a aba Serviços mostra só o estado vazio; o detalhe do cliente não tem serviços.
Depois: no detalhe do cliente, "Novo serviço" abre o formulário com descrição, valor (R$) e data de entrega já preenchida com hoje (alterável); o serviço salvo começa como Pendente e aparece no detalhe do cliente e na aba Serviços. Na aba, a costureira vê cliente, descrição, valor, entrega e status, muda o status para Pronto ou Entregue, edita e exclui (com confirmação). Serviços de clientes excluídos não aparecem na aba.

Demonstração: APK release em modo avião → cliente "Maria Souza" → novo serviço "Barra da calça", R$ 25,00, entrega hoje → Pendente na aba → marcar Pronto e depois Entregue → editar valor para 30,00 → excluir outro serviço; descrição vazia e valor "abc" recusados; excluir um cliente com serviço e ver o serviço sumir da aba.

## Impacto previsto

- Novo código em `src/jobs/` (`domain/`, `data/`, `screens/`), nos moldes de `src/customers`.
- Datas de negócio: hoje em texto local `YYYY-MM-DD` e exibição `DD/MM/AAAA` — módulo puro compartilhável (ex.: `src/calendar`), como `src/money`.
- `src/customers/screens/CustomerDetailScreen.tsx`: seção de serviços do cliente e ação "Novo serviço".
- `src/app`: repositório de serviços no `RepositoriesProvider`; rota `JobForm` sai do `PendingScreen`.
- Dados: tabela `job` da migração 001, sem migração nova (status `pending|ready|delivered`, `amount_cents` inteiro, `delivery_date` `YYYY-MM-DD` já restritos no banco).
- Possível dependência nativa para o seletor de data (ver Autonomia). Sem rede.
- Fora desta entrega: produtos e vendas (PRD-01, PRD-02) e a parte de produtos do histórico (SRV-04). A seção de serviços no detalhe deixa SRV-04 parcial.

## Autonomia e decisões

- Autonomia de `servicos@1`: layout das telas de serviços dentro da paleta.
- Escolha técnica do executor: seletor de data. Recomendado `@react-native-community/datetimepicker` (diálogo nativo do Android, sem rede), confirmando compatibilidade com RN 0.88; alternativa sem dependência é campo `DD/MM/AAAA` validado. Registrar a escolha.
- Ordem da lista da aba: por data de entrega (mais próxima primeiro), com status visível — dentro do layout delegado.
- Criar serviço a partir da aba Serviços (escolhendo o cliente) não está no contrato; o fluxo é pelo cliente (UC-01).
- `servicos@1` aprovado por Diego em 2026-10-24. Criação de serviço pela aba Serviços não foi pedida; segue só pelo cliente (UC-01).

## Contexto técnico

- Fontes: esquema `job` em [001_initial_schema.ts](../../../src/database/migrations/001_initial_schema.ts); padrão de feature em `src/customers` (domínio com resultados explícitos, `data` sobre a porta `Database`, contexto de repositórios provido por [RepositoriesProvider.tsx](../../../src/app/RepositoriesProvider.tsx), `useFocusedLoad`, `Button`/`TextField` em `src/ui`); dinheiro em [src/money](../../../src/money/cents.ts) (`parseCents`, `formatCents`); rotas em [routes.ts](../../../src/app/navigation/routes.ts).
- Testes existentes: [schema.test.ts](../../../__tests__/database/schema.test.ts) já cobre CHECK de status, valor e data e o status padrão `pending`; [money.test.ts](../../../__tests__/money.test.ts) cobre conversão de valores. Não repetir.
- Direção de dependências: `customers/screens` pode usar o que `jobs/index.ts` expõe (ex.: seção de serviços do cliente); `jobs` não importa `customers` (evita ciclo). Nome do cliente na aba vem do `JOIN` no `jobs/data`, que também filtra `customer.deleted_at IS NULL` (SRV-05).
- Cada executor carrega a skill `clean-code` (incluindo `references/architecture.md`), confirma as fontes atuais e usa Graphify somente se necessário.

## Tasks

### Task 01 — Regras e repositório de serviços
**Regras:** SRV-01, SRV-02, SRV-03, SRV-05
**Modo:** TDD
**Responsável:** Claude Code (sessão f61330bd, agente único)
**Arquivos:** `src/jobs/domain/`, `src/jobs/data/`, `src/jobs/index.ts`, módulo de datas (ex.: `src/calendar/`), `__tests__/jobs/`
**Depende de:** contrato `servicos@1` aprovado
**Verificação:** riscos vitais: valor gravado errado (float ou texto mal convertido); serviço de cliente excluído aparecendo na aba; data de entrega padrão errada por fuso (UTC × local perto da meia-noite); edição/exclusão atingindo outro serviço. Proteção existente: CHECKs do esquema e `parseCents`. Lacuna → poucos testes de repositório em `node:sqlite`: criar com valor "25,00" grava 2500 e status pendente; descrição vazia e valor inválido recusados sem gravar; data padrão = data local de hoje (relógio fixado); editar e mudar status afetam só o serviço; excluir remove; lista da aba ignora clientes excluídos e lista do cliente traz só os seus.
**Instrução para o executor:**
> Spec master/0005 — Task 01: contrato `servicos@1`, regras SRV-01, 02, 03, 05. Domínio com tipos `Job`/`JobStatus`, validação (descrição obrigatória; valor por `parseCents`, ≥ 0) com resultados explícitos e interface do repositório; `data` com SQL sobre a porta `Database` (criar, editar, mudar status, excluir, listar do cliente, listar para a aba com nome do cliente e sem excluídos). Data de hoje local injetável para teste. Sem migração. Reportar fontes e `npm test`; não escrever estado compartilhado, índices ou grafo.

### Task 02 — Formulário de serviço e serviços no detalhe do cliente
**Regras:** SRV-01, SRV-02
**Modo:** direto
**Responsável:** Claude Code (sessão f61330bd, agente único)
**Arquivos:** `src/jobs/screens/` (formulário e seção do cliente), `src/customers/screens/CustomerDetailScreen.tsx`, `src/app/RepositoriesProvider.tsx`, `src/app/navigation/Navigator.tsx` (rota `JobForm`), `package.json`/`package-lock.json` se adotar o seletor de data
**Depende de:** Task 01
**Verificação:** regras protegidas na Task 01. `npx tsc --noEmit`, `npm run lint`, `npm test`; inspeção no emulador: data preenchida com hoje e alterável, valor em reais, erros junto aos campos, serviço aparece no detalhe com entrega, descrição, valor e status.
**Instrução para o executor:**
> Spec master/0005 — Task 02: `JobForm` (criar por `customerId`, editar por `jobId`), ligado no `Navigator`; no detalhe do cliente, seção "Serviços" com os serviços do cliente e "Novo serviço"; tocar em um serviço abre a edição. Valor formatado com `formatCents`; data exibida `DD/MM/AAAA`. Telas humildes, regras no domínio. Reportar inspeção, escolha do seletor de data e checks.

### Task 03 — Aba Serviços com status, edição e exclusão
**Regras:** SRV-02, SRV-03, SRV-05
**Modo:** direto
**Responsável:** Claude Code (sessão f61330bd, agente único)
**Arquivos:** `src/jobs/screens/JobsScreen.tsx` (e componentes próprios), `src/jobs/index.ts`
**Depende de:** Task 02 (mesmos registros de composição e rota)
**Verificação:** regras protegidas na Task 01. Checks do projeto; inspeção no emulador: lista com cliente, descrição, valor, entrega e status; mudar para Pronto/Entregue reflete na lista e no detalhe do cliente; excluir pede confirmação; serviço de cliente excluído não aparece.
**Instrução para o executor:**
> Spec master/0005 — Task 03: substituir o estado vazio da aba por lista ordenada por entrega, com ação rápida de mudar status (Pendente/Pronto/Entregue), tocar para editar e excluir com confirmação. Recarregar ao ganhar foco. Reportar inspeção e checks.

## Validação e integração

- Aceite: critérios de SRV-01, 02, 03 e 05 observados — testes da Task 01 + demonstração no emulador (APK release, modo avião).
- Gates: `npx tsc --noEmit`, `npm run lint`, `npm test`; `validate-lifecycle.py --ready servicos/SRV-01`, `SRV-02`, `SRV-03`, `SRV-05` e `--complete master/0005`. SRV-04 fica `parcial` no estado até a spec de produtos.
- Integração: commit no `main` local; push sob autorização de Diego.

## Diferença entre plano e resultado

Execução em 2026-10-24, registro [implements/0005](../../implements/0005/README.md).
- Seletor de data: `@react-native-community/datetimepicker` 9.2.1 (diálogo nativo), versão exata.
- Exclusão de serviço no formulário de edição (aberto pela aba ou pelo detalhe), em vez de gesto na lista; status também editável no formulário.
- `useFocusedLoad` movido para `src/ui` e passou a devolver `reload`; `SQL_NOW` centralizado em `src/database` (remove duplicação em `customers/data`).
- Mudanças em telas e dados de clientes exigiram repetir a demonstração de CLI-01..04 e reemitir SIS-01, 02, 03 e 06.
- SRV-04 fica parcial (serviços no detalhe; produtos na próxima spec).

## Checklist de conclusão
- [x] Task 01 — Regras e repositório de serviços
- [x] Task 02 — Formulário de serviço e serviços no detalhe do cliente
- [x] Task 03 — Aba Serviços com status, edição e exclusão

## Execução
$run master/0005

## Estado
O ciclo normativo define o estado. Checkboxes não concluem a spec: exigir aceite, prova corrente e integração. Publicação não faz parte do aceite.
