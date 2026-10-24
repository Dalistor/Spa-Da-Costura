# 0003 Excluir cliente por soft delete com confirmação

**Data:** 2026-10-24
**Status:** Concluída
**Escopo:** master
**Responsável:** Diego
**Contrato:** clientes@1
**Regras:** CLI-04
**Spec mestre:** —
**Specs filhas:** —
**Dependências:** master/0002
**Solicitação original:** "Planeje a entrega do cliente no aplicativo"

## Objetivo e demonstração

Antes (após master/0002): não há como excluir um cliente.
Depois: no detalhe do cliente, "Excluir cliente" pede confirmação; ao confirmar, o cliente e suas medidas somem da lista, da busca e do detalhe, mas o registro continua no banco com `deleted_at` preenchido e seus pagamentos (e demais lançamentos) permanecem intactos.

Demonstração: excluir um cliente com medidas no emulador → confirmação aparece; cancelar mantém; confirmar remove da lista; teste em `node:sqlite` mostra a linha marcada e os pagamentos preservados.

## Impacto previsto

- `src/customers/domain` e `data`: operação de soft delete (`UPDATE ... SET deleted_at`), nunca `DELETE`; leituras já filtram excluídos desde master/0002.
- `src/customers/screens`: ação de excluir com confirmação no detalhe, voltando à lista.
- Dados: sem migração; `ON DELETE RESTRICT` da migração 001 continua como rede de segurança.
- Interferência: mesmos arquivos de `customers` que master/0002 → executar depois de 0002 integrada.

## Autonomia e decisões

- Autonomia de `clientes@1`: layout e texto da confirmação dentro da paleta.
- Limite de verificação desta entrega: os critérios "serviços e produtos vendidos não aparecem nas telas de histórico" e "pagamentos continuam contando no fluxo de caixa" dependem de telas ainda inexistentes. Aqui são verificados no nível dos dados (linhas preservadas; cliente oculto em todas as consultas de `customers`). A confirmação nas telas fica a cargo de `financeiro/FIN-04` (já exige pagamentos de excluídos no caixa) e de `servicos`.
- Lacuna observada em `servicos@1` (rascunho): nenhuma regra diz que a aba Serviços oculta serviços de clientes excluídos. Avaliar antes de aprovar esse contrato.

## Contexto técnico

- Fontes: repositório e telas criados em master/0002; esquema em [001_initial_schema.ts](../../../src/database/migrations/001_initial_schema.ts); teste existente "a customer with payments cannot be physically deleted" em [schema.test.ts](../../../__tests__/database/schema.test.ts).
- Cada executor carrega a skill `clean-code` (incluindo `references/architecture.md`), confirma as fontes atuais e usa Graphify somente se necessário.

## Tasks

### Task 01 — Soft delete no repositório
**Regras:** CLI-04
**Modo:** TDD
**Responsável:** Claude Code (sessão f61330bd, agente único)
**Arquivos:** `src/customers/domain/`, `src/customers/data/`, `__tests__/customers/` (ampliar o teste de repositório de master/0002)
**Depende de:** master/0002
**Verificação:** risco vital: operação irreversível e integridade financeira (apagar fisicamente o cliente ou seus lançamentos; cliente excluído reaparecendo em lista, busca ou detalhe). Proteção existente: RESTRICT impede `DELETE` com pagamentos, mas não prova o soft delete. Lacuna → ampliar o teste de repositório: excluir marca `deleted_at` e mantém a linha; cliente e medidas deixam de aparecer em lista, busca e leitura por ID; pagamento, serviço e venda do cliente continuam no banco.
**Instrução para o executor:**
> Spec master/0003 — Task 01: contrato `clientes@1`, regra CLI-04. Acrescentar ao repositório de clientes a exclusão lógica (preencher `deleted_at` com carimbo UTC), sem `DELETE` e sem tocar medidas, serviços, vendas ou pagamentos. Ampliar o teste existente de repositório em vez de criar outro arquivo. Reportar fontes e `npm test`; não escrever estado compartilhado, índices ou grafo.

### Task 02 — Confirmação de exclusão no detalhe
**Regras:** CLI-04
**Modo:** direto
**Responsável:** Claude Code (sessão f61330bd, agente único)
**Arquivos:** `src/customers/screens/` (detalhe do cliente)
**Depende de:** Task 01
**Verificação:** `npx tsc --noEmit`, `npm run lint`, `npm test`; inspeção no emulador: confirmação aparece, cancelar mantém o cliente, confirmar volta à lista sem ele e a busca não o encontra.
**Instrução para o executor:**
> Spec master/0003 — Task 02: no detalhe do cliente, ação "Excluir cliente" com diálogo de confirmação em português informando que o histórico financeiro é mantido; ao confirmar, chamar o repositório e voltar à lista. Reportar inspeção e checks.

## Validação e integração

- Aceite: critérios de CLI-04 observados no nível descrito em "Autonomia e decisões" (teste de repositório + inspeção no emulador), com a limitação registrada na evidência.
- Gates: `npx tsc --noEmit`, `npm run lint`, `npm test`; `validate-lifecycle.py --ready clientes/CLI-04` e `--complete master/0003`.
- Integração: commit no `main` local sob autorização de Diego; sem publicação.

## Diferença entre plano e resultado

Execução em 2026-10-24, registro [implements/0003](../../implements/0003/README.md).
- Medidas de clientes excluídos ficam ocultas no próprio repositório de medidas (JOIN com clientes ativos), não só no detalhe.
- O teste existente "deleted customers are hidden" foi substituído pelo caso de soft delete via repositório (sem novo arquivo).
- Mudanças em arquivos compartilhados com master/0002 desatualizaram as provas de CLI-01..03 e SIS-01..03: testes e checagens reexecutados e demonstração manual repetida no build novo.
- Banco do APK release não é legível por adb; preservação de linha e lançamentos provada no teste de repositório (limite registrado na evidência).
- Integrada em `main` local (388c7fe, sem push); `validate-lifecycle.py --complete master/0003` ok.

## Checklist de conclusão
- [x] Task 01 — Soft delete no repositório
- [x] Task 02 — Confirmação de exclusão no detalhe

## Execução
$run master/0003

## Estado
O ciclo normativo define o estado. Checkboxes não concluem a spec: exigir aceite, prova corrente e integração. Publicação não faz parte do aceite.
