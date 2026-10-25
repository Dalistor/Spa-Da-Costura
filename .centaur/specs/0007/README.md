# 0007 Pagamentos do cliente com total pago, devido e crédito

**Data:** 2026-10-24
**Status:** Concluída
**Escopo:** master
**Responsável:** Diego
**Contrato:** financeiro@1
**Regras:** FIN-01, FIN-03
**Spec mestre:** —
**Specs filhas:** —
**Dependências:** master/0006
**Solicitação original:** "Pode aprovar" (financeiro@1) e "Pode planejar", em resposta à proposta de começar por pagamentos e totais do cliente

## Objetivo e demonstração

Antes: o detalhe do cliente mostra serviços e produtos vendidos, mas não pagamentos nem quanto o cliente deve.
Depois: no detalhe do cliente, um resumo mostra **Pago**, **Devido** e, quando o cliente pagou a mais, **Crédito**. A seção "Pagamentos" lista data e valor de cada pagamento, com a ação "Registrar pagamento". O pagamento tem valor e data, que vem preenchida com hoje e pode ser alterada. Valor zero, negativo ou vazio é recusado. Um pagamento que deixa o total pago acima do devido mostra um aviso e só é gravado se a costureira confirmar. Pagamentos podem ser editados e excluídos, com confirmação. Os totais acompanham inclusões, edições e exclusões de serviços, vendas e pagamentos.

Demonstração: APK release em modo avião → em um cliente sem histórico, registrar serviço de R$ 100,00 e vender produto de R$ 50,00 → "Devido R$ 150,00" → pagamento de "0" e de "abc" recusados → pagamento de R$ 40,00 → "Pago R$ 40,00 · Devido R$ 110,00" → pagamento de R$ 90,00 avisa que passa do devido; cancelar não grava, confirmar grava → "Pago R$ 130,00 · Devido R$ 0,00 · Crédito R$ 30,00" → editar o pagamento de 90,00 para 60,00 → "Devido R$ 0,00", sem crédito → excluir o serviço → os totais se ajustam → fechar e reabrir o app, e os pagamentos continuam.

## Impacto previsto

- Novo código em `src/finance/` (`domain/`, `data/`, `screens/`) nos moldes de `src/jobs` e `src/products`.
- `src/customers/screens/CustomerDetailScreen.tsx`: entra a seção de saldo e pagamentos exposta por `finance/index.ts`. `finance` não importa `customers`, `jobs` nem `products`.
- `src/app`: repositório(s) de finanças no `RepositoriesProvider`. A rota `PaymentForm` sai do `PendingScreen` no `Navigator`.
- Dados: tabela `payment` da migração 001 (`amount_cents > 0`, `ON DELETE RESTRICT` para `customer`), sem migração nova. Total cobrado é a soma de `job.amount_cents` e `product_sale.amount_cents` do cliente, lida por SQL no `data` de `finance` (o esquema é compartilhado em `src/database`). Totais são derivados, nunca gravados ([arquitetura.md](../../system/arquitetura.md#banco-de-dados-sqlite)).
- Sem dependência nova, sem rede.

## Autonomia e decisões

- Autonomia de `financeiro@1`: layout das telas financeiras dentro da paleta.
- Data do pagamento vem com hoje e pode ser alterada, como em serviços e vendas. O contrato exige a data, mas não diz qual é a padrão; esta é a leitura mais próxima do resto do app.
- Na edição, o aviso de "passa do devido" considera o total sem o valor antigo daquele pagamento, para não avisar por causa do próprio pagamento.
- Todos os serviços contam no devido, qualquer que seja o status: o contrato soma "os valores dos serviços" sem filtrar por status.
- Nenhuma decisão aberta: `financeiro@1` foi aprovado por Diego em 2026-10-24.

## Contexto técnico

- Fontes: esquema em [001_initial_schema.ts](../../../src/database/migrations/001_initial_schema.ts); padrão de funcionalidade em `src/products` (domínio com resultados explícitos, `data` sobre a porta `Database`, contexto declarado na funcionalidade e montado em [RepositoriesProvider.tsx](../../../src/app/RepositoriesProvider.tsx), seção no detalhe como [CustomerProductSalesSection.tsx](../../../src/products/screens/CustomerProductSalesSection.tsx)). Dinheiro em `src/money` (`parseCents`, `sumCents`, `formatCents`); datas em `src/calendar`; `DateField`, `useFocusedLoad`, `Button` e `TextField` em `src/ui`.
- Glossário: `totalPaid`, `amountDue`, `credit` ([arquitetura.md](../../system/arquitetura.md#idioma)).
- Testes existentes: [schema.test.ts](../../../__tests__/database/schema.test.ts) cobre os CHECKs de valor e o `RESTRICT` do cliente; [money.test.ts](../../../__tests__/money.test.ts) cobre a conversão. [customerRepository.test.ts](../../../__tests__/customers/customerRepository.test.ts) cobre o soft delete. Não repetir.
- Cada executor carrega a skill `clean-code` (incluindo `references/architecture.md`), confirma as fontes atuais e usa Graphify somente se necessário.

## Tasks

### Task 01 — Regras de pagamento e saldo do cliente
**Regras:** FIN-01, FIN-03
**Modo:** TDD
**Responsável:** a atribuir
**Arquivos:** `src/finance/domain/`, `src/finance/data/`, `src/finance/index.ts`, `__tests__/finance/`
**Depende de:** —
**Verificação:** riscos vitais: total devido ou crédito errado (cobrança indevida ao cliente); soma com ponto flutuante; serviço ou venda de outro cliente entrando na conta; pagamento zero ou negativo gravado; aviso de pagamento a mais calculado com o próprio pagamento na edição. Proteção existente: CHECKs do esquema e `parseCents`/`sumCents`. Lacuna → poucos testes:
- cálculo puro do saldo: 100 + 50 − 40 → pago 40, devido 110, sem crédito; cobranças 100 e pagamentos 130 → devido 0, crédito 30;
- repositório em `node:sqlite`: o saldo soma só serviços, vendas e pagamentos do cliente (com outro cliente presente) e reflete edição e exclusão de pagamento;
- pagamento "0", "-5", vazio e "abc" é recusado sem gravar;
- "passa do devido" é verdadeiro e falso nos limites, e na edição desconsidera o valor antigo.
**Instrução para o executor:**
> Spec master/0007 — Task 01: contrato `financeiro@1`, regras FIN-01 e FIN-03 (dados e cálculo). No domínio, criar o tipo `Payment`, a validação (valor por `parseCents` > 0; data `YYYY-MM-DD`) com resultados explícitos, o cálculo puro do saldo (`totalPaid`, `amountDue`, `credit` a partir de cobranças e pagamentos, com `sumCents` ou inteiros) e a regra de pagamento acima do devido. Criar também as interfaces de repositório. Em `data`, criar o SQL sobre a porta `Database`: CRUD de pagamento, pagamentos do cliente do mais recente para o mais antigo e totais de cobrança (serviços + vendas) e de pagamentos de um cliente. Sem migração nova; `finance` não importa outras funcionalidades. Reutilizar `createNodeSqliteDatabase` e não repetir o que `schema.test.ts` e `money.test.ts` já cobrem. Reportar fontes e `npm test`; não escrever estado compartilhado, índices ou grafo.

### Task 02 — Pagamentos e saldo no detalhe do cliente
**Regras:** FIN-01, FIN-03
**Modo:** direto
**Responsável:** a atribuir
**Arquivos:** `src/finance/screens/` (formulário de pagamento, seção de saldo/pagamentos, contexto de repositórios), `src/customers/screens/CustomerDetailScreen.tsx`, `src/app/RepositoriesProvider.tsx`, `src/app/navigation/Navigator.tsx` (rota `PaymentForm`)
**Depende de:** Task 01
**Verificação:** regras protegidas na Task 01. Rodar `npx tsc --noEmit`, `npm run lint` e `npm test`. Inspeção no emulador conforme a demonstração:
- totais corretos e atualizados ao voltar de serviço, venda e pagamento;
- valor inválido com erro junto ao campo;
- aviso de pagamento a mais, em que cancelar não grava e confirmar grava;
- crédito só aparece quando positivo;
- editar e excluir pagamento, este com confirmação.
**Instrução para o executor:**
> Spec master/0007 — Task 02: implementar `PaymentForm`, que cria o pagamento pelo `customerId` e o edita pelo `paymentId`. Ele tem valor, data padrão hoje (`DateField`) e "Excluir pagamento" após confirmação. Antes de gravar um valor que deixa o total pago acima do devido, pedir confirmação. No detalhe do cliente, colocar o resumo Pago/Devido/Crédito e a seção "Pagamentos" com "Registrar pagamento"; os totais recarregam ao ganhar foco. Ligar a rota no `Navigator` e o repositório no `RepositoriesProvider`. Telas humildes; regras no domínio. Reportar a inspeção e os checks.

## Validação e integração

- Aceite: critérios de FIN-01 e FIN-03 observados nos testes da Task 01 e na demonstração no emulador (APK release, modo avião).
- Gates: `npx tsc --noEmit`, `npm run lint` e `npm test`; `validate-lifecycle.py --ready financeiro/FIN-01` e `financeiro/FIN-03`; `--complete master/0007`. Como o detalhe do cliente, o `Navigator` e o `RepositoriesProvider` são compartilhados, será preciso reemitir as evidências afetadas de clientes, serviços e sistema.
- Integração: commit no `main` local; push sob autorização de Diego.

## Diferença entre plano e resultado

- **Roteiro da demonstração corrigido.** O plano dizia que um pagamento de R$ 90,00 depois de R$ 40,00 passaria do devido de R$ 150,00, chegando a "Crédito R$ 30,00". Isso estava errado: 40 + 90 = 130, abaixo de 150. O app gravou sem aviso, como deve, e esse pagamento foi excluído na demonstração. O aviso foi demonstrado com R$ 140,00, que passa do devido em R$ 30,00: "Pago R$ 180,00 · Devido R$ 0,00 · Crédito R$ 30,00". Depois o pagamento foi editado para R$ 110,00, sem aviso e sem crédito. O aceite do contrato não mudou.
- O resumo Pago/Devido/Crédito fica logo abaixo dos dados do cliente. A seção "Pagamentos" vem depois de "Produtos vendidos".
- `PaymentRepository.totalsFor` devolve cobranças (serviços + vendas) e pagamentos, somados em SQL sobre `INTEGER`. O cálculo de pago, devido e crédito e a regra do aviso (`exceedsAmountDue`) ficam no domínio.
- Para não repetir a regressão, as evidências compartilhadas (clientes, serviços, sistema) foram reemitidas uma vez só, no build da master/0008. FIN-01 e FIN-03 têm provas próprias do build da 0007, capturas 39–49.
- Integração: commit `8168deb` no `main` local, sem push.

## Checklist de conclusão
- [x] Task 01 — Regras de pagamento e saldo do cliente
- [x] Task 02 — Pagamentos e saldo no detalhe do cliente

## Execução
$run master/0007

## Estado
O ciclo normativo define o estado. Checkboxes não concluem a spec: exigir aceite, prova corrente e integração. Publicação não faz parte do aceite.
