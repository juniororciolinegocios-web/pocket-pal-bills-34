import { Check, Trash2 } from 'lucide-react';
import { Bill } from '@/types/bill';
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
      "bg-secondary/50 rounded-lg p-3 flex items-center gap-3 transition-all duration-200 hover:bg-secondary/80 group",
      bill.isPaid && "opacity-70"
    )}>
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-background text-foreground font-medium text-xs shadow-sm">
        {bill.day}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-sm text-foreground truncate",
          bill.isPaid && "line-through text-muted-foreground"
        )}>
          {bill.name}
        </p>
      </div>
      
      <div className={cn(
        "text-right font-semibold text-sm tabular-nums",
        bill.isPaid ? "text-success" : "text-foreground"
      )}>
        {formatCurrency(bill.amount)}
      </div>
      
      <div className="flex items-center gap-2">
        <Checkbox
          checked={bill.isPaid}
          onCheckedChange={() => onTogglePaid(bill.id)}
          className="h-4 w-4 data-[state=checked]:bg-success data-[state=checked]:border-success"
        />
        
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(bill.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
