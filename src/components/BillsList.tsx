import { useMemo } from 'react';
import { Bill, BillCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/bill';
import { BillItem } from '@/components/BillItem';
import { Receipt } from 'lucide-react';

interface BillsListProps {
  bills: Bill[];
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

const CATEGORY_ORDER: BillCategory[] = [
  'CONVENIO',
  'CASA',
  'ALUGUEL',
  'CARTAO',
  'ESCOLA',
  'INVESTIMENTO',
  'OUTROS',
];

export function BillsList({ bills, onTogglePaid, onDelete }: BillsListProps) {
  const groupedBills = useMemo(() => {
    const groups: Record<BillCategory, Bill[]> = {
      CARTAO: [],
      ALUGUEL: [],
      CASA: [],
      INVESTIMENTO: [],
      CONVENIO: [],
      ESCOLA: [],
      OUTROS: [],
    };

    bills.forEach(bill => {
      groups[bill.category].push(bill);
    });

    // Sort bills within each category by day
    Object.keys(groups).forEach(key => {
      groups[key as BillCategory].sort((a, b) => a.day - b.day);
    });

    return groups;
  }, [bills]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (bills.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma conta cadastrada</p>
        <p className="text-sm text-muted-foreground mt-1">
          Clique em "Nova Conta" para começar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2">
      {CATEGORY_ORDER.map(category => {
        const categoryBills = groupedBills[category];
        if (categoryBills.length === 0) return null;

        const categoryTotal = categoryBills.reduce((sum, bill) => sum + bill.amount, 0);
        const categoryPaid = categoryBills.filter(b => b.isPaid).length;

        return (
          <div key={category} className="animate-fade-in">
            <div className="flex items-center gap-3 mb-3 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: CATEGORY_COLORS[category] }}
              />
              <h3 className="font-semibold text-foreground">
                {CATEGORY_LABELS[category]}
              </h3>
              <span className="text-sm text-muted-foreground">
                ({categoryPaid}/{categoryBills.length} pagas)
              </span>
              <span className="ml-auto text-sm font-medium text-foreground">
                {formatCurrency(categoryTotal)}
              </span>
            </div>
            <div className="space-y-2 pl-1">
              {categoryBills.map(bill => (
                <BillItem
                  key={bill.id}
                  bill={bill}
                  onTogglePaid={onTogglePaid}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
