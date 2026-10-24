# 0001 App abre com banco local migrado, tema e rotas

**Data:** 2026-10-24
**Status:** Concluída
**Escopo:** master
**Responsável:** Diego
**Contrato:** sistema@1
**Regras:** SIS-01, SIS-03, SIS-06
**Spec mestre:** —
**Specs filhas:** —
**Dependências:** —
**Solicitação original:** "Pode começar a criar a arquitetura do aplicativo, a estruturar banco de dados e suas relações e rotas no app"

## Objetivo e demonstração

Antes: o app abre a tela padrão do scaffold React Native.
Depois: o app abre no Android com a paleta bege/marrom, cria (ou atualiza) o banco SQLite local com todas as tabelas e relações do domínio e mostra as cinco abas (Clientes, Serviços, Catálogo, Caixa, Ajustes) com a pilha de rotas tipadas registrada. As telas ainda não têm funcionalidade: mostram título e estado vazio, preenchidas pelas specs seguintes.

Demonstração: `npm run android` em modo avião → app abre nas abas; fechar e reabrir não reaplica migração; testes Jest do esquema passam em Node.

## Impacto previsto

- Novo código em `src/app`, `src/theme`, `src/money`, `src/database` e telas vazias por funcionalidade, conforme [arquitetura.md](../../system/arquitetura.md).
- `App.tsx` da raiz passa a delegar para `src/app`; `__tests__/App.test.tsx` adaptado.
- Dependências novas: navegação (React Navigation: native, native-stack, bottom-tabs e peers) e driver SQLite nativo (recomendado `@op-engineering/op-sqlite`). Testes usam `node:sqlite` do Node 24 já instalado, sem dependência extra.
- Android: autolink dos módulos nativos; nenhuma permissão de rede nova.
- Limites herdados: sem servidor, sem rede para dados, somente Android, RN CLI sem Expo, dinheiro sem ponto flutuante.

## Autonomia e decisões

- Autonomia do contrato `sistema`: organizar módulos internos mantendo o domínio independente da UI e do armazenamento; definir os tokens exatos da paleta.
- Escolha das bibliotecas é técnica: o executor confirma a compatibilidade com React Native 0.88 / Nova Arquitetura na versão instalada e pode trocar por alternativa equivalente (registrando o motivo).
- Decisões resolvidas por Diego em 2026-10-24 (sessão de planejamento): contrato `sistema@1` aprovado, incluindo SIS-06; identificadores de código em inglês, interface em português — glossário em [arquitetura.md](../../system/arquitetura.md#idioma).
- Nenhuma decisão aberta para esta entrega.

## Contexto técnico

- Fontes atuais: scaffold RN 0.88 ([App.tsx](../../../App.tsx), [package.json](../../../package.json)); nenhuma pasta `src/`. Teste existente: `__tests__/App.test.tsx` (render do app).
- Desenho alvo: [arquitetura.md](../../system/arquitetura.md) — camadas, pastas, tabelas, restrições e rotas.
- Identificadores em inglês conforme o glossário; textos de interface em português. Cada executor carrega a skill `clean-code` (ver `references/architecture.md`), confirma as fontes atuais e usa Graphify somente se necessário.
- A porta `Database` (executar, consultar, transação) é declarada em `src/database` e tem dois adaptadores: o nativo para o app e um `node:sqlite` só para testes. Migrações são SQL puro, reutilizado pelos dois.

## Tasks

### Task 01 — Dependências e esqueleto de pastas
**Regras:** SIS-01
**Modo:** direto
**Responsável:** Claude Code (sessão ee565174, agente único)
**Arquivos:** `package.json`, `package-lock.json`, `jest.config.js`, `babel.config.js` se exigido, `android/` apenas o que o autolink exigir
**Depende de:** —
**Verificação:** `npm install`, `npx tsc --noEmit`, `npm test` (teste existente) e build Android compilando.
**Instrução para o executor:**
> Spec master/0001 — Task 01: instalar navegação (React Navigation native + native-stack + bottom-tabs com peers) e o driver SQLite nativo, conferindo compatibilidade com RN 0.88 nas versões reais. Configurar mocks Jest necessários para os módulos nativos. Não adicionar biblioteca de rede, estado global ou UI kit. Reportar versões instaladas e qualquer troca de biblioteca; não escrever estado compartilhado, índices ou grafo.

### Task 02 — Cents (dinheiro sem ponto flutuante)
**Regras:** SIS-06 (base do esquema em centavos); prepara FIN-03/FIN-04
**Modo:** TDD
**Responsável:** Claude Code (sessão ee565174, agente único)
**Arquivos:** `src/money/`, `__tests__/money.test.ts`
**Depende de:** Task 01
**Verificação:** risco vital: valor digitado "12,50"/"1.234,56" virar centavos errados ou soma com float. Sem proteção existente → testes unitários de conversão texto⇄centavos, rejeição de entrada inválida/negativa e formatação `R$ 1.234,56`.
**Instrução para o executor:**
> Spec master/0001 — Task 02: módulo puro em TypeScript sem dependência de React Native. Converte texto no formato brasileiro para centavos inteiros, recusa entradas inválidas com resultado explícito (sem exceção para entrada de usuário), soma e formata em reais. Ciclos red-green-refactor mínimos. Reportar fontes e resultado de `npm test`.

### Task 03 — Banco local, migração v1 e relações
**Regras:** SIS-01, SIS-06
**Modo:** TDD
**Responsável:** Claude Code (sessão ee565174, agente único)
**Arquivos:** `src/database/` (porta, adaptador nativo, `migrations/`, executor de migrações), `__tests__/database/` (adaptador `node:sqlite` de teste e testes)
**Depende de:** Task 01
**Verificação:** riscos vitais: migração reaplicada ou parcial perdendo dados; registros órfãos; dinheiro gravado como real. Sem proteção existente → testes com `node:sqlite` em memória: banco vazio chega à versão 1 com todas as tabelas; segunda abertura não reaplica; migração com erro faz rollback e mantém `user_version`; FK recusa medida/serviço/venda/pagamento sem cliente; `DELETE` de cliente com pagamento é recusado; excluir produto mantém a venda com `product_id` nulo; `CHECK` de status, categoria e valores.
**Instrução para o executor:**
> Spec master/0001 — Task 03: implementar a porta `Database`, o executor de migrações (transação por migração, `PRAGMA user_version`, `foreign_keys = ON`) e a migração 001 exatamente com as tabelas e restrições de `.centaur/system/arquitetura.md`. SQL só em `src/database` (e futuramente em `*/data`). Adaptador nativo fino, sem decisões. Pode ajustar nomes internos e índices sem mudar restrições. Reportar fontes, SQL final e resultado dos testes.

### Task 04 — Tema bege/marrom e navegação com rotas tipadas
**Regras:** SIS-03
**Modo:** direto
**Responsável:** Claude Code (sessão ee565174, agente único)
**Arquivos:** `src/theme/`, `src/app/navigation/`, telas vazias em `src/{customers,jobs,products,finance,backup}/screens/`
**Depende de:** Task 01
**Verificação:** `npx tsc --noEmit` cobre a tipagem das rotas; inspeção no emulador das cinco abas e das cores vindas dos tokens.
**Instrução para o executor:**
> Spec master/0001 — Task 04: criar tokens centralizados (fundo, superfície, texto, texto secundário, destaque, borda, erro) em tons de bege e marrom; nenhuma cor literal fora de `src/theme`. Declarar `routes.ts` com a pilha e as abas da tabela de rotas de `arquitetura.md` e um `Navigator` com tema aplicado. Telas vazias mostram apenas título e estado vazio em português, deixando claro no código que serão preenchidas por specs futuras. Reportar capturas ou descrição da inspeção.

### Task 05 — Composição do app e inicialização do banco
**Regras:** SIS-01, SIS-06
**Modo:** direto
**Responsável:** Claude Code (sessão ee565174, agente único)
**Arquivos:** `App.tsx` (raiz), `src/app/`, `__tests__/App.test.tsx`
**Depende de:** Tasks 03 e 04
**Verificação:** teste existente de render adaptado (mock do banco); demonstração no emulador em modo avião: abre nas abas; fechar e reabrir mantém `user_version` = 1 sem erro.
**Instrução para o executor:**
> Spec master/0001 — Task 05: o `App.tsx` da raiz delega para `src/app`. Ao iniciar, abrir o banco, rodar migrações e só então renderizar a navegação; em falha, mostrar mensagem de erro em português sem continuar. Disponibilizar o banco/repositórios por contexto React montado só em `src/app`. Remover dependência de `@react-native/new-app-screen` se deixar de ser usada. Reportar demonstração e checks.

## Validação e integração

- Aceite: critérios de SIS-01, SIS-03 e SIS-06 observados (testes de banco + demonstração no emulador); `npx tsc --noEmit`, `npm run lint` e `npm test` verdes.
- Gate: `validate-lifecycle.py --ready sistema/SIS-01`, `sistema/SIS-03`, `sistema/SIS-06` após registrar evidências.
- Integração: commit no `main` local sob autorização do responsável; sem publicação.
- SIS-02 (persistência entre reinícios) só é demonstrável com a primeira tela que grava dados — fica para a spec de clientes.

## Diferença entre plano e resultado

Execução em 2026-10-24, registro [implements/0001](../../implements/0001/README.md).
- Rotas de pilha sem tela usam um único `PendingScreen` em `src/app/navigation`; abas têm telas próprias por funcionalidade; estado vazio compartilhado em `src/ui`.
- `App` recebe a fábrica do banco; o teste existente passou a renderizar o app real com `node:sqlite`.
- Migrações como lista de instruções; `openAppDatabase` fora do `index.ts` de `src/database`.
- `StatusBar` sem `backgroundColor` (removida no RN 0.88).
- Nenhuma mudança em `android/`.
- Demonstração (2026-10-24) no emulador Pixel_API_36 (Android 36, x86_64): build debug e release ok; release com JS embutido abre, reabre e navega em modo avião; banco no aparelho com v1 e 7 tabelas, sem reaplicar migração. O APK debug não carrega em modo avião porque busca o JS no Metro pela rede (só desenvolvimento). Capturas em `.centaur/evidence/screens/`.
- Integrada em `main` (e504e41, push para origin em 2026-10-24, autorizado por Diego); `validate-lifecycle.py --complete master/0001` ok.

## Checklist de conclusão
- [x] Task 01 — Dependências e esqueleto de pastas
- [x] Task 02 — Cents (dinheiro sem ponto flutuante)
- [x] Task 03 — Banco local, migração v1 e relações
- [x] Task 04 — Tema bege/marrom e navegação com rotas tipadas
- [x] Task 05 — Composição do app e inicialização do banco

## Execução
$run master/0001

## Estado
O ciclo normativo define o estado. Checkboxes não concluem a spec: exigir aceite, prova corrente e integração. Publicação não faz parte do aceite.
