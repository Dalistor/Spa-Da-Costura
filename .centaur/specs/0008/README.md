# 0008 Despesas do ateliê e caixa por mês

**Data:** 2026-10-24
**Status:** Concluída
**Escopo:** master
**Responsável:** Diego
**Contrato:** financeiro@1
**Regras:** FIN-02, FIN-04
**Spec mestre:** —
**Specs filhas:** —
**Dependências:** master/0007
**Solicitação original:** "Pode aprovar" (financeiro@1) e "Pode planejar", em resposta à proposta de seguir com despesas e caixa mensal depois dos pagamentos

## Objetivo e demonstração

Antes: a aba Caixa mostra só o estado vazio.
Depois: a aba Caixa abre no mês atual, com o nome do mês ("Outubro de 2026") e setas para o mês anterior e o seguinte. O mês mostra **Entradas** (soma dos pagamentos), **Saídas** (soma das despesas) e **Saldo** (entradas menos saídas, que pode ser negativo), seguidos da lista de despesas do mês com descrição, categoria, data e valor. A ação "Nova despesa" abre um formulário com descrição, categoria (Taxas, Imposto ou Materiais), valor e data, que vem preenchida com hoje e pode ser alterada. Despesa sem categoria, sem descrição ou com valor inválido é recusada. Despesas podem ser editadas e excluídas, com confirmação. Pagamentos de clientes excluídos continuam contando no mês em que foram feitos.

Demonstração: APK release em modo avião → Caixa em outubro/2026 com as entradas dos pagamentos já registrados → despesa sem categoria e com valor "abc" recusada → "Linha e botões", Materiais, R$ 35,00 → saídas e saldo atualizados → despesa "Imposto MEI" em 01/11/2026 aparece só em novembro → excluir um cliente com pagamento em outubro → a entrada continua em outubro → editar e excluir uma despesa → fechar e reabrir o app, e os valores continuam.

## Impacto previsto

- `src/finance/` (domain/data/screens) estende o módulo criado em master/0007: despesas, resumo mensal e `CashFlowScreen` no lugar do estado vazio.
- `src/calendar`: o mês de negócio (`YYYY-MM`), com mês anterior/seguinte e nome do mês em português, se não houver equivalente.
- `src/app`: rota `ExpenseForm` sai do `PendingScreen`; o repositório de despesas entra no provedor de `finance` já montado em master/0007.
- Dados: tabelas `expense` (`category IN ('fees','tax','materials')`, `amount_cents > 0`) e `payment` da migração 001, sem migração nova. As somas do mês vêm do SQL sobre `date` (`YYYY-MM-DD`), incluindo pagamentos de clientes excluídos.
- Sem dependência nova, sem rede.

## Autonomia e decisões

- Autonomia de `financeiro@1`: layout da aba Caixa e do formulário de despesa dentro da paleta.
- Data da despesa vem com hoje e pode ser alterada; a aba abre no mês atual. Como em serviços, vendas e pagamentos.
- A aba lista as despesas do mês, porque o FIN-02 pede a "lista de despesas". Os pagamentos entram só nos totais do mês, e seu detalhe continua no cliente (master/0007). Mostrar também a lista de pagamentos fica a critério do executor, sem mudar os totais.
- A descrição da despesa é obrigatória: o contrato a inclui na despesa válida e o esquema exige texto não vazio.
- Nenhuma decisão aberta: `financeiro@1` foi aprovado por Diego em 2026-10-24.

## Contexto técnico

- Fontes: esquema em [001_initial_schema.ts](../../../src/database/migrations/001_initial_schema.ts); módulo `src/finance` e provedor criados em [master/0007](../0007/README.md); padrão de formulário com seleção em [StatusSelector.tsx](../../../src/jobs/screens/StatusSelector.tsx); dinheiro em `src/money`; datas em [businessDate.ts](../../../src/calendar/businessDate.ts); `DateField`, `useFocusedLoad`, `EmptyState` em `src/ui`.
- Glossário: categoria Taxas/Imposto/Materiais = `fees`/`tax`/`materials` ([arquitetura.md](../../system/arquitetura.md#idioma)).
- Testes existentes: `schema.test.ts` cobre os CHECKs de categoria e valor; `money.test.ts` cobre a conversão; os testes de `__tests__/finance` (master/0007) cobrem pagamentos. Não repetir.
- Cada executor carrega a skill `clean-code` (incluindo `references/architecture.md`), confirma as fontes atuais e usa Graphify somente se necessário.

## Tasks

### Task 01 — Regras de despesa e resumo do mês
**Regras:** FIN-02, FIN-04
**Modo:** TDD
**Responsável:** a atribuir
**Arquivos:** `src/finance/domain/`, `src/finance/data/`, `src/finance/index.ts`, `src/calendar/` (mês de negócio), `__tests__/finance/`
**Depende de:** master/0007 integrada
**Verificação:** riscos vitais: saldo do mês errado; lançamento contado no mês vizinho (31/10 × 01/11, virada de ano); pagamento de cliente excluído sumindo do caixa; categoria fora das três; soma com ponto flutuante. Proteção existente: CHECKs do esquema, `parseCents`/`sumCents`. Lacuna → poucos testes:
- despesa válida grava a categoria e o valor em centavos; despesa sem categoria, sem descrição e com valor "abc"/"0" é recusada sem gravar;
- resumo de outubro com pagamentos e despesas em 01/10, 31/10 e 01/11 soma só os de outubro;
- saldo negativo quando as saídas superam as entradas;
- pagamento de cliente excluído conta no mês;
- lista de despesas do mês em ordem de data;
- mês anterior e seguinte na virada de ano (dez/2026 → jan/2027).
**Instrução para o executor:**
> Spec master/0008 — Task 01: contrato `financeiro@1`, regras FIN-02 e FIN-04 (dados e cálculo). No domínio, criar `Expense` e `ExpenseCategory` (`fees`, `tax`, `materials`), a validação (descrição obrigatória, categoria entre as três, valor por `parseCents` > 0, data `YYYY-MM-DD`) e o resumo do mês (entradas, saídas, saldo em centavos inteiros). Criar em `data` o CRUD de despesa, as despesas de um mês e as somas do mês de pagamentos (de todos os clientes, inclusive excluídos) e despesas. Criar em `src/calendar` o mês de negócio, com anterior/seguinte e rótulo em português, se ainda não existir. Sem migração nova. Reportar fontes e `npm test`; não escrever estado compartilhado, índices ou grafo.

### Task 02 — Aba Caixa e formulário de despesa
**Regras:** FIN-02, FIN-04
**Modo:** direto
**Responsável:** a atribuir
**Arquivos:** `src/finance/screens/` (CashFlowScreen, formulário de despesa, seletor de categoria), `src/app/navigation/Navigator.tsx` (rota `ExpenseForm`), `src/app/RepositoriesProvider.tsx` (se o provedor de `finance` precisar do novo repositório)
**Depende de:** Task 01
**Verificação:** regras protegidas na Task 01. Rodar `npx tsc --noEmit`, `npm run lint` e `npm test`. Inspeção no emulador conforme a demonstração:
- a aba abre no mês atual e as setas navegam;
- entradas, saídas e saldo conferem com os lançamentos;
- categoria obrigatória e erros junto aos campos;
- despesa em novembro só aparece em novembro;
- pagamento de cliente excluído continua nas entradas;
- editar e excluir despesa, este com confirmação.
**Instrução para o executor:**
> Spec master/0008 — Task 02: substituir o estado vazio da aba Caixa pelo mês atual, com navegação entre meses, Entradas/Saídas/Saldo, lista de despesas do mês e "Nova despesa". Implementar `ExpenseForm`, que cria e edita (`expenseId`), com categoria Taxas/Imposto/Materiais, data padrão hoje e "Excluir despesa" após confirmação, e ligar a rota no `Navigator`. A aba recarrega ao ganhar foco. Telas humildes; regras no domínio. Reportar a inspeção e os checks.

## Validação e integração

- Aceite: critérios de FIN-02 e FIN-04 observados nos testes da Task 01 e na demonstração no emulador (APK release, modo avião).
- Gates: `npx tsc --noEmit`, `npm run lint` e `npm test`; `validate-lifecycle.py --ready financeiro/FIN-02` e `financeiro/FIN-04`; `--complete master/0008`. As mudanças em `Navigator`/provedor vão exigir reemitir as evidências afetadas.
- Integração: commit no `main` local; push sob autorização de Diego.

## Diferença entre plano e resultado

- Mês de negócio em `src/calendar/businessMonth.ts`: `monthOf`, `previousMonth`, `nextMonth`, `formatBusinessMonth`. As somas e a lista do mês usam `date BETWEEN 'YYYY-MM-01' AND 'YYYY-MM-31'`, que aproveita o índice de data.
- `CashFlowRepository.totalsFor` soma `payment` sem juntar com `customer`, então pagamentos de clientes excluídos continuam contando. O teste e a demonstração confirmaram isso com duas clientes excluídas.
- Saldo negativo aparece em vermelho, com o token `danger`.
- `PendingScreen` foi removido: era o espaço reservado das rotas `PaymentForm` e `ExpenseForm`, que agora têm telas.
- Na demonstração, a descrição foi digitada sem acento ("Linha e botoes"), porque o `adb input` não digita acentos. O teste grava "Linha e botões".
- Regressão completa no mesmo build (capturas 50–69). Evidências reemitidas para CLI-01..04, SRV-01..05, PRD-01/02 e SIS-01/02/03.
- Integração: commit `fd2e190` no `main` local, sem push.

## Checklist de conclusão
- [x] Task 01 — Regras de despesa e resumo do mês
- [x] Task 02 — Aba Caixa e formulário de despesa

## Execução
$run master/0008

## Estado
O ciclo normativo define o estado. Checkboxes não concluem a spec: exigir aceite, prova corrente e integração. Publicação não faz parte do aceite.
