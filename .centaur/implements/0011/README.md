# [0011] Atalhos no Início, nomenclatura, fundo com fios e listas longas com busca

**Data:** 2026-10-25
**Status:** Concluído
**Modo:** direto (TDD para busca e paginação)

## Solicitação
- "Na tela inicial, tire os dados financeiros (o card de cima). Na tela inicial deve aparecer os botões dos dashboard do sistema."
- "Melhora a nomenclatura no app (ex: Devido -> Devendo)."
- "Desenho/fios no fundo do app" e "garanta que, mesmo com muitos dados, o layout não dê overflow".
- "Na descrição, coloque ela em um card abaixo."
- "Em pagamentos e possivelmente em outras listas, carrega muita informação: paginação e pesquisar por valor ou data", depois "aplicar para estes 3 também" (Clientes, Catálogo e despesas do Caixa).

## O que foi feito
- **Início (`d42a6b4`):** saiu o cartão de saldo e entraram botões para Clientes, Serviços, Caixa, Catálogo e Ajustes (`SystemShortcuts`). A engrenagem do cabeçalho saiu.
- **Nomenclatura (`d42a6b4`):**
  - Devendo, Já pagou e Saldo a favor;
  - ações no padrão "Novo/Nova…";
  - A fazer e Situação;
  - Nome da medida e Tamanho;
  - Salvar e Restaurar backup.
- **Fundo:** fios e pespontos desenhados (`ThreadBackground`) atrás de todas as telas, aplicado pelo `screenLayout` dos navegadores. Telas vazias com a ilustração do carretel (`Artwork`).
- **Overflow:**
  - Valores, etiquetas e ações nunca são espremidos.
  - Títulos e descrições longos em listas têm limite de linhas.
  - Valores grandes reduzem a fonte para caber.
  - Na ficha, telefone e observações ficam num cartão próprio e aparecem inteiros.
- **Busca e paginação:**
  - novo módulo `src/search`;
  - `searchFilter` em `src/database`;
  - `search*` paginados nos repositórios de pagamentos, serviços, vendas e despesas;
  - `PagedList` e `usePagedSearch` em `src/ui`;
  - telas `CustomerJobs`, `CustomerSales`, `CustomerPayments` e `MonthExpenses`.
- **Clientes e Catálogo:** busca por nome ou telefone (`searchCustomers`, que substitui `searchByName`) e por nome ou preço (`searchProducts`), paginadas na tela.
- **A receber:** a soma usa `sumCents`.

## Resultado da validação
- `npm test`: 144 testes. São 24 novos, para interpretação da busca, filtros por valor, data e mês, paginação, cliente excluído e páginas em memória. `tsc` e `lint` sem erros.
- **Emulador, com dados pesados** (41 clientes, 30 serviços, 25 pagamentos, 25 despesas, textos e valores enormes), conferido nas capturas:
  - sem overflow;
  - "Ver todos" na ficha e no Caixa;
  - carregamento ao rolar até o último item;
  - buscas por data, valor, telefone, nome e texto.
- APK release gerado.

## Pendências
- A busca por texto no banco (`LIKE`) não diferencia maiúsculas só em letras sem acento. "Érica" e "érica" são tratadas como textos diferentes nas listas paginadas no banco. Clientes e Catálogo não têm esse problema.
- O Catálogo ordena "Peça 10" antes de "Peça 2" (ordem de texto).
