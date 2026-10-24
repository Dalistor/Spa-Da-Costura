# [0001] Fundação: banco local migrado, tema e rotas

**Data:** 2026-10-24
**Status:** Concluído
**Modo:** TDD (Tasks 02 e 03) e direto (Tasks 01, 04 e 05)
**Spec:** `.centaur/specs/0001/` — Tasks 01 a 05 (agente único, sequencial; um registro para a spec inteira)

## Solicitação
"Pode executar a 0001" — spec planejada a partir de "criar a arquitetura do aplicativo, a estruturar banco de dados e suas relações e rotas no app".

## Contexto
Primeira realização da [arquitetura](../../system/arquitetura.md): substitui a tela do scaffold por um app que abre o SQLite local, aplica migrações e mostra a navegação no tema bege/marrom.

## O que foi feito
- Task 01: instaladas `@react-navigation/native` 7.5.1, `native-stack` 7.21.0, `bottom-tabs` 7.21.0, `react-native-screens` 4.30.0 e `@op-engineering/op-sqlite` 18.2.5; removido `@react-native/new-app-screen`. Jest passa a transformar `@react-navigation` e ignora `__tests__/support/`.
- Task 02: `src/money` — `parseCents` (formato brasileiro, aceita "." decimal do teclado Android, recusa vazio/inválido/negativo como valor), `formatCents` ("R$ 1.234,56") e `sumCents` (recusa não inteiros).
- Task 03: `src/database` — porta `Database`, `migrate` (transação por migração, `PRAGMA user_version`, versões sequenciais, recusa banco mais novo), `initializeDatabase` (liga `foreign_keys`), migração 001 com as 7 tabelas, FKs RESTRICT para cliente, `SET NULL` para produto na venda, CHECKs de texto, status, categoria, data `YYYY-MM-DD` e centavos inteiros (`typeof = 'integer'`). Adaptador nativo `openAppDatabase` (op-sqlite).
- Task 04: `src/theme` (cores, espaçamento, tipografia), `src/ui/EmptyState`, `src/app/navigation` (`routes.ts` tipado, `Navigator` com 5 abas e 8 rotas de pilha), telas vazias das abas em cada funcionalidade.
- Task 05: `src/app/App` recebe `openDatabase`, abre e migra antes da navegação e mostra erro em português na falha; `DatabaseProvider`/`useDatabase`; `App.tsx` da raiz é a composição com o op-sqlite.

## Arquivos modificados
- `App.tsx` — virou raiz de composição.
- `__tests__/App.test.tsx` — renderiza o app com banco `node:sqlite` real; caso de falha ao abrir.
- `jest.config.js` — `transformIgnorePatterns` e `testPathIgnorePatterns`.
- `package.json`, `package-lock.json` — dependências.

## Arquivos criados
- `src/money/` — dinheiro em centavos.
- `src/database/` — porta, migrações, esquema v1, adaptador op-sqlite.
- `src/theme/`, `src/ui/` — tokens e estado vazio.
- `src/app/` — App, contexto do banco, inicialização, navegação.
- `src/{customers,jobs,products,finance,backup}/` — telas vazias das abas.
- `__tests__/money.test.ts`, `__tests__/database/schema.test.ts`, `__tests__/support/nodeSqliteDatabase.ts`.

## Decisões técnicas
- Migrações como lista de instruções (não uma string com vários comandos): o `execute` do SQLite prepara um comando por vez nos dois adaptadores.
- `openAppDatabase` fica fora de `src/database/index.ts` para que código em Node (testes) nunca carregue o módulo nativo.
- `App` recebe a fábrica do banco por prop: o teste usa o app real com `node:sqlite` em vez de mockar o banco.
- Rotas de pilha ainda sem tela usam `PendingScreen` (um componente) em vez de um arquivo vazio por rota; abas têm telas próprias por funcionalidade. Desvio menor do plano da Task 04, dentro da autonomia.
- `StatusBar` sem `backgroundColor`: a prop não existe mais no RN 0.88 (edge-to-edge).
- `useDatabase` é exportado sem consumidor ainda; é a entrada que as próximas specs usarão para montar repositórios.

## Como validar
`npm test`, `npm run lint`, `npx tsc --noEmit`. No aparelho: `npm run android` em modo avião, conferir as 5 abas e reabrir o app.

## Contrato e realização
- `sistema@1`: SIS-01 (ev-f549c69f82d64ebab6d40958c2a30138), SIS-03 (ev-0b9ecc6162bd4557ae2a08136ab6e394), SIS-06 (ev-33228507ad9d4e318f0e5e608ea74687) — implementadas, evidência corrente, entrega `local`. Estado em `.centaur/state/sistema.json`.
- Impacto previsto × real: conforme a spec; sem mudança em `android/` (autolink).
- Próximo passo: integrar (commit) e seguir para a spec de clientes.

## Resultado da validação
- `npm test`: 3 suítes, 53 testes passando.
- `npm run lint`: sem erros. `npx tsc --noEmit`: sem erros.
- `validate-lifecycle.py --ready` para SIS-01, SIS-03, SIS-06: ok.
- Android (2026-10-24, emulador Pixel_API_36 criado nesta sessão; JDK 17 já existente em `/usr/local/java`): `assembleDebug` BUILD SUCCESSFUL (7m28s, 4 ABIs); `assembleRelease -PreactNativeArchitectures=x86_64` BUILD SUCCESSFUL (6m11s). op-sqlite e react-native-screens compilam e rodam com RN 0.88.
- Release em modo avião: abre, reabre e navega sem erro no logcat; banco do aparelho com `user_version` 1 e 7 tabelas, arquivo não reescrito ao reabrir. Evidências manuais ev-2415f739…, ev-0aa4b4cb…, ev-cf6a9fc9…
