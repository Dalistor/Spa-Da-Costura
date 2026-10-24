# [0003] Excluir cliente por soft delete com confirmação (master/0003)

**Data:** 2026-10-24
**Status:** Concluído
**Modo:** TDD (Task 01) e direto (Task 02)
**Spec:** `.centaur/specs/0003/` — Tasks 01 e 02 (agente único, sequencial)

## Solicitação
"Pode rodar as duas" — segunda das specs planejadas em "Planeje a entrega do cliente no aplicativo".

## O que foi feito
- Task 01: `CustomerRepository.remove(id)` preenche `deleted_at` (e `updated_at`) só em cliente ativo e devolve `false` se não havia o que excluir; nunca `DELETE`. O repositório de medidas passou a ler só por `JOIN` com clientes ativos, então medidas de excluídos somem do detalhe e da edição.
- Task 02: botão "Excluir cliente" (variante `danger`) no detalhe, com diálogo de confirmação que explica que os pagamentos continuam no caixa; ao confirmar, volta à lista.

## Arquivos modificados
- `src/customers/domain/repositories.ts`, `src/customers/data/sqlCustomerRepository.ts`, `src/customers/data/sqlMeasurementRepository.ts`, `src/customers/screens/CustomerDetailScreen.tsx`.
- `__tests__/customers/customerRepository.test.ts` — o caso "deleted customers are hidden" (que marcava `deleted_at` à mão) virou o caso de soft delete pelo repositório, com medidas, pagamento, serviço e venda preservados.

## Decisões técnicas
- Ocultar medidas de excluídos no repositório de medidas (JOIN), não só no detalhe: qualquer tela futura que liste medidas herda a regra.
- Teste existente ampliado em vez de criar outro arquivo.

## Contrato e realização
- `clientes@1` CLI-04: implementada; evidências ev-6b2d8338d1ae4a31b919e22aad84a68b (teste) e ev-8b799c118f1a471596d8a64a8d83a3f8 (manual).
- Limite: histórico de serviços/produtos e fluxo de caixa ainda não têm telas; a preservação dos lançamentos está provada no banco (teste). FIN-04 já exige pagamentos de excluídos no caixa; `servicos@1` (rascunho) ainda não diz que a aba Serviços oculta serviços de excluídos.
- As mudanças em arquivos compartilhados desatualizaram as provas de CLI-01..03 e SIS-01..03; foram reexecutadas (testes e checagens automáticas) e a demonstração manual repetida no build novo, com novas evidências vinculadas no estado.

## Resultado da validação
- `npm test`: 63 testes passando; `npm run lint` e `npx tsc --noEmit` sem erros.
- Emulador (APK release, modo avião): confirmação aparece; cancelar mantém; confirmar remove "Ana Lima" da lista e a busca "ana" não a encontra. Demonstração completa de CLI-01..03 e reabertura repetida com "Joana Prado". Capturas 10–13.
- `validate-lifecycle.py --ready` ok para CLI-01..04 e SIS-01, SIS-02, SIS-03, SIS-06.
