# Spa da Costura

## Visão Geral
App Android em React Native CLI para gerenciar um ateliê de costura: clientes e medidas livres, serviços (consertos), produtos (peças) vendidos a clientes, pagamentos, despesas e saldo por cliente. Sem servidor: dados locais em SQLite, com backup/importação por arquivo (importar substitui tudo). Fundação (banco SQLite migrado, tema, navegação), clientes com medidas (cadastro, busca, soft delete), serviços (consertos com status) e produtos (catálogo e venda ao cliente) implementados; financeiro e backup ainda não. Camadas, esquema e rotas em [arquitetura.md](.centaur/system/arquitetura.md). Detalhes e lacunas em [.centaur/system/visao-geral.md](.centaur/system/visao-geral.md).

## Recuperação de contexto
Priorize busca e símbolos do editor. Graphify é opcional para relações amplas; consulte `.centaur/graphify/graph.json` pelo adaptador da skill apenas quando útil. Confirme fontes atuais. Não indexe automaticamente após mudanças. Decisões e documentação gerada ficam em `.centaur/`; código e testes comprovam comportamento.

## Memória de decisões e mudanças
Backend `files` (em `.centaur/workspace.json`): registros em `.centaur/implements/`, índice em [status.md](.centaur/implements/status.md). Memória histórica não substitui código, testes, regras ou o estado das specs.

## Contratos e realização
Contratos em `.centaur/contracts/<id>/vNNN.json` definem o comportamento desejado e a autonomia. Estado em `.centaur/state/` e evidências em `.centaur/evidence/` registram a realização; o ciclo normativo de `graphify` define formatos e gates. Contratos aprovados são versionados, não reescritos. Antes de editar, consultar apenas as regras e limites pertinentes. Checklist de spec não comprova comportamento. Consulte specs, fontes e evidências diretamente no terminal. Apresente resultado, validação e próxima ação com links; detalhes ficam nos registros.

Contratos atuais: [sistema](.centaur/contracts/sistema/v001.json), [clientes@2](.centaur/contracts/clientes/v002.json) e [servicos](.centaur/contracts/servicos/v001.json) e [financeiro](.centaur/contracts/financeiro/v001.json) (aprovados).

## Comandos essenciais
Na raiz, com Node >= 22.11 e npm:
- `npm install` — instalar dependências
- `npm start` — Metro bundler
- `npm run android` — compilar e abrir no emulador/aparelho (requer JDK e Android SDK)
- `npm test` — Jest
- `npm run lint` — ESLint
- `npx tsc --noEmit` — checagem de tipos

## Arquitetura de Camadas
- App React Native CLI (sem Expo), somente Android, sem servidor; dados persistidos localmente em SQLite.
- Proibido: chamadas de rede para ler ou gravar dados do ateliê, contas/login ou backend remoto, salvo nova versão do contrato `sistema`.
- Regras de domínio independentes da UI e do armazenamento; SQL só em `src/database` e nos `data/` das funcionalidades; esquema muda só por nova migração em `src/database/migrations` (nunca editar uma já publicada). Detalhes em [arquitetura.md](.centaur/system/arquitetura.md).

## Testes
Jest (preset `@react-native/jest-preset`), testes em `__tests__/`. Pontos vitais: persistência local dos dados (sem perda após reinício), backup/importação sem perda nem corrupção, cálculos financeiros (total pago/devido, fluxo de caixa) e integridade das relações cliente → medidas/serviços/pagamentos. Reutilize testes existentes; teste novo só para falha concreta em ponto vital sem proteção suficiente. Para mudanças de UI de baixo impacto, use verificação proporcional.

## Vocabulário e Idioma do Código
Domínio e textos da interface em português; identificadores de código em inglês (glossário em [arquitetura.md](.centaur/system/arquitetura.md#idioma)). Termos do domínio (Cliente, Medida, Serviço, Produto, Venda de produto, Pagamento, Despesa, Total devido) em [visao-geral.md](.centaur/system/visao-geral.md#vocabulário); consulte antes de nomear código.

## Regras e Restrições
- Paleta visual em tons de bege e marrom, por tokens centralizados (valores exatos a critério do agente).
- Cliente é excluído por soft delete; seus pagamentos continuam no fluxo de caixa.
- Valores monetários sem perda de precisão (não usar ponto flutuante para somar dinheiro).
Carregue `clean-code` e as referências pertinentes ao planejar, implementar ou revisar código. Preserve o modo TDD/direto e validação proporcional definidos pelo Centaur. As instruções do usuário e deste projeto prevalecem. Consulte `.clean/` se existir, sem escrevê-lo nestes fluxos.

## Módulos e Equipe
Modo individual: o desenvolvedor acumula responsabilidade e integração. Escopo único `master`.
Consulte `.centaur/workspace.json` para escopos, caminhos e responsáveis. Specs ficam nos diretórios configurados; implementações seguem o backend de memória, preservando os diretórios legados; leia seus índices sob demanda e confirme status nos READMEs canônicos. Use IDs qualificados para specs. Várias specs independentes podem coexistir no mesmo escopo; antes de editar, reserve a spec e registre a posse dos arquivos conforme o contrato de equipe da skill. Consolide índices e estado compartilhado serialmente.

---
_Documentação centaur — schema `5.2.0`, gerada em `2026-10-23`. Atualize com `/update`._
