export type BillCategory = 
  | 'CARTAO'
  | 'ALUGUEL'
  | 'CASA'
  | 'INVESTIMENTO'
  | 'CONVENIO'
  | 'ESCOLA'
  | 'OUTROS';

export interface Bill {
  id: string;
  day: number;
  name: string;
  amount: number;
  category: BillCategory;
  isPaid: boolean;
}

export interface CategorySummary {
  category: BillCategory;
  total: number;
  color: string;
}

export const CATEGORY_LABELS: Record<BillCategory, string> = {
  CARTAO: 'Cartão',
  ALUGUEL: 'Aluguel',
  CASA: 'Casa',
  INVESTIMENTO: 'Investimento',
  CONVENIO: 'Convênio',
  ESCOLA: 'Escola',
  OUTROS: 'Outros',
};

export const CATEGORY_COLORS: Record<BillCategory, string> = {
  CARTAO: 'hsl(var(--chart-1))',
  ALUGUEL: 'hsl(var(--chart-2))',
  CASA: 'hsl(var(--chart-3))',
  INVESTIMENTO: 'hsl(var(--chart-4))',
  CONVENIO: 'hsl(var(--chart-5))',
  ESCOLA: 'hsl(var(--chart-6))',
  OUTROS: 'hsl(var(--chart-7))',
};
