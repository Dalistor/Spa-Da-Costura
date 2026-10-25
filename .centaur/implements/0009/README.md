# [0009] Backup em arquivo e importação que substitui tudo (master/0009)

**Data:** 2026-10-25
**Status:** Concluído
**Modo:** TDD (Task 01) e direto (Task 02)
**Spec:** `.centaur/specs/0009/`: Tasks 01 e 02, feitas por um agente único na sessão 3b466626

## Solicitação
"Pode executar a master/0009". Contrato `sistema@1`, regras SIS-04 e SIS-05.

## O que foi feito
- **`src/backup/domain`:** formato do backup, `BACKUP_TABLES` na ordem das relações e `parseBackup`, com os erros `invalid-file` e `newer-version`.
- **`src/backup/data`:**
  - `exportBackup` gera o JSON com todas as linhas e a versão do esquema.
  - `importBackup` apaga e reinsere tudo numa única transação, conferindo as colunas por `PRAGMA table_info`. Qualquer erro desfaz tudo.
  - `createBackupService` liga as duas ao banco.
- **`src/backup/screens`:** `SettingsScreen` com "Gerar backup" e "Importar backup", com aviso e confirmação; `BackupServiceProvider`.
- **Android:** `BackupFileModule.kt` e `BackupFilePackage.kt` usam o Storage Access Framework (`ACTION_CREATE_DOCUMENT` e `ACTION_OPEN_DOCUMENT`) e estão registrados no `MainApplication`. O adaptador JS fica em `src/backup/files/deviceFiles.ts`.
- **Composição:** `RepositoriesProvider` monta o serviço de backup.

## Resultado da validação
- **Testes:** `npm test` passou com 118 testes, 9 deles novos em `__tests__/backup/backup.test.ts`. `tsc`, `lint` e o build release sem erros.
- **Emulador (capturas 70–80):** o backup foi salvo em Downloads com as 7 tabelas, e os clientes excluídos estavam no arquivo. Cancelar no aviso não mudou nada; confirmar restaurou o caixa e os saldos. Arquivo truncado e arquivo qualquer foram recusados. Depois de reiniciar, um novo backup trouxe tabelas idênticas às do arquivo importado.
- **Regressão (capturas 81–89):** clientes, medidas, busca, exclusão, serviços, status, catálogo e venda. As evidências de CLI, SRV, PRD e SIS-01/02 foram reemitidas.

## Pendências
- Push não autorizado ainda.
- Converter backups de versões antigas do esquema fica para a próxima migração.
