# [0008] Despesas do ateliê e caixa por mês (master/0008)

**Data:** 2026-10-25
**Status:** Concluído
**Modo:** TDD (Task 01) e direto (Task 02)
**Spec:** `.centaur/specs/0008/`: Tasks 01 e 02, feitas por um agente único na sessão 3b466626

## Solicitação
"Pode executar as specs 0007 e 0008". Contrato `financeiro@1`, regras FIN-02 e FIN-04.

## O que foi feito
- **`src/calendar/businessMonth.ts`:** mês `YYYY-MM`, com anterior e seguinte (inclusive na virada de ano) e o rótulo "Outubro de 2026".
- **`src/finance/domain`:**
  - `Expense`: categorias `fees`, `tax` e `materials`; validação de descrição, categoria, valor maior que zero e data.
  - `cashFlowSummary`: saldo do mês, que pode ser negativo.
  - Interfaces `ExpenseRepository` e `CashFlowRepository`.
- **`src/finance/data`:**
  - CRUD de despesas e despesas do mês em ordem de data.
  - Somas do mês, com pagamentos de clientes excluídos incluídos.
- **`src/finance/screens`:**
  - `CashFlowScreen`: setas de mês, Entradas, Saídas e Saldo, lista de despesas e "Nova despesa".
  - `ExpenseFormScreen` e `CategorySelector`.
- **Navegação:** rota `ExpenseForm` ligada; `PendingScreen` removido.

## Resultado da validação
- **Testes:** `npm test` passou com 109 testes, 10 deles novos em `__tests__/finance/cashFlow.test.ts`. `tsc` e `lint` sem erros.
- **Emulador (capturas 50–58 e 68–69):**
  - Outubro mostrou Entradas R$ 150,00.
  - Despesa sem categoria e com valor "abc" foi recusada.
  - Com a despesa de R$ 35,00, o Saldo ficou em R$ 115,00.
  - A despesa de 01/11 apareceu só em novembro, com Saldo -R$ 75,90.
  - As setas navegaram até Janeiro de 2027.
  - Editar e excluir despesa funcionaram, com confirmação.
  - Os pagamentos de clientes excluídas continuaram em outubro (R$ 200,00), inclusive depois de reiniciar.
- **Regressão (capturas 59–67):** clientes, medidas, serviços, status, catálogo e venda repetidos no mesmo build. As evidências de CLI, SRV, PRD e SIS foram reemitidas.

## Pendências
- Push não autorizado ainda.
- Backup e importação (SIS-04, SIS-05) seguem sem spec.
