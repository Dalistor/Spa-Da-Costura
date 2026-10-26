<div align="center">

<img src="assets/logo/logo-512.png" alt="Spa da Costura" width="120" />

# Spa da Costura

Aplicativo Android para gerenciar um ateliê de costura: clientes, medidas, serviços, produtos, pagamentos e despesas — tudo offline, no próprio aparelho.

</div>

## Funcionalidades

- **Clientes e medidas** — cadastro com telefone e descrição opcionais, busca e medidas livres (chave e valor). A exclusão é *soft delete*: o histórico financeiro é preservado.
- **Serviços** — consertos com valor e status (A fazer, Pronto, Entregue).
- **Produtos** — catálogo de peças com preço e venda ao cliente, com valor editável.
- **Financeiro** — pagamentos (parciais ou a mais, com aviso), saldo por cliente ("Devendo" / "Saldo a favor"), despesas por categoria e caixa por mês.
- **Backup** — exportação para arquivo e restauração por arquivo (a restauração substitui todos os dados).
- **Sem servidor** — sem conta, login ou rede: os dados ficam em SQLite local.

## Tecnologias

React Native CLI (sem Expo) · TypeScript · React Navigation · SQLite via [`@op-engineering/op-sqlite`](https://github.com/OP-Engineering/op-sqlite) · Jest

## Como rodar

Requisitos: Node >= 22.11, npm, JDK e Android SDK ([guia de ambiente do React Native](https://reactnative.dev/docs/set-up-your-environment)). Somente Android.

```sh
npm install
npm start          # Metro bundler
npm run android    # compila e abre no emulador/aparelho
```

## Scripts

| Comando | O que faz |
|---|---|
| `npm test` | Testes (Jest) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Checagem de tipos |

## Estrutura

```
src/
  app/        navegação e composição do app
  database/   SQLite e migrações
  customers/  clientes e medidas
  jobs/       serviços
  products/   produtos e vendas
  money/      valores monetários
  finance/    pagamentos, despesas e caixa
  backup/     exportação e restauração
  theme/ ui/  tokens visuais e componentes
```

As regras de domínio são independentes de UI e armazenamento; o esquema do banco só muda por novas migrações. Detalhes em [`.centaur/system/arquitetura.md`](.centaur/system/arquitetura.md) e [`.centaur/system/visao-geral.md`](.centaur/system/visao-geral.md).

## Licença

Distribuído sob a [licença MIT](LICENSE).
