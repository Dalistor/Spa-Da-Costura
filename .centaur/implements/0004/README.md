# [0004] Chave de medida sem diferenciar maiúsculas (master/0004, clientes@2)

**Data:** 2026-10-24
**Status:** Concluído
**Modo:** TDD (Task 01) e direto (Task 02)
**Spec:** `.centaur/specs/0004/` — Tasks 01 e 02 (agente único)

## Solicitação
"1 não, deve constar como mesmo" — "Cintura" e "cintura" são a mesma medida. Na mesma mensagem: "2 - pode adicionar" (SRV-05 no rascunho `servicos`) e "3 Sim" (push).

## O que foi feito
- Contrato `clientes@2`: aceite de CLI-02 e invariante da Medida passam a dizer "sem diferenciar maiúsculas e minúsculas"; demais regras iguais.
- `isSameKey` no domínio (`toLocaleLowerCase('pt-BR')` após `trim`, cobre acentos); o repositório de medidas usa essa regra antes de gravar.
- Migração 002: renomeia repetições antigas que só diferem em maiúsculas (sufixo " (id)", nada apagado) e cria índice único `(customer_id, key COLLATE NOCASE)`.
- Rascunho `servicos@1`: nova regra SRV-05.

## Arquivos
- Criados: `src/database/migrations/002_measurement_key_ignores_case.ts`, `.centaur/contracts/clientes/v002.json`.
- Modificados: `src/database/migrations/index.ts`, `src/customers/domain/{measurement,index}.ts`, `src/customers/data/sqlMeasurementRepository.ts`, `__tests__/customers/customerRepository.test.ts`, `__tests__/database/schema.test.ts`, `.centaur/contracts/servicos/v001.json`, documentação.

## Decisões técnicas
- `COLLATE NOCASE` do SQLite só ignora maiúsculas ASCII; a comparação completa fica no domínio e o índice protege o banco.
- Repetições antigas renomeadas em vez de apagadas (SIS-06: sem perda de dados).

## Contrato e realização
- `clientes@2` CLI-01..04: evidências reemitidas (teste + manual) contra o novo hash; `sistema` SIS-01, SIS-02 e SIS-06 reverificados.

## Resultado da validação
- `npm test`: 64 testes; lint e tsc sem erros.
- Emulador: APK com a migração instalado sobre o banco v1 com dados; nada perdido; "busto" recusada onde existe "Busto"; criação, edição, busca, exclusão e reabertura conferidas. O emulador ficou sem memória no meio e perdia teclas digitadas via adb; foi reiniciado e a demonstração repetida. Uma medida de teste criada por esse erro ("bust"/"bustobusto") foi removida pelo app.
- `validate-lifecycle.py --ready` ok para CLI-01..04 e SIS-01, SIS-02, SIS-03, SIS-06.
