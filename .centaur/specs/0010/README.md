# 0010 Despesas sem a categoria Taxas

**Data:** 2026-10-25
**Status:** Concluída
**Escopo:** master
**Responsável:** Claude Code (sessão 3b466626, agente único)
**Contrato:** financeiro@2
**Regras:** FIN-01, FIN-02, FIN-03, FIN-04
**Spec mestre:** —
**Specs filhas:** —
**Dependências:** master/0008, master/0009
**Solicitação original:** "No tipo de despesa, tira a categoria de taxa"

## Objetivo e demonstração

Antes: o formulário de despesa oferece Taxas, Imposto e Materiais.
Depois: só Imposto e Materiais. Uma despesa nova ou editada com Taxas é recusada com "Escolha a categoria.".

Demonstração no APK release, em modo avião:
1. "Nova despesa" mostra só Imposto e Materiais.
2. Importar um backup com uma despesa antiga em Taxas: ela aparece na lista com "Taxas" e conta nas saídas do mês.
3. Ao editá-la, nenhuma categoria vem marcada, e salvar pede a categoria.
4. Pagamento, saldo do cliente e caixa continuam funcionando.

## Impacto previsto

- Contrato: `financeiro@2` muda só FIN-02 (descrição, aceite e invariante da despesa). FIN-01, FIN-03 e FIN-04 não mudam, mas o novo hash do contrato exige reemitir suas evidências.
- `src/finance/domain/expense.ts`: `EXPENSE_CATEGORIES` passa a ter só `tax` e `materials`, e a validação recusa `fees`. O tipo `ExpenseCategory` mantém `fees`, para ler despesas antigas.
- `src/finance/screens`: o seletor deixa de mostrar Taxas. O rótulo "Taxas" continua para exibir as despesas antigas.
- Dados: sem migração nova. O CHECK da migração 001 continua aceitando `fees`, então bancos e backups antigos seguem válidos.
- Testes: ajustar `__tests__/finance/cashFlow.test.ts`, que usava `fees`, e incluir `fees` entre as categorias recusadas.

## Autonomia e decisões

- Decisão de Diego (2026-10-25): retirar Taxas → `financeiro@2`.
- Escolha do executor sobre as despesas já gravadas em Taxas: elas não são apagadas nem convertidas, porque nenhuma das duas categorias restantes equivale a Taxas e SIS-06 proíbe perda de dados. Continuam no histórico e nos totais com o rótulo "Taxas"; ao editar, é preciso escolher Imposto ou Materiais. Converter todas de uma vez para outra categoria exigiria uma migração e fica para quando Diego decidir.

## Contexto técnico

- Fontes: [expense.ts](../../../src/finance/domain/expense.ts), [labels.ts](../../../src/finance/screens/labels.ts), [CategorySelector.tsx](../../../src/finance/screens/CategorySelector.tsx), [cashFlow.test.ts](../../../__tests__/finance/cashFlow.test.ts), [001_initial_schema.ts](../../../src/database/migrations/001_initial_schema.ts).
- O executor carrega `clean-code`. Graphify não é necessário.

## Tasks

### Task 01 — Retirar Taxas das categorias oferecidas e aceitas
**Regras:** FIN-02
**Modo:** direto
**Responsável:** Claude Code
**Arquivos:** `src/finance/domain/expense.ts`, `src/finance/screens/labels.ts`, `__tests__/finance/cashFlow.test.ts`
**Depende de:** —
**Verificação:**
- O teste existente de categorias recusadas passa a incluir `fees`.
- Rodar `npx tsc --noEmit`, `npm run lint`, `npm test` e o build release.
- Inspeção no emulador conforme a demonstração.
**Instrução para o executor:**
> Spec master/0010, Task 01. Contrato `financeiro@2`, regra FIN-02. Deixar só Imposto e Materiais na escolha e na validação, mantendo a leitura e o rótulo de despesas antigas em Taxas. Sem migração.

## Validação e integração

- Aceite: FIN-02 de `financeiro@2` observado no teste e no emulador; FIN-01, FIN-03 e FIN-04 conferidos no mesmo build.
- Gates: `npx tsc --noEmit`, `npm run lint`, `npm test`, `--ready` de FIN-01 a FIN-04 e `--complete master/0010`.
- Integração: commit no `main` local; push sob autorização de Diego.

## Diferença entre plano e resultado

- **Reforma visual integrada junto.** Durante a execução, outra sessão ("Logo geração e integração") deixou no working tree uma reforma visual não commitada: aba Início, ícones, logo, tema e telas refeitas, com Ajustes no cabeçalho do Início. Com autorização de Diego, ela entrou num commit próprio (`55d426f`), separado desta spec (`af5fd41`).
- **Regressão completa.** A reforma mudou as telas de todas as regras, então a regressão foi refeita no build com as duas mudanças (capturas 90–112). As evidências de todas as regras, exceto SIS-06, foram reemitidas. Os dados de demonstração da outra sessão foram salvos em backup antes e restaurados no fim.
- **Despesa antiga em Taxas.** Foi demonstrada importando um backup com uma despesa `fees`, o que também mostrou que backups antigos continuam válidos.
- **Contrato.** A remoção de Taxas ficou registrada só na aprovação: `decisions` do contrato é para lacunas abertas e fica vazio.
- **Integração.** Commits `55d426f` e `af5fd41` e os registros foram enviados ao `origin/main` com autorização de Diego.

## Checklist de conclusão
- [x] Task 01 — Retirar Taxas das categorias oferecidas e aceitas

## Execução
$run master/0010

## Estado
O ciclo normativo define o estado. Checkboxes não concluem a spec: exigir aceite, prova corrente e integração. Publicação não faz parte do aceite.
