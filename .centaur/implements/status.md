# Status das Implementações

Histórico de todas as implementações realizadas neste projeto.

| # | Título | Data | Status | Arquivos Afetados |
|---|--------|------|--------|-------------------|
| [0001](0001/README.md) | Fundação: banco local migrado, tema e rotas (master/0001) | 2026-10-24 | Concluído | package.json, jest.config.js, App.tsx, src/{app,database,money,theme,ui,customers,jobs,products,finance,backup}, __tests__ |
| [0002](0002/README.md) | Clientes: cadastro, edição, busca e medidas (master/0002) | 2026-10-24 | Concluído | src/{customers,ui,app}, __tests__/customers |
| [0003](0003/README.md) | Excluir cliente por soft delete (master/0003) | 2026-10-24 | Concluído | src/customers/{domain,data,screens}, __tests__/customers |
| [0004](0004/README.md) | Chave de medida sem diferenciar maiúsculas (master/0004, clientes@2) | 2026-10-24 | Concluído | src/database/migrations, src/customers, __tests__ |
| [0005](0005/README.md) | Serviços: registrar, editar, status e aba (master/0005) | 2026-10-24 | Concluído | src/{calendar,jobs,ui,database,app,customers}, __tests__/jobs, package.json |
| [0006](0006/README.md) | Produtos: catálogo e venda ao cliente (master/0006) | 2026-10-24 | Concluído | src/{products,ui,app,customers,jobs}, __tests__/products |
| [0007](0007/README.md) | Pagamentos e saldo do cliente (master/0007) | 2026-10-25 | Concluído | src/{finance,app,customers}, __tests__/finance |
| [0008](0008/README.md) | Despesas e caixa por mês (master/0008) | 2026-10-25 | Concluído | src/{finance,calendar,app}, __tests__/finance |

---

_Atualizado automaticamente pelas skills `/tdd` e `/implement`_
