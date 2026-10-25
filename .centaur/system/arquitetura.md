# Arquitetura — Spa da Costura

> Estado: **fundação implementada (2026-10-24)** em [master/0001](../specs/0001/README.md): banco, migração v1, tema e rotas; clientes e medidas em [master/0002](../specs/0002/README.md) [master/0003](../specs/0003/README.md) e [master/0004](../specs/0004/README.md) (migração 002); serviços em [master/0005](../specs/0005/README.md); produtos em [master/0006](../specs/0006/README.md); pagamentos e saldo do cliente em [master/0007](../specs/0007/README.md); despesas e caixa por mês em [master/0008](../specs/0008/README.md); a tela de Ajustes (backup) ainda está vazia. Repositórios de cada funcionalidade chegam às telas por contexto declarado na própria funcionalidade e montado em `src/app/RepositoriesProvider`. A definição normativa vive nos contratos ([sistema](../contracts/sistema/v001.json), [clientes@2](../contracts/clientes/v002.json), [servicos](../contracts/servicos/v001.json), [financeiro](../contracts/financeiro/v001.json)); este documento explica como o código os atende. Código e testes prevalecem quando existirem.

## Idioma

Identificadores de código (pastas, tipos, tabelas, colunas, rotas) em **inglês**; textos da interface em português (decisão de Diego, 2026-10-24). Glossário:

| Domínio (PT) | Código (EN) |
|---|---|
| Cliente | `customer` |
| Medida | `measurement` (`key`, `value`) |
| Serviço (conserto) | `job` — evita confusão com "service" técnico |
| Status Pendente / Pronto / Entregue | `pending` / `ready` / `delivered` |
| Data de entrega | `delivery_date` |
| Produto | `product` |
| Venda de produto | `product_sale` |
| Pagamento | `payment` |
| Despesa | `expense` |
| Categoria Taxas / Imposto / Materiais | `fees` / `tax` / `materials` |
| Fluxo de caixa | `cash_flow` |
| Total pago / devido / crédito | `totalPaid` / `amountDue` / `credit` |
| Valor em centavos | `amount_cents` / `price_cents` |
| Soft delete | `deleted_at` |

## Camadas e direção das dependências

```
screens (React Native)  ──►  domain  ◄──  data (SQL)
          ▲                                  ▲
          └────────────── app (composição) ──┘
```

- **domain** — tipos, invariantes e cálculos puros (saldo, totais, validações) e as interfaces de repositório que o domínio precisa. Não importa React, React Native, SQLite nem navegação. Testável em Node sem emulador.
- **data** — implementações dos repositórios. Todo SQL fica aqui (e nas migrações). Recebe a porta `Database`; linhas do banco são convertidas para tipos do domínio antes de sair.
- **screens** — componentes "humildes": exibem dados e encaminham ações. Formatação de dinheiro/datas usa os módulos de domínio, nunca regra própria.
- **app** — `main` da aplicação: abre o banco, roda migrações, monta os repositórios e os entrega às telas (contexto React), declara a navegação.
- Pacote por funcionalidade. Cada funcionalidade expõe um `index.ts` com o que outras podem usar; o restante não é importado de fora.

## Estrutura de pastas

```
src/
  app/            App.tsx, inicialização do banco, provedor de repositórios
    navigation/   routes.ts (tipos das rotas), Navigator.tsx
  theme/          tokens da paleta bege/marrom e tipografia
  money/          Cents: converter texto ⇄ centavos, somar, formatar R$
  calendar/       datas de negócio locais (YYYY-MM-DD ⇄ DD/MM/AAAA), sem UTC
  database/       porta Database, adaptador SQLite do app, migrations/
  customers/      domain/ data/ screens/
  jobs/           domain/ data/ screens/
  products/       catálogo e vendas de produto: domain/ data/ screens/
  finance/        pagamentos, despesas, caixa e saldo: domain/ data/ screens/
  backup/         exportar/importar (spec própria)
__tests__/        testes Jest (domínio e banco em Node, com node:sqlite)
```

Somente as pastas exigidas por uma entrega são criadas nela.

## Banco de dados (SQLite)

Regras gerais:

- Dinheiro em **centavos inteiros** (`INTEGER`), nunca `REAL`.
- Datas de negócio em texto `YYYY-MM-DD` (data local); carimbos `created_at`/`updated_at` em ISO-8601 UTC.
- `PRAGMA foreign_keys = ON` em toda conexão; versão do esquema em `PRAGMA user_version`; cada migração roda numa transação e só então incrementa a versão (SIS-06).
- Cliente nunca é apagado fisicamente: `deleted_at` marca o soft delete (CLI-04). Por isso as chaves estrangeiras para `customer` são `ON DELETE RESTRICT` — apagar um cliente com pagamentos falha no banco em vez de sumir com o caixa.
- Serviço, produto e venda admitem exclusão física (SRV-02, PRD-01, PRD-02). Excluir produto preserva a venda (`product_id` vira `NULL`; nome e valor ficam copiados na venda).

```
customer 1──N measurement
customer 1──N job
customer 1──N product_sale N──0..1 product
customer 1──N payment
expense (independente)
```

| Tabela | Colunas | Restrições |
|---|---|---|
| `customer` | `id`, `name`, `phone?`, `description?`, `created_at`, `updated_at`, `deleted_at?` | `name` não vazio; índice em `name` |
| `measurement` | `id`, `customer_id`, `key`, `value`, `created_at`, `updated_at` | FK customer RESTRICT; `key` não vazia; `UNIQUE(customer_id, key)` e, desde a migração 002, índice único `(customer_id, key COLLATE NOCASE)` (o repositório compara também acentos) |
| `job` | `id`, `customer_id`, `description`, `amount_cents`, `status`, `delivery_date`, `created_at`, `updated_at` | FK customer RESTRICT; `description` não vazia; `amount_cents >= 0`; `status IN ('pending','ready','delivered')` padrão `pending`; índice em `customer_id` |
| `product` | `id`, `name`, `price_cents`, `created_at`, `updated_at` | `name` não vazio; `price_cents >= 0` |
| `product_sale` | `id`, `customer_id`, `product_id?`, `product_name`, `amount_cents`, `date`, `created_at`, `updated_at` | FK customer RESTRICT; FK product `ON DELETE SET NULL`; `amount_cents >= 0`; índice em `customer_id` |
| `payment` | `id`, `customer_id`, `amount_cents`, `date`, `created_at`, `updated_at` | FK customer RESTRICT; `amount_cents > 0`; índices em `customer_id` e `date` |
| `expense` | `id`, `description`, `category`, `amount_cents`, `date`, `created_at`, `updated_at` | `description` não vazia; `category IN ('fees','tax','materials')`; `amount_cents > 0`; índice em `date` |

IDs são `INTEGER PRIMARY KEY` gerados pelo SQLite; a importação de backup substitui todas as tabelas de uma vez (SIS-05), então não há colisão entre aparelhos a resolver.

Derivados, nunca gravados: total pago, total devido e crédito do cliente (FIN-03); entradas, saídas e saldo do mês (FIN-04).

## Rotas

Navegação com pilha raiz contendo as abas e as telas de detalhe/formulário. Rótulos visíveis em português.

| Aba (rota) | Rótulo | Tela inicial | Contrato |
|---|---|---|---|
| `Customers` | Clientes | lista com busca por nome | CLI-01, CLI-03 |
| `Jobs` | Serviços | lista de serviços com status | SRV-01..03 |
| `Catalog` | Catálogo | produtos e preços | PRD-01 |
| `CashFlow` | Caixa | fluxo de caixa do mês e despesas | FIN-02, FIN-04 |
| `Settings` | Ajustes | backup e importação | SIS-04, SIS-05 |

| Rota da pilha | Parâmetros | Uso |
|---|---|---|
| `CustomerDetail` | `customerId` | medidas, histórico, pago/devido/crédito |
| `CustomerForm` | `customerId?` | criar/editar cliente |
| `MeasurementForm` | `customerId`, `measurementId?` | criar/editar medida |
| `JobForm` | `customerId?`, `jobId?` | criar/editar serviço |
| `ProductForm` | `productId?` | criar/editar produto |
| `ProductSaleForm` | `customerId`, `saleId?` | vender/editar venda de produto |
| `PaymentForm` | `customerId`, `paymentId?` | registrar/editar pagamento |
| `ExpenseForm` | `expenseId?` | registrar/editar despesa |

Os parâmetros são tipados em `src/app/navigation/routes.ts`; telas recebem IDs e buscam os dados no repositório, nunca objetos inteiros pela rota.
