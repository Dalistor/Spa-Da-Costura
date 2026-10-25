# 0004 Chave de medida sem diferenciar maiúsculas e minúsculas

**Data:** 2026-10-24
**Status:** Concluída
**Escopo:** master
**Responsável:** Claude Code (sessão f61330bd, agente único)
**Contrato:** clientes@2
**Regras:** CLI-01, CLI-02, CLI-03, CLI-04
**Spec mestre:** —
**Specs filhas:** —
**Dependências:** master/0002, master/0003
**Solicitação original:** "1 não, deve constar como mesmo" (resposta à decisão aberta de master/0002: "Cintura" e "cintura" são a mesma medida)

## Objetivo e demonstração

Antes: "Cintura" e "cintura" eram aceitas como medidas diferentes no mesmo cliente.
Depois: a segunda é recusada com "Este cliente já tem uma medida com esse nome.", inclusive com acentos ("Ômbro" × "ômbro"); o banco também passa a recusar a repetição. Bancos já existentes são migrados sem perder medidas: repetições antigas que só diferem em maiúsculas são renomeadas com o ID entre parênteses.

Demonstração: instalar o build novo sobre os dados da demonstração anterior (migração 002 aplicada sem perda) e tentar "busto" em cliente com "Busto".

## Impacto previsto

- Contrato: `clientes@2` muda só o aceite de CLI-02 (e o invariante da medida). CLI-01, CLI-03 e CLI-04 não mudam, mas o novo hash do contrato exige reemitir suas evidências.
- `src/customers/data/sqlMeasurementRepository.ts`: conferência de chave repetida sem diferenciar maiúsculas (inclusive acentuadas).
- `src/database/migrations/002_*`: renomeia repetições antigas e cria índice único `(customer_id, key COLLATE NOCASE)`. Migração 001 intocada.
- Testes: ampliar `__tests__/customers/customerRepository.test.ts` (chave repetida) e `__tests__/database/schema.test.ts` (migração 002).

## Autonomia e decisões

- Decisão de Diego (2026-10-24): chaves iguais sem diferenciar maiúsculas/minúsculas → `clientes@2`.
- Escolha técnica: repetições antigas não são apagadas (SIS-06 proíbe perda); recebem sufixo " (ID)" para a usuária revisar.
- `COLLATE NOCASE` do SQLite só ignora maiúsculas ASCII; a comparação completa (com acentos) fica no repositório e o índice é a rede de segurança.

## Contexto técnico

Fontes: [sqlMeasurementRepository.ts](../../../src/customers/data/sqlMeasurementRepository.ts), [migrations](../../../src/database/migrations/index.ts), [schema.test.ts](../../../__tests__/database/schema.test.ts), [customerRepository.test.ts](../../../__tests__/customers/customerRepository.test.ts). Executor carrega `clean-code`; Graphify não necessário.

## Tasks

### Task 01 — Chave única sem diferenciar maiúsculas e migração 002
**Regras:** CLI-02
**Modo:** TDD
**Responsável:** Claude Code (sessão f61330bd, agente único)
**Arquivos:** `src/customers/data/sqlMeasurementRepository.ts`, `src/database/migrations/`, `__tests__/customers/customerRepository.test.ts`, `__tests__/database/schema.test.ts`
**Depende de:** —
**Verificação:** risco vital: migração perder medidas ou falhar com repetições antigas (SIS-06); repetição por maiúsculas gravada. Ampliar os testes existentes: "cintura" recusada com "Cintura" (adição e edição, com acento); migração 002 renomeia repetições sem perder linhas e o banco passa a recusar a repetição.
**Instrução para o executor:**
> Spec master/0004 — Task 01: contrato `clientes@2`, CLI-02. Comparar chaves com `toLocaleLowerCase('pt-BR')` no repositório e criar a migração 002 descrita acima, sem editar a 001. Reportar fontes e testes.

### Task 02 — Reverificar o contrato `clientes@2`
**Regras:** CLI-01, CLI-02, CLI-03, CLI-04
**Modo:** direto
**Responsável:** Claude Code (sessão f61330bd, agente único)
**Arquivos:** nenhum código; evidências e estado
**Depende de:** Task 01
**Verificação:** testes de repositório + demonstração no emulador (migração sobre dados existentes, "busto" recusada, exclusão e busca), novas evidências para as quatro regras.
**Instrução para o executor:**
> Spec master/0004 — Task 02: reexecutar as provas de CLI-01..04 contra `clientes@2` e demonstrar no APK release em modo avião.

## Validação e integração

- Gates: `npx tsc --noEmit`, `npm run lint`, `npm test`; `--ready` de CLI-01..04 e SIS-06; `--complete master/0004`.
- Integração: commit no `main` local e push para `origin` (autorizado por Diego: "3 Sim").

## Diferença entre plano e resultado

Execução em 2026-10-24, registro [implements/0004](../../implements/0004/README.md).
- A igualdade de chave virou regra de domínio (`isSameKey`), usada pelo repositório.
- Emulador ficou sem memória durante a demonstração (perda de teclas via adb); reiniciado e demonstração repetida. Medidas de teste criadas pelo erro foram removidas pelo próprio app.
- Também reverificados SIS-01, SIS-02 e SIS-06 (fontes afetadas pela migração).
- Integrada e enviada a `origin/main` (f637043, push autorizado por Diego); `validate-lifecycle.py --complete master/0004` ok.

## Checklist de conclusão
- [x] Task 01 — Chave única sem diferenciar maiúsculas e migração 002
- [x] Task 02 — Reverificar o contrato `clientes@2`

## Execução
$run master/0004

## Estado
O ciclo normativo define o estado. Checkboxes não concluem a spec: exigir aceite, prova corrente e integração.
