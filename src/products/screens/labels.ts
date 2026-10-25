import type { ProductError, ProductSaleError } from '../domain';

export const productErrorMessages: Record<ProductError, string> = {
  'name-required': 'Informe o nome do produto.',
  'price-invalid': 'Informe um preço válido, como 350,00.',
  'not-found': 'Este produto não existe mais.',
};

export const saleErrorMessages: Record<ProductSaleError, string> = {
  'product-required': 'Escolha um produto do catálogo.',
  'amount-invalid': 'Informe um valor válido, como 350,00.',
  'date-invalid': 'Escolha a data da venda.',
  'not-found': 'Esta venda não existe mais.',
};
