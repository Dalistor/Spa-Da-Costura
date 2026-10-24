# [0002] Clientes: cadastro, edição, busca e medidas (master/0002)

**Data:** 2026-10-24
**Status:** Concluído
**Modo:** TDD (Task 01) e direto (Tasks 02 e 03)
**Spec:** `.centaur/specs/0002/` — Tasks 01 a 03 (agente único, sequencial; um registro para a spec inteira)

## Solicitação
"Pode rodar as duas" — execução de master/0002 e master/0003, planejadas a partir de "Planeje a entrega do cliente no aplicativo".

## Contexto
Primeira funcionalidade sobre a fundação (master/0001): a aba Clientes deixa de ser um estado vazio e as rotas `CustomerDetail`, `CustomerForm` e `MeasurementForm` ganham telas reais.

## O que foi feito
- Task 01: `src/customers/domain` — tipos `Customer`/`Measurement`, `validateCustomer` (nome obrigatório; opcionais em branco viram `null`), `validateMeasurement` (chave obrigatória, `trim`), `searchByName` (parte do nome, sem diferenciar maiúsculas) e `compareByName` (`Intl.Collator` pt-BR); interfaces `CustomerRepository` e `MeasurementRepository`. `src/customers/data` — implementações SQL sobre a porta `Database`, sempre filtrando `deleted_at IS NULL`; chave repetida é conferida antes de gravar e devolvida como `key-taken`.
- Task 02: `src/ui` ganhou `Button` e `TextField`; telas `CustomersScreen` (lista + busca + "Novo cliente"), `CustomerFormScreen` (criar/editar) e `CustomerDetailScreen`; `src/app/RepositoriesProvider` monta os repositórios sobre o banco e os entrega por `CustomerRepositoriesProvider` (contexto declarado em `customers`).
- Task 03: `MeasurementFormScreen` (criar/editar); no detalhe, tocar edita e tocar-e-segurar remove a medida após confirmação.

## Arquivos modificados
- `src/app/App.tsx` — envolve o `Navigator` com `RepositoriesProvider`.
- `src/app/navigation/Navigator.tsx` — três rotas do cliente saem do `PendingScreen`.
- `src/app/DatabaseContext.tsx` — comentário aponta o consumidor real.
- `src/customers/index.ts`, `src/customers/screens/CustomersScreen.tsx`, `src/ui/index.ts`.

## Arquivos criados
- `src/customers/domain/` (`customer.ts`, `measurement.ts`, `repositories.ts`, `index.ts`).
- `src/customers/data/` (`sqlCustomerRepository.ts`, `sqlMeasurementRepository.ts`, `timestamps.ts`, `index.ts`).
- `src/customers/screens/` (`CustomerFormScreen.tsx`, `CustomerDetailScreen.tsx`, `MeasurementFormScreen.tsx`, `CustomerRepositories.tsx`, `messages.ts`, `useFocusedLoad.ts`).
- `src/app/RepositoriesProvider.tsx`, `src/ui/Button.tsx`, `src/ui/TextField.tsx`.
- `__tests__/customers/customerRepository.test.ts` — 10 casos.

## Decisões técnicas
- Busca filtra em memória pela função de domínio (`searchByName`) sobre a lista de ativos: cobre maiúsculas acentuadas, o que o `LIKE` do SQLite não faz; volume de um ateliê não justifica busca no banco.
- Chave repetida verificada com `SELECT` antes do `INSERT/UPDATE`, em vez de interpretar a mensagem de erro de cada driver; o `UNIQUE` continua como proteção no banco.
- Telas tipam a rota por `ReactNavigation.RootParamList` (declaração global) em vez de importar `src/app`, evitando ciclo `customers → app`.
- `useFocusedLoad` recarrega lista e detalhe ao voltar dos formulários; remoção no próprio detalhe força recarga por contador.
- Carimbo `updated_at` com o mesmo formato da migração, numa constante local de `customers/data` (a migração 001 não foi tocada).

## Como validar
`npm test`, `npm run lint`, `npx tsc --noEmit`. No aparelho: build release, modo avião, cadastrar cliente e medida, fechar e reabrir.

## Contrato e realização
- `clientes@1`: CLI-01 (ev-1d7c2d48…, manual), CLI-02 (ev-bb51e053…, manual), CLI-03 (ev-41f0cff5…, manual) — implementadas, evidência corrente. Estado em `.centaur/state/clientes.json`.
- `sistema@1`: SIS-02 implementada com evidência manual ev-f3ead6bf12f0405e8624d112818531ab.
- Impacto previsto × real: conforme a spec; sem migração nova, sem mudança em `android/`.

## Resultado da validação
- `npm test`: 4 suítes, 63 testes passando (10 novos). `npm run lint` e `npx tsc --noEmit` sem erros.
- `assembleRelease -PreactNativeArchitectures=x86_64` ok; APK instalado no emulador Pixel_API_36 com dados limpos e modo avião: nome vazio recusado com mensagem; "Maria Souza" (com telefone) e "Ana Lima" (só nome) criadas; descrição editada; "Cintura 72 cm" adicionada, repetição recusada, editada para 74 cm; "Quadril" removida após confirmação; busca "mar" mostrou só Maria; após `am force-stop` e reabertura, lista e detalhe mantidos. Capturas 06–09 em `.centaur/evidence/screens/`.
- `validate-lifecycle.py --ready` ok para CLI-01, CLI-02, CLI-03 e SIS-02.
