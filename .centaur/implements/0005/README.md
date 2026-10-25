# [0005] Serviços: registrar, editar, status e aba (master/0005)

**Data:** 2026-10-24
**Status:** Concluído
**Modo:** TDD (Task 01) e direto (Tasks 02 e 03)
**Spec:** `.centaur/specs/0005/` — Tasks 01 a 03 (agente único)

## Solicitação
"Vamos cadastrar serviços primeiro" e "Também aprovo o contrato de serviços" (`servicos@1`).

## O que foi feito
- `src/calendar`: data de negócio local (`todayLocal`, `toBusinessDate`, `fromBusinessDate`, `isBusinessDate`, `formatBusinessDate`), sem passar por UTC.
- `src/jobs/domain`: `Job`, `JobStatus`, `validateJob` (descrição obrigatória, valor por `parseCents` ≥ 0, data `YYYY-MM-DD`) e `JobRepository`.
- `src/jobs/data`: SQL sobre a porta `Database`; `listAll` faz `JOIN` com clientes ativos (SRV-05) e ordena por entrega.
- `src/jobs/screens`: `JobFormScreen` (criar pelo cliente, editar, status e excluir com confirmação), `CustomerJobsSection` (no detalhe do cliente), `JobsScreen` (aba com status rápido), `DateField` (calendário nativo do Android), `StatusSelector`, `JobSummary`.
- `src/ui/useFocusedLoad` (movido de `customers`) agora devolve `[data, reload]`; telas que recarregavam com contador de revisão passaram a usar `reload`.
- `src/database/sqlNow.ts`: expressão do carimbo `updated_at` compartilhada (antes duplicada em `customers/data/timestamps.ts`, removido).
- Dependência: `@react-native-community/datetimepicker` 9.2.1 (versão exata; 9.2.2 tinha 3 dias).

## Decisões técnicas
- Excluir serviço fica no formulário de edição (acessível pela aba e pelo detalhe), não em gesto na lista.
- Status também pode ser trocado no formulário de edição, além da aba.
- Valor editado aparece como "R$ 25,00" no campo; `parseCents` aceita o prefixo.
- `customers/screens` usa `CustomerJobsSection` de `jobs/index.ts`; `jobs` não importa `customers` (sem ciclo).

## Resultado da validação
- `npm test`: 75 testes (11 novos em `__tests__/jobs`); lint e tsc sem erros. Build release com o módulo nativo ok.
- Emulador (APK release, modo avião): data padrão 24/10/2026 e alteração para 30/10 no calendário; descrição vazia e valor "abc" recusados com mensagem; serviço Pendente no detalhe e na aba; status Pronto/Entregue refletidos nos dois lugares; edição de valor; exclusão com confirmação; serviço de cliente excluído sumiu da aba; dados mantidos após fechar e reabrir. Fluxos de clientes repetidos no mesmo build (mudanças em telas compartilhadas). Capturas 17–21.
- No meio da demonstração o Gboard do emulador abriu um tutorial de caneta que capturava a digitação; foi fechado (não é comportamento do app).
- `validate-lifecycle.py --ready` ok para SRV-01 e todas as regras de clientes e sistema afetadas; SRV-02, 03 e 05 aguardavam só a integração de SRV-01.

## Pendências
- SRV-04 parcial (falta produtos vendidos, PRD-02); PRD-01/02 na próxima spec.
- Na aba, o selo de status repete a opção marcada no seletor (cosmético).
