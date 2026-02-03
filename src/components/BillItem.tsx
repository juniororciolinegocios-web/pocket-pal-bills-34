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
      "bg-secondary/50 rounded-lg p-3 flex items-center gap-3 transition-all duration-200 hover:bg-secondary group",
      bill.isPaid && "opacity-60"
    )}>
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background text-foreground font-medium text-xs">
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
