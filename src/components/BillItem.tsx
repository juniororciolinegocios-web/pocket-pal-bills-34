import { Check, Trash2 } from 'lucide-react';
import { Bill, CATEGORY_LABELS } from '@/types/bill';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

interface BillItemProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BillItem({ bill, onTogglePaid, onDelete }: BillItemProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className={cn(
      "glass-card rounded-lg p-4 flex items-center gap-4 animate-fade-in transition-all duration-200 hover:shadow-md group",
      bill.isPaid && "opacity-70"
    )}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary text-foreground font-semibold text-sm">
        {bill.day}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-foreground truncate",
          bill.isPaid && "line-through text-muted-foreground"
        )}>
          {bill.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {CATEGORY_LABELS[bill.category]}
        </p>
      </div>
      
      <div className={cn(
        "text-right font-semibold tabular-nums",
        bill.isPaid ? "text-success" : "text-foreground"
      )}>
        {formatCurrency(bill.amount)}
      </div>
      
      <div className="flex items-center gap-2">
        <Checkbox
          checked={bill.isPaid}
          onCheckedChange={() => onTogglePaid(bill.id)}
          className="data-[state=checked]:bg-success data-[state=checked]:border-success"
        />
        
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(bill.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
