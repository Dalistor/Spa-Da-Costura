# 0009 Backup dos dados em arquivo e importação que substitui tudo

**Data:** 2026-10-25
**Status:** Pendente
**Escopo:** master
**Responsável:** Diego
**Contrato:** sistema@1
**Regras:** SIS-04, SIS-05
**Spec mestre:** —
**Specs filhas:** —
**Dependências:** master/0008
**Solicitação original:** "pode dar push e planejar a spec", em resposta à proposta de planejar backup e importação por arquivo (SIS-04, SIS-05)

## Objetivo e demonstração

Antes: a aba Ajustes mostra só o estado vazio. Os dados do ateliê existem apenas no banco do aparelho.

Depois, a aba Ajustes tem duas ações:
- **Gerar backup:** abre o seletor de arquivos do Android para salvar `spa-da-costura-AAAA-MM-DD.json` onde a costureira quiser, como Downloads, Drive ou cartão. O arquivo contém todos os dados: clientes (inclusive os excluídos), medidas, serviços, produtos, vendas, pagamentos e despesas. Ao terminar, aparece "Backup salvo".
- **Importar backup:**
  1. A costureira escolhe um arquivo.
  2. O app avisa que todos os dados atuais serão substituídos e pede confirmação.
  3. Com a confirmação, os dados passam a ser exatamente os do arquivo.
- **Arquivo inválido:** um arquivo inválido, corrompido ou de uma versão mais nova do app é recusado com mensagem, e os dados atuais continuam como estavam.

Demonstração no APK release em modo avião:
1. Gerar o backup e salvá-lo em Downloads. Conferir com `adb shell` que o arquivo contém clientes, inclusive excluídos, vendas, pagamentos e despesas.
2. Cadastrar a cliente "Depois do backup" e uma despesa nova.
3. Importar o backup e cancelar no aviso: nada muda.
4. Importar de novo e confirmar: "Depois do backup" e a despesa somem, os demais dados ficam iguais aos do arquivo, e o caixa e o saldo dos clientes conferem.
5. Importar um `.json` corrompido (editado com `adb push`) e outro arquivo qualquer: os dois são recusados com mensagem e os dados não mudam.
6. Fechar e reabrir o app: os dados importados continuam.

## Impacto previsto

- `src/backup/`:
  - `domain/`: formato do arquivo e validação, com resultados explícitos.
  - `data/`: exportar e importar sobre a porta `Database`.
  - `screens/`: `SettingsScreen` no lugar do estado vazio.
  - `index.ts`.
- Arquivo no Android: um módulo nativo pequeno em Kotlin, em `android/app/src/main/java/com/spadacostura/`, registrado no `MainApplication`. Ele usa o Storage Access Framework do Android, que dispensa permissão de armazenamento:
  - `ACTION_CREATE_DOCUMENT` para salvar o texto em um arquivo escolhido pela costureira;
  - `ACTION_OPEN_DOCUMENT` para ler o texto do arquivo escolhido.

  O lado JS fica num adaptador em `src/backup/` (por exemplo `files/`). Só a tela usa esse adaptador, e os testes nunca o carregam, como acontece com `openAppDatabase`.
- Dados: todas as tabelas da migração atual (`customer`, `measurement`, `job`, `product`, `product_sale`, `payment`, `expense`), com ids, `created_at`, `updated_at` e `deleted_at`. O backup também registra `PRAGMA user_version`. Não há migração nova.
- Sem rede. Sem dependência JS nova, a menos que o módulo nativo se mostre inviável (ver Autonomia).

## Autonomia e decisões

- **Formato do arquivo:** `sistema@1` delega a escolha, desde que o arquivo contenha todos os dados e seja validado na importação. A escolha é JSON legível, com:
  - um marcador de formato (por exemplo `"format": "spa-da-costura-backup"`);
  - a versão do esquema (`user_version`);
  - a data da geração;
  - as linhas de cada tabela com as colunas do banco.
- **Importação:** é uma única transação. Ela apaga as tabelas, das filhas para as mães, e insere as linhas do arquivo, das mães para as filhas, preservando os ids. Qualquer erro desfaz tudo: JSON inválido, marcador ou tabela ausente, coluna faltando, CHECK violado ou registro órfão. Os dados atuais permanecem. As chaves estrangeiras e os CHECKs do esquema fazem parte da validação.
- **Versão do esquema:** a importação aceita backup com a mesma versão do esquema atual. Versão mais nova é recusada com "Este backup é de uma versão mais nova do app." Hoje só existe a versão 2, então converter backups antigos fica para quando houver nova migração. Isso é registrado aqui; não é decisão aberta.
- **Arquivo no Android:** a preferência é um módulo nativo próprio com o Storage Access Framework, porque não traz dependência nova e funciona offline. Se ele se mostrar inviável no RN 0.88, o executor pode trocar por uma biblioteca mantida e offline, como `@react-native-documents/picker` junto com uma de leitura e escrita de arquivo. Nesse caso, o motivo fica registrado na diferença entre plano e resultado.
- **Nome do arquivo:** `spa-da-costura-AAAA-MM-DD.json` traz a data de hoje, e a costureira pode mudar o nome no seletor do Android.
- **Depois de importar:** as telas recarregam ao ganhar foco (`useFocusedLoad`), sem reiniciar o app.
- Nenhuma decisão aberta: `sistema@1` foi aprovado por Diego em 2026-10-24 e inclui SIS-04 e SIS-05.

## Contexto técnico

- Fontes:
  - esquema em [001_initial_schema.ts](../../../src/database/migrations/001_initial_schema.ts) e [002_measurement_key_ignores_case.ts](../../../src/database/migrations/002_measurement_key_ignores_case.ts);
  - versão em [migrate.ts](../../../src/database/migrate.ts) (`PRAGMA user_version`);
  - transação na porta [Database.ts](../../../src/database/Database.ts);
  - banco nativo em [openAppDatabase.ts](../../../src/database/openAppDatabase.ts);
  - tela atual em [SettingsScreen.tsx](../../../src/backup/screens/SettingsScreen.tsx);
  - `todayLocal` em `src/calendar`; `Button` e `EmptyState` em `src/ui`.
- Pontos vitais (AGENTS.md): backup e importação sem perda nem corrupção, e integridade das relações. [schema.test.ts](../../../__tests__/database/schema.test.ts) já cobre CHECKs, `RESTRICT` e órfãos no esquema. Os testes de repositório já cobrem cada CRUD. Não repetir.
- `createNodeSqliteDatabase` em [__tests__/support](../../../__tests__/support/nodeSqliteDatabase.ts) oferece transação e permite testar exportação e importação em Node.
- Cada executor carrega a skill `clean-code` (incluindo `references/architecture.md`), confirma as fontes atuais e usa Graphify somente se necessário.

## Tasks

### Task 01 — Exportar e importar todos os dados com validação
**Regras:** SIS-04, SIS-05
**Modo:** TDD
**Responsável:** a atribuir
**Arquivos:** `src/backup/domain/`, `src/backup/data/`, `src/backup/index.ts`, `__tests__/backup/`
**Depende de:** master/0008 integrada
**Verificação:**
- Riscos vitais:
  - tabela ou coluna esquecida no backup, o que perde dados;
  - cliente excluído fora do backup;
  - importação parcial que mistura dados antigos e novos;
  - arquivo corrompido apagando os dados atuais;
  - valores em centavos virando texto ou ponto flutuante.
- Proteção existente: as constraints do esquema e a transação da porta `Database`.
- Lacuna a cobrir com poucos testes:
  - **Ida e volta.** Um banco com todas as tabelas preenchidas, incluindo cliente excluído, venda de produto já excluído (`product_id` nulo) e despesa, é exportado. Ao importar num banco com outros dados, as linhas de todas as tabelas ficam idênticas às da origem, com ids e `deleted_at`, e nenhum registro anterior sobra.
  - **Recusa sem alterar nada.** São recusados e deixam o banco igual: texto que não é JSON, marcador errado, tabela ausente, versão de esquema mais nova, e linha inválida (pagamento órfão ou categoria fora das três).
  - **Totais.** O saldo de um cliente e os totais do mês calculados depois da importação são iguais aos de antes da exportação.
**Instrução para o executor:**
> Spec master/0009, Task 01. Contrato `sistema@1`, regras SIS-04 e SIS-05 (dados).
>
> Fazer:
> - No domínio de `src/backup`, definir o formato do backup (marcador, versão do esquema, data, linhas por tabela) e o parse com validação, com resultados explícitos: `invalid-file` e `newer-version`.
> - Em `data`, criar `exportBackup(db)`, que lê todas as tabelas e `PRAGMA user_version`, e `importBackup(db, text)`, que substitui tudo numa única transação, preservando ids e timestamps.
> - Listar as tabelas num único lugar, na ordem das relações, para que esquecer uma quebre o teste de ida e volta.
>
> Restrições:
> - Sem migração nova e sem rede.
> - `backup` não importa outras funcionalidades. Pode usar os repositórios delas só nos testes, para conferir totais.
> - Reutilizar `createNodeSqliteDatabase` e não repetir o que `schema.test.ts` já cobre.
>
> Entrega: reportar as fontes e o resultado de `npm test`. Não escrever estado compartilhado, índices nem grafo.

### Task 02 — Aba Ajustes com salvar e importar arquivo no Android
**Regras:** SIS-04, SIS-05
**Modo:** direto
**Responsável:** a atribuir
**Arquivos:**
- `src/backup/screens/`, incluindo `SettingsScreen`;
- adaptador de arquivo em `src/backup/` (por exemplo `files/`);
- módulo nativo em `android/app/src/main/java/com/spadacostura/` e `MainApplication.kt`;
- `src/app/` somente se a tela precisar do banco por contexto (por exemplo, `useDatabase` exposto ao `backup` pela composição).
**Depende de:** Task 01
**Verificação:**
- As regras de dados ficam protegidas pela Task 01.
- Rodar `npx tsc --noEmit`, `npm run lint`, `npm test` e o build release.
- Inspeção no emulador (APK release, modo avião), conforme a demonstração:
  - o arquivo é salvo em Downloads e tem todas as tabelas;
  - o aviso aparece antes de importar, e cancelar não altera nada;
  - depois de importar, os registros novos somem e o caixa e os saldos conferem;
  - arquivo corrompido e arquivo que não é backup são recusados com mensagem, sem mudar os dados;
  - os dados continuam depois de reiniciar o app.
**Instrução para o executor:**
> Spec master/0009, Task 02. Substituir o estado vazio da aba Ajustes por "Gerar backup" e "Importar backup".
>
> Fazer:
> - Criar o módulo nativo Kotlin com o Storage Access Framework, com duas funções: salvar texto num documento criado pela costureira e ler o texto de um documento escolhido. O nome sugerido é `spa-da-costura-AAAA-MM-DD.json`. Cancelar o seletor não é erro.
> - Ao gerar: mostrar "Backup salvo" ou uma mensagem de falha.
> - Ao importar:
>   1. ler o arquivo;
>   2. mostrar o alerta "Importar backup", avisando que todos os dados atuais serão substituídos, com Cancelar e Importar;
>   3. com a confirmação, chamar `importBackup` e informar o sucesso ou o motivo da recusa: "Arquivo inválido ou corrompido. Os dados atuais foram mantidos." ou "Este backup é de uma versão mais nova do app.".
>
> Restrições:
> - O banco chega à tela pela composição em `src/app`, sem importar `openAppDatabase` em `backup`.
> - Telas humildes; regras no domínio e nos dados.
>
> Entrega: reportar a inspeção e os checks.

## Validação e integração

- **Aceite:** os critérios de SIS-04 e SIS-05 observados nos testes da Task 01 e na demonstração no emulador (APK release, modo avião).
- **Gates:**
  - `npx tsc --noEmit`, `npm run lint`, `npm test` e o build release;
  - `validate-lifecycle.py --ready sistema/SIS-04` e `sistema/SIS-05`;
  - `--complete master/0009`.
- **Estado:** SIS-04 e SIS-05 entram em `.centaur/state/sistema.json`. Se `src/app` mudar, reemitir as evidências afetadas.
- **Integração:** commit no `main` local; push sob autorização de Diego.

## Diferença entre plano e resultado

—

## Checklist de conclusão
- [ ] Task 01 — Exportar e importar todos os dados com validação
- [ ] Task 02 — Aba Ajustes com salvar e importar arquivo no Android

## Execução
$run master/0009

## Estado
O ciclo normativo define o estado. Checkboxes não concluem a spec: exigir aceite, prova corrente e integração. Publicação não faz parte do aceite.
