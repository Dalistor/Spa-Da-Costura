# [0006] Produtos: catálogo e venda ao cliente (master/0006)

**Data:** 2026-10-24
**Status:** Concluído
**Modo:** TDD (Task 01) e direto (Tasks 02 e 03)
**Spec:** `.centaur/specs/0006/` — Tasks 01 a 03 (agente único, sessão 3b466626)

## Solicitação
"sim" — em resposta à proposta de planejar produtos (catálogo de peças e venda ao cliente com valor preenchido e editável), contrato `servicos@1`.

## O que foi feito
- `src/products/domain`: `Product`, `ProductSale`, `validateProduct` (nome obrigatório, preço por `parseCents` ≥ 0), `validateProductSale` (valor e data `YYYY-MM-DD`), interfaces `ProductRepository` e `ProductSaleRepository`.
- `src/products/data`: SQL sobre a porta `Database`. Catálogo ordenado por nome (`Intl.Collator` pt-BR). A venda copia `product_name` e grava o valor informado; vendas do cliente da mais recente para a mais antiga. Excluir produto usa o `SET NULL` do esquema.
- `src/products/screens`: `CatalogScreen` (lista e "Novo produto"), `ProductFormScreen` (criar, editar, excluir com aviso de que as vendas continuam), `ProductSaleFormScreen` (peça do catálogo preenche o valor, valor editável, data padrão hoje, excluir com confirmação, catálogo vazio orienta "Cadastrar produto"), `ProductPicker`, `CustomerProductSalesSection`, contexto `ProductRepositoriesProvider`.
- `DateField` movido de `src/jobs/screens` para `src/ui` (usado por serviço e venda).
- `CustomerDetailScreen`: seção "Produtos vendidos" depois de "Serviços". `RepositoriesProvider` e `Navigator` ligam os repositórios e as rotas `ProductForm` e `ProductSaleForm`.

## Decisões técnicas
- Na edição a peça pode ser trocada; trocar preenche de novo o valor com o preço. Manter a peça mantém o nome copiado na venda, mesmo se o produto foi renomeado depois.
- Venda de produto excluído (`productId` nulo) pode ser editada; a peça aparece como "Fora do catálogo".
- A escolha da peça é verificada antes do valor. Assim, salvar sem peça mostra "Escolha um produto do catálogo." em vez do erro de valor. A ordem foi corrigida após a primeira demonstração.
- `products` não importa `customers`; o detalhe do cliente usa a seção exposta em `products/index.ts`.

## Resultado da validação
- `npm test`: 88 testes (13 novos em `__tests__/products`). `npx tsc --noEmit` e `npm run lint` sem erros. Build release ok.
- Emulador (APK release, modo avião), capturas 22–38: catálogo vazio; nome vazio e preço "abc" recusados; venda do vestido em "Maria Souza" com valor trocado para 320,00; o preço mudou para 400,00 e o produto foi excluído, mas a venda continuou com R$ 320,00; editar e excluir a venda; catálogo vazio na venda; data alterada; troca de peça preenche o preço; dados mantidos após reiniciar.
- Fluxos de clientes e serviços repetidos no mesmo build, porque o detalhe do cliente, o `DateField`, o `Navigator` e o `RepositoriesProvider` mudaram. Evidências reemitidas para CLI-01..04, SRV-01/02/03/05 e SIS-01/02/03.

## Pendências
- Nenhuma da entrega. O financeiro (FIN-03, total devido) vai somar `product_sale.amount_cents`.
