import { useMemo, useState } from 'react';
import { Bill, BillCategory, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/bill';
import { BillItem } from '@/components/BillItem';
import { Receipt, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

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

  const toggleCategory = (category: BillCategory) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: prev[category] === undefined ? false : !prev[category]
    }));
  };

  const isCategoryOpen = (category: BillCategory) => {
    return openCategories[category] !== false;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (bills.length === 0) {
    return (
      <div className="rounded-xl p-8 text-center bg-secondary/30">
        <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhuma conta cadastrada</p>
        <p className="text-sm text-muted-foreground mt-1">
          Clique em "Nova Conta" para começar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
      {CATEGORY_ORDER.map(category => {
        const categoryBills = groupedBills[category];
        if (categoryBills.length === 0) return null;

        const categoryTotal = categoryBills.reduce((sum, bill) => sum + bill.amount, 0);
        const categoryPaid = categoryBills.filter(b => b.isPaid).length;

        return (
          <Collapsible
            key={category}
            open={isCategoryOpen(category)}
            onOpenChange={() => toggleCategory(category)}
            className="animate-fade-in"
          >
            <CollapsibleTrigger className="flex items-center gap-3 w-full py-2 px-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
              <div className="flex items-center gap-3 flex-1">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: CATEGORY_COLORS[category] }}
                />
                <h3 className="font-medium text-sm text-foreground">
                  {CATEGORY_LABELS[category]}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {categoryPaid}/{categoryBills.length}
                </span>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {formatCurrency(categoryTotal)}
              </span>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isCategoryOpen(category) && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1.5 pt-2 pl-1">
              {categoryBills.map(bill => (
                <BillItem
                  key={bill.id}
                  bill={bill}
                  onTogglePaid={onTogglePaid}
                  onDelete={onDelete}
                />
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
