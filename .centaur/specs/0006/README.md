# 0006 Catálogo de produtos e venda de produto ao cliente

**Data:** 2026-10-24
**Status:** Em revisão
**Escopo:** master
**Responsável:** Diego
**Contrato:** servicos@1
**Regras:** PRD-01, PRD-02, SRV-04
**Spec mestre:** —
**Specs filhas:** —
**Dependências:** master/0005
**Solicitação original:** "sim" — em resposta à proposta de planejar produtos (catálogo de peças e venda ao cliente com valor preenchido e editável, completando o histórico do cliente)

## Objetivo e demonstração

Antes: a aba Catálogo mostra só o estado vazio; o detalhe do cliente mostra serviços, mas não produtos.
Depois: na aba Catálogo, a costureira cadastra, edita e exclui peças com nome e preço. No detalhe do cliente, "Vender produto" abre a venda: ela escolhe a peça do catálogo, o valor vem preenchido com o preço e pode ser alterado antes de salvar; a venda aparece no histórico do cliente com data, nome e valor e pode ser editada ou excluída. Mudar o preço ou excluir o produto depois não altera vendas já feitas. Com o catálogo vazio, a venda orienta a cadastrar um produto.

Demonstração: APK release em modo avião → cadastrar "Vestido de festa" R$ 350,00 → produto sem nome e preço "abc" recusados → em "Maria Souza", vender o vestido trocando o valor para R$ 320,00 → histórico mostra a venda com 320,00 → mudar o preço do vestido para R$ 400,00 e depois excluí-lo → a venda continua com nome e R$ 320,00 → editar a venda e excluí-la.

## Impacto previsto

- Novo código em `src/products/` (`domain/`, `data/`, `screens/`) para catálogo e vendas, nos moldes de `src/customers` e `src/jobs`.
- `src/customers/screens/CustomerDetailScreen.tsx`: seção de produtos vendidos (completa SRV-04 junto da seção de serviços existente).
- `src/app`: repositório(s) de produtos no `RepositoriesProvider`; rotas `ProductForm` e `ProductSaleForm` saem do `PendingScreen`.
- `DateField` (hoje em `src/jobs/screens`) passa a ser compartilhado (ex.: `src/ui`), pois a venda também tem data.
- Dados: tabelas `product` e `product_sale` da migração 001, sem migração nova. O esquema já copia nome e valor na venda e zera `product_id` ao excluir o produto.
- Sem dependência nova, sem rede.

## Autonomia e decisões

- Autonomia de `servicos@1`: layout das telas de catálogo e vendas dentro da paleta.
- A data da venda vem preenchida com hoje e pode ser alterada, como a data de entrega dos serviços. O contrato prevê a data na venda, mas não diz qual é a padrão; esta é a leitura mais próxima do resto do app.
- Na edição de uma venda, o executor decide se a peça pode ser trocada. Se puder, trocar a peça preenche de novo o valor com o preço dela. O valor salvo é sempre o que está no campo.
- O histórico do cliente fica em duas seções, "Serviços" e "Produtos vendidos"; o contrato não pede uma lista única.
- Nenhuma decisão aberta: `servicos@1` foi aprovado por Diego em 2026-10-24.

## Contexto técnico

- Fontes: esquema em [001_initial_schema.ts](../../../src/database/migrations/001_initial_schema.ts). Padrão de funcionalidade em `src/jobs`: domínio com resultados explícitos; `data` sobre a porta `Database`; repositório entregue por contexto declarado na funcionalidade e montado em [RepositoriesProvider.tsx](../../../src/app/RepositoriesProvider.tsx); seção no detalhe do cliente como [CustomerJobsSection.tsx](../../../src/jobs/screens/CustomerJobsSection.tsx). Também: dinheiro em `src/money`, datas em `src/calendar`, `useFocusedLoad`/`Button`/`TextField` em `src/ui`.
- Testes existentes: [schema.test.ts](../../../__tests__/database/schema.test.ts) já cobre "excluir produto mantém a venda com nome e valor" e as restrições de preço e valor no banco; [money.test.ts](../../../__tests__/money.test.ts) cobre a conversão de valores. Não repetir.
- Direção de dependências: `customers/screens` pode usar o que `products/index.ts` expõe (seção de vendas); `products` não importa `customers`.
- Cada executor carrega a skill `clean-code` (incluindo `references/architecture.md`), confirma as fontes atuais e usa Graphify somente se necessário.

## Tasks

### Task 01 — Regras e repositórios de produtos e vendas
**Regras:** PRD-01, PRD-02, SRV-04
**Modo:** TDD
**Responsável:** Claude Code (sessão 3b466626, agente único)
**Arquivos:** `src/products/domain/`, `src/products/data/`, `src/products/index.ts`, `__tests__/products/`
**Depende de:** —
**Verificação:** riscos vitais: valor de venda gravado errado ou recalculado a partir do preço atual (mudar o preço alteraria vendas antigas e o total devido de FIN-03); venda perdida ou sem nome ao excluir o produto; valor em ponto flutuante. Proteção existente: CHECKs e `SET NULL` do esquema, `parseCents`. Lacuna → poucos testes de repositório em `node:sqlite`:
- produto salvo com preço "350,00" vira 35000 centavos;
- nome vazio e preço inválido são recusados sem gravar;
- venda grava o valor informado, e não o preço;
- mudar o preço do produto não altera a venda;
- excluir o produto mantém a venda com nome e valor na lista do cliente;
- editar e excluir uma venda afetam só aquela venda;
- a lista de vendas do cliente traz só as dele.
**Instrução para o executor:**
> Spec master/0006 — Task 01: contrato `servicos@1`, regras PRD-01, PRD-02 e SRV-04 (dados). Criar no domínio os tipos `Product` e `ProductSale`, as validações (nome obrigatório; preço e valor por `parseCents`, ≥ 0; data `YYYY-MM-DD`) com resultados explícitos e as interfaces dos repositórios. Criar em `data` o SQL sobre a porta `Database`: catálogo ordenado por nome; vendas do cliente da mais recente para a mais antiga; a venda grava `product_name` e `amount_cents`. Não usar migração nova. Reutilizar `createNodeSqliteDatabase` e não repetir o que `schema.test.ts` já cobre. Reportar fontes e `npm test`; não escrever estado compartilhado, índices ou grafo.

### Task 02 — Aba Catálogo e formulário de produto
**Regras:** PRD-01
**Modo:** direto
**Responsável:** Claude Code (sessão 3b466626, agente único)
**Arquivos:** `src/products/screens/` (catálogo, formulário de produto, contexto de repositórios), `src/app/RepositoriesProvider.tsx`, `src/app/navigation/Navigator.tsx` (rota `ProductForm`)
**Depende de:** Task 01
**Verificação:** regras protegidas na Task 01. Rodar `npx tsc --noEmit`, `npm run lint` e `npm test`. Inspeção no emulador:
- catálogo vazio com ação de cadastrar;
- erros junto aos campos;
- produto aparece com o preço em R$;
- editar e excluir (com confirmação) funcionam.
**Instrução para o executor:**
> Spec master/0006 — Task 02: substituir o estado vazio da aba Catálogo por uma lista de produtos com nome e preço e a ação "Novo produto". Implementar `ProductForm` para criar e editar, com "Excluir produto" após confirmação, e ligar a rota no `Navigator`. A mensagem de exclusão avisa que as vendas já feitas continuam no histórico. Telas humildes; regras no domínio. Reportar a inspeção e os checks.

### Task 03 — Venda ao cliente e produtos vendidos no histórico
**Regras:** PRD-02, SRV-04
**Modo:** direto
**Responsável:** Claude Code (sessão 3b466626, agente único)
**Arquivos:** `src/products/screens/` (formulário de venda e seção do cliente), `src/customers/screens/CustomerDetailScreen.tsx`, `src/app/navigation/Navigator.tsx` (rota `ProductSaleForm`), `DateField` movido de `src/jobs/screens/` para `src/ui/` (com o import de `JobFormScreen` ajustado)
**Depende de:** Task 02 (mesmos `Navigator` e `RepositoriesProvider`)
**Verificação:** regras protegidas na Task 01. Rodar os checks do projeto. Inspeção no emulador:
- escolher a peça preenche o valor com o preço;
- o valor alterado é o salvo;
- a venda aparece no histórico com data, nome e valor;
- editar e excluir a venda refletem no histórico;
- com o catálogo vazio, a venda orienta o cadastro;
- a venda de um produto excluído continua no histórico.
**Instrução para o executor:**
> Spec master/0006 — Task 03: implementar `ProductSaleForm`, que cria a venda pelo `customerId` e a edita pelo `saleId`. Ela tem seleção da peça do catálogo, valor preenchido com o preço e editável, data padrão hoje (`DateField` compartilhado) e "Excluir venda" após confirmação. No detalhe do cliente, colocar a seção "Produtos vendidos" com as vendas e a ação "Vender produto". Se o catálogo estiver vazio, orientar a cadastrar um produto. Reportar a inspeção e os checks.

## Validação e integração

- Aceite: critérios de PRD-01, PRD-02 e SRV-04 observados nos testes da Task 01 e na demonstração no emulador (APK release, modo avião), com SRV-04 passando de parcial a implementada.
- Gates: `npx tsc --noEmit`, `npm run lint` e `npm test`; `validate-lifecycle.py --ready servicos/PRD-01`, `servicos/PRD-02` e `servicos/SRV-04`; `--complete master/0006`. As mudanças em telas compartilhadas (detalhe do cliente, `Navigator`, `RepositoriesProvider`) vão exigir reemitir as evidências afetadas de clientes, serviços e sistema.
- Integração: commit no `main` local. O push depende de autorização de Diego.

## Diferença entre plano e resultado

Execução em 2026-10-24, registro [implements/0006](../../implements/0006/README.md).
- Na edição da venda, a peça pode ser trocada (o valor volta a ser o preço da nova peça). Venda de produto excluído continua editável, com a peça "Fora do catálogo".
- O repositório confere a peça antes do valor. Na primeira demonstração, salvar sem peça mostrava o erro de valor.
- Componente próprio `ProductPicker` para escolher a peça; `DateField` movido para `src/ui` como previsto.
- Mudanças em telas compartilhadas exigiram repetir no mesmo build os fluxos de CLI-01..04 e SRV-01/02/03/05 e reemitir SIS-01, 02 e 03.

## Checklist de conclusão
- [x] Task 01 — Regras e repositórios de produtos e vendas
- [x] Task 02 — Aba Catálogo e formulário de produto
- [x] Task 03 — Venda ao cliente e produtos vendidos no histórico

## Execução
$run master/0006

## Estado
O ciclo normativo define o estado. Checkboxes não concluem a spec: exigir aceite, prova corrente e integração. Publicação não faz parte do aceite.
