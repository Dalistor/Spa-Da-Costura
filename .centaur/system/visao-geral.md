# Visão geral — Spa da Costura

> Estado (2026-10-25): **clientes, serviços, produtos e financeiro implementados; backup/importação pendente** (SIS-04, SIS-05). Este documento registra a definição fornecida pelo usuário em 2026-10-23 e as lacunas abertas. A definição normativa vive nos contratos em [`../contracts/`](../contracts/); aqui ficam contexto e motivos.

## Propósito

Aplicativo Android para um ateliê de costura gerenciar seu dia a dia: clientes e suas medidas, serviços (consertos) com status, catálogo de produtos (peças inteiras) com preço e venda desses produtos a clientes, fluxo de caixa (pagamentos recebidos e despesas) e, em cada cliente, o histórico de serviços e produtos e quanto ele deve e já pagou.

## Arquitetura definida pelo usuário

- App móvel em **React Native CLI** (sem Expo), **somente Android**.
- **Sem servidor:** todos os dados ficam no aparelho, em **SQLite**. Não há conta, login, sincronização nem API remota.
- **Backup:** exportar os dados para um arquivo e importar a partir dele; a importação **substitui todos os dados** atuais.

Arquitetura proposta (ainda sem código): regras do domínio independentes da UI e do SQLite, pacotes por funcionalidade, esquema do banco e rotas em [arquitetura.md](arquitetura.md); primeira realização planejada em [master/0001](../specs/0001/README.md).

## Funcionalidades e contratos

| Área | Definição | Contrato (rascunho) |
|---|---|---|
| Sistema | Dados locais em SQLite, Android, paleta bege/marrom, backup e importação, migrações | [`sistema`](../contracts/sistema/v001.json) (aprovado) |
| Clientes | Nome; telefone e descrição opcionais; medidas livres (chave e valor); exclusão permitida com histórico | [`clientes`](../contracts/clientes/v002.json) (aprovado, v2) |
| Serviços e produtos | Serviço = conserto com status Pendente/Pronto/Entregue; produto = peça inteira do catálogo, vendida ao cliente com valor preenchido e editável | [`servicos`](../contracts/servicos/v001.json) (aprovado) |
| Financeiro | Pagamentos ligados só ao cliente (aviso se passar do devido); despesas; fluxo de caixa; total pago e devido | [`financeiro`](../contracts/financeiro/v001.json) (aprovado) |

## Design

Paleta de cores em tons de **bege e marrom**. Valores exatos (tokens) delegados ao agente na implementação.

## Vocabulário

| Termo | Significado |
|---|---|
| Cliente | Pessoa atendida pelo ateliê |
| Medida | Par chave/valor livre do cliente (ex.: "Cintura" = "72 cm") |
| Serviço | Trabalho de costura (ex.: conserto) para um cliente, com descrição, valor e status Pendente, Pronto ou Entregue |
| Produto | Peça inteira do catálogo, com nome e preço |
| Venda de produto | Produto anexado a um cliente; valor preenchido pelo preço do catálogo e editável |
| Pagamento | Entrada de dinheiro de um cliente, ligada só ao cliente; pode ser parcial |
| Despesa | Saída de dinheiro do ateliê, com categoria Taxas, Imposto ou Materiais |
| Total devido | Soma dos serviços e produtos vendidos ao cliente menos o total pago, quando positivo |
| Crédito | Valor pago a mais que o cobrado |

## Decisões tomadas (2026-10-23)

1. Armazenamento local em SQLite; React Native CLI; somente Android.
2. Medidas são campos livres: a usuária escolhe chave e valor.
3. Serviço (conserto) e produto (peça inteira vendida) são conceitos distintos.
4. Status do serviço: Pendente, Pronto, Entregue.
5. Produto anexado ao cliente tem valor preenchido pelo catálogo e editável.
6. Pagamento é ligado só ao cliente; se passar do devido, o app avisa mas permite.
7. Cada cliente mostra quanto deve e quanto pagou.
8. Backup por arquivo; a importação substitui todos os dados.
9. Exclusão de serviço e produto permitida mesmo com histórico; cliente é excluído por **soft delete** e seus pagamentos permanecem no fluxo de caixa.
10. Cliente: telefone e descrição opcionais.
11. Valor pago a mais aparece como **crédito** do cliente.
12. Serviço tem **data de entrega**, padrão hoje.
13. Fluxo de caixa separado **por mês**.
14. Tokens exatos da paleta bege/marrom: decisão delegada ao agente.
15. Despesas têm categoria: Taxas, Imposto ou Materiais.
16. (2026-10-24) Contrato `sistema@1` aprovado, com SIS-06 (migrações sem perda de dados).
17. (2026-10-24) Identificadores de código em inglês; interface em português.
18. (2026-10-24) Contrato `clientes@1` aprovado.
19. (2026-10-24) Chave de medida sem diferenciar maiúsculas e minúsculas ("Cintura" = "cintura") → `clientes@2`.
20. (2026-10-24) `servicos` (rascunho) ganhou SRV-05: serviços de clientes excluídos não aparecem na aba Serviços.
21. (2026-10-24) Contrato `servicos@1` aprovado; serviço é criado a partir do cliente (UC-01).

## Lacunas abertas

Nenhuma decisão material aberta nos contratos; todos aprovados.
