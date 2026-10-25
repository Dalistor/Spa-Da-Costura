# [0007] Pagamentos do cliente com total pago, devido e crédito (master/0007)

**Data:** 2026-10-25
**Status:** Concluído
**Modo:** TDD (Task 01) e direto (Task 02)
**Spec:** `.centaur/specs/0007/`: Tasks 01 e 02, feitas por um agente único na sessão 3b466626

## Solicitação
"Pode executar as specs 0007 e 0008". Contrato `financeiro@1`, regras FIN-01 e FIN-03.

## O que foi feito
- **`src/finance/domain`:**
  - `Payment` e `validatePayment`: valor por `parseCents`, maior que zero, e data `YYYY-MM-DD`.
  - `customerBalance`: calcula `totalPaid`, `amountDue` e `credit` a partir das cobranças e dos pagamentos.
  - `exceedsAmountDue`: na edição, desconsidera o valor antigo do pagamento.
  - Interface `PaymentRepository`.
- **`src/finance/data/sqlPaymentRepository.ts`:**
  - CRUD de pagamentos.
  - Lista do mais recente para o mais antigo.
  - `totalsFor`: soma de `job` + `product_sale` e de `payment` do cliente.
- **`src/finance/screens`:**
  - `PaymentFormScreen`: data padrão hoje; aviso "Pagamento acima do devido" com Cancelar/Gravar; exclusão com confirmação.
  - `CustomerBalanceSection`: Pago, Devido e Crédito, este só quando for positivo.
  - `CustomerPaymentsSection`.
  - Contexto `FinanceRepositoriesProvider`.
- **Integração ao app:** `CustomerDetailScreen`, `RepositoriesProvider` e `Navigator` (rota `PaymentForm`).

## Decisões técnicas
- `finance` lê `job` e `product_sale` só por SQL na sua camada `data`, sem importar outras funcionalidades.
- Os totais são derivados a cada carga e nunca gravados.

## Resultado da validação
- **Testes:** `npm test` passou com 99 testes, 11 deles novos em `__tests__/finance/paymentRepository.test.ts`. `tsc` e `lint` sem erros.
- **Emulador (capturas 39–49):** APK release em modo avião, com a cliente "Lucia Ramos".
  - Devido chegou a R$ 150,00.
  - Os valores "0" e "abc" foram recusados.
  - Com R$ 40,00 pagos, Devido ficou em R$ 110,00.
  - O pagamento de R$ 140,00 gerou aviso. Cancelar não gravou e Gravar gravou: Pago R$ 180,00, Crédito R$ 30,00.
  - Edição para R$ 110,00 não mostrou aviso.
  - A exclusão pediu confirmação.
  - Excluir o serviço ajustou os totais.
  - Tudo continuou igual depois de reiniciar o app.
- **Roteiro corrigido:** o roteiro original estava com a conta errada (R$ 90,00 não passava do devido). Detalhes na spec.

## Pendências
- Push não autorizado ainda.
