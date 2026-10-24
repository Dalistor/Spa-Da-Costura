# 0002 Cadastrar, editar e buscar clientes com medidas

**Data:** 2026-10-24
**Status:** Em andamento
**Escopo:** master
**Responsável:** Diego
**Contrato:** clientes@1
**Regras:** CLI-01, CLI-02, CLI-03
**Spec mestre:** —
**Specs filhas:** —
**Dependências:** master/0001
**Solicitação original:** "Planeje a entrega do cliente no aplicativo"

## Objetivo e demonstração

Antes: a aba Clientes mostra só o estado vazio; as rotas `CustomerDetail`, `CustomerForm` e `MeasurementForm` apontam para `PendingScreen`.
Depois: a costureira cria um cliente (nome obrigatório, telefone e descrição opcionais), vê-o na lista, busca por parte do nome, abre o detalhe, edita os dados e adiciona, edita e remove medidas livres (chave e valor). Nome vazio, chave vazia e chave repetida são recusados com mensagem, sem gravar.

Demonstração: build release no emulador em modo avião → cadastrar "Maria Souza" com medida "Cintura" = "72 cm", buscar "mar", editar telefone, fechar e reabrir o app → cliente e medida continuam lá. Essa reabertura também fornece a evidência pendente de `sistema/SIS-02` e reforça `sistema/SIS-01`.

## Impacto previsto

- Novo código em `src/customers/` (`domain/`, `data/`, `screens/`) e na composição em `src/app/` (repositórios entregues às telas; rotas do cliente deixam de usar `PendingScreen`).
- Dados: usa as tabelas `customer` e `measurement` da migração 001 sem alterar esquema; nenhuma migração nova.
- Interface: lista com busca, formulário de cliente, detalhe com medidas, formulário de medida. Rótulos em português; cores só por tokens de `src/theme`.
- Compatibilidade: listas e buscas já filtram `deleted_at IS NULL` desde agora, para que [master/0003](../0003/README.md) só acrescente a exclusão.
- Limites herdados de `sistema@1`: sem rede, sem servidor, SQL só em `src/database` e `src/customers/data`, domínio sem React/SQLite.
- Fora desta entrega: exclusão de cliente (CLI-04 → master/0003); histórico de serviços, produtos e saldo no detalhe (contratos `servicos` e `financeiro`).

## Autonomia e decisões

- Autonomia de `clientes@1`: layout das telas de lista, cadastro e detalhe dentro da paleta do sistema.
- Autonomia de `sistema@1`: organização interna dos módulos mantendo o domínio independente da UI e do armazenamento.
- Interpretação literal adotada (sem preferência própria): "mesma chave" = igual após remover espaços nas pontas; "Cintura" e "cintura" são chaves distintas, como já garante o `UNIQUE (customer_id, key)` do banco. Se Diego quiser comparação sem diferenciar maiúsculas, é uma decisão nova (ver Decisão aberta).
- Busca por "parte do nome" sem diferenciar maiúsculas/minúsculas — leitura direta de "parte do nome"; o executor garante que funcione com acentos em maiúsculas ("ÉRICA" × "érica"), o que o `LIKE` do SQLite sozinho não cobre.
- **Decisão aberta (não bloqueia):** chave de medida sem diferenciar maiúsculas (ex.: "Cintura" = "cintura")? Recomendação: sim, evita medidas duplicadas por digitação; exige índice/comparação `COLLATE NOCASE` e, para o banco, uma migração 002. Sem resposta, a entrega segue a leitura literal acima.

## Contexto técnico

- Fontes atuais: porta [`Database`](../../../src/database/Database.ts) e esquema [001_initial_schema.ts](../../../src/database/migrations/001_initial_schema.ts); composição em [src/app/App.tsx](../../../src/app/App.tsx) e [DatabaseContext.tsx](../../../src/app/DatabaseContext.tsx); rotas tipadas em [routes.ts](../../../src/app/navigation/routes.ts) e [Navigator.tsx](../../../src/app/navigation/Navigator.tsx); tela vazia em [CustomersScreen.tsx](../../../src/customers/screens/CustomersScreen.tsx); tokens em `src/theme`; `EmptyState` em `src/ui`.
- Testes existentes a reutilizar: [schema.test.ts](../../../__tests__/database/schema.test.ts) (FK de medida, chave repetida recusada pelo banco, reabertura sem perda) e o adaptador [nodeSqliteDatabase.ts](../../../__tests__/support/nodeSqliteDatabase.ts); [App.test.tsx](../../../__tests__/App.test.tsx) renderiza o app real com `node:sqlite`.
- Direção das dependências ([arquitetura.md](../../system/arquitetura.md)): `screens → domain ← data`, `app` compõe. O domínio declara a interface do repositório; `data` implementa com a porta `Database` e devolve tipos do domínio (nunca `Row`). As telas acessam o repositório por um contexto/hook declarado no próprio `customers` e provido por `src/app`, evitando ciclo `customers → app`. Outras funcionalidades só importam o `index.ts` de `customers`.
- Erros esperados da usuária (nome vazio, chave vazia/repetida) são resultados explícitos do domínio, não exceções; violação do `UNIQUE` vinda do banco é traduzida em "chave repetida" no `data`.
- Identificadores em inglês conforme o glossário (`customer`, `measurement`, `key`, `value`); textos em português.
- Cada executor carrega a skill `clean-code` (incluindo `references/architecture.md`), confirma as fontes atuais antes de editar e usa Graphify somente se necessário.

## Tasks

### Task 01 — Regras e repositório de clientes e medidas
**Regras:** CLI-01, CLI-02, CLI-03
**Modo:** TDD
**Responsável:** Claude Code (sessão f61330bd, agente único)
**Arquivos:** `src/customers/domain/`, `src/customers/data/`, `src/customers/index.ts`, `__tests__/customers/`
**Depende de:** —
**Verificação:** risco vital: integridade cliente → medidas e persistência (editar/remover medida de um cliente afetar outro; edição não gravada; chave repetida passando ou derrubando o app com erro cru do banco; cliente sem nome gravado). Proteção existente cobre só o esquema (FK, `UNIQUE`, `CHECK`). Lacuna → poucos testes de repositório em `node:sqlite`: criar e reler cliente com e sem opcionais; nome vazio recusado sem gravar; editar cliente; medida adicionada, editada e removida só no seu cliente; chave vazia e repetida recusadas como resultado do domínio; busca por parte do nome sem diferenciar maiúsculas (com acento); cliente com `deleted_at` fora da lista e da busca; dados relidos após reabrir o arquivo do banco.
**Instrução para o executor:**
> Spec master/0002 — Task 01: contrato `clientes@1`, regras CLI-01..03. Criar em `src/customers/domain` os tipos `Customer`/`Measurement`, a validação de entrada (nome obrigatório; chave obrigatória e única por cliente, comparada após `trim`) com resultados explícitos e a interface do repositório; em `src/customers/data` a implementação SQL sobre a porta `Database`, filtrando `deleted_at IS NULL` em listagem, busca e leitura. Busca por parte do nome sem diferenciar maiúsculas, inclusive acentuadas. Não alterar migrações. Ciclos red-green-refactor mínimos; reutilizar `createNodeSqliteDatabase` e não repetir os casos que `schema.test.ts` já cobre. Pode escolher nomes internos e forma dos resultados. Reportar fontes, testes e saída de `npm test`; não escrever estado compartilhado, índices ou grafo.

### Task 02 — Lista com busca, cadastro, edição e detalhe do cliente
**Regras:** CLI-01, CLI-03
**Modo:** direto
**Responsável:** Claude Code (sessão f61330bd, agente único)
**Arquivos:** `src/customers/screens/` (lista, formulário, detalhe), `src/customers/index.ts`, `src/app/` (prover o repositório), `src/app/navigation/Navigator.tsx` (rotas `CustomerDetail` e `CustomerForm`), `__tests__/App.test.tsx` só se o render mudar
**Depende de:** Task 01
**Verificação:** fora de ponto vital novo (regras protegidas na Task 01). `npx tsc --noEmit`, `npm run lint`, `npm test` (teste existente do app continua verde); inspeção no emulador: criar com e sem opcionais, nome vazio recusado com mensagem, buscar parte do nome, editar e ver a mudança no detalhe.
**Instrução para o executor:**
> Spec master/0002 — Task 02: substituir o estado vazio da aba Clientes por lista com campo de busca e ação "Novo cliente" (estado vazio mantido quando não houver clientes); implementar `CustomerForm` (criar/editar por `customerId?`) e `CustomerDetail` (nome, telefone, descrição e seção de medidas, ainda só listagem) e ligá-las no `Navigator` no lugar do `PendingScreen`. Telas humildes: validação e regras vêm do domínio; rota carrega só IDs. Recarregar a lista/detalhe ao voltar do formulário. Cores só por tokens. Layout livre dentro da paleta. Reportar capturas ou descrição da inspeção e checks.

### Task 03 — Medidas no detalhe do cliente
**Regras:** CLI-02
**Modo:** direto
**Responsável:** Claude Code (sessão f61330bd, agente único)
**Arquivos:** `src/customers/screens/` (formulário de medida e seção de medidas do detalhe), `src/app/navigation/Navigator.tsx` (rota `MeasurementForm`)
**Depende de:** Task 02 (mesmo `Navigator.tsx` e tela de detalhe; execução serial)
**Verificação:** regras protegidas na Task 01. `npx tsc --noEmit`, `npm run lint`, `npm test`; inspeção no emulador: adicionar "Cintura" = "72 cm", editar, remover, chave vazia e chave repetida recusadas com indicação no campo.
**Instrução para o executor:**
> Spec master/0002 — Task 03: implementar `MeasurementForm` (criar/editar por `customerId` e `measurementId?`) e, no detalhe, adicionar, editar e remover medidas (remoção com confirmação simples). Mensagens de chave vazia/repetida vindas do resultado do domínio, mostradas junto ao campo. Ligar a rota no `Navigator`. Reportar inspeção e checks.

## Validação e integração

- Aceite: critérios de CLI-01, CLI-02 e CLI-03 observados — testes da Task 01 + demonstração no emulador (build release, modo avião), incluindo fechar e reabrir com os dados presentes.
- Evidências: `record-evidence.py` para `clientes/CLI-01..03` com o teste de repositório e as fontes; evidência manual da demonstração; evidência de `sistema/SIS-02` (reabertura pela UI) registrada pelo coordenador no estado de `sistema`.
- Gates: `npx tsc --noEmit`, `npm run lint`, `npm test`; `validate-lifecycle.py --ready clientes/CLI-01`, `clientes/CLI-02`, `clientes/CLI-03` e `--complete master/0002`.
- Integração: commit no `main` local sob autorização de Diego; push e publicação só com pedido explícito.

## Diferença entre plano e resultado

Execução em 2026-10-24, registro [implements/0002](../../implements/0002/README.md).
- Busca filtrada em memória pela função de domínio `searchByName` (não por SQL), cobrindo maiúsculas acentuadas.
- Chave repetida conferida por consulta antes de gravar; o `UNIQUE` do banco continua como proteção.
- `src/ui` ganhou `Button` e `TextField` (reutilizáveis pelas próximas telas); repositórios entregues por contexto declarado em `customers` e provido por `src/app/RepositoriesProvider`.
- Remoção de medida: tocar e segurar no item, com confirmação.
- Sem migração nova, sem mudança em `android/`; aviso de `act` no teste preexistente de falha ao abrir o banco não foi tocado.
- Demonstração (2026-10-24): APK release x86_64 no emulador Pixel_API_36, dados limpos, modo avião; todos os critérios observados e dados mantidos após `am force-stop` e reabertura. Evidências de CLI-01..03 (teste + manual) e SIS-02 (manual) correntes; `--ready` ok.

## Checklist de conclusão
- [x] Task 01 — Regras e repositório de clientes e medidas
- [x] Task 02 — Lista com busca, cadastro, edição e detalhe do cliente
- [x] Task 03 — Medidas no detalhe do cliente

## Execução
$run master/0002

## Estado
O ciclo normativo define o estado. Checkboxes não concluem a spec: exigir aceite, prova corrente e integração. Publicação não faz parte do aceite.
