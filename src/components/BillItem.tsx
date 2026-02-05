import { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { Bill } from '@/types/bill';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface BillItemProps {
  bill: Bill;
  onTogglePaid: (id: string) => void;
  onDelete: (id: string) => void;
}

export function BillItem({ bill, onTogglePaid, onDelete }: BillItemProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleTogglePaid = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);

    onTogglePaid(bill.id);

    toast({
      description: bill.isPaid ? 'Conta desmarcada como paga' : 'Conta marcada como paga',
      duration: 2000,
    });
  };

  const handleDelete = () => {
    onDelete(bill.id);
    toast({
      description: 'Conta excluída com sucesso',
      duration: 2000,
    });
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
        <div className={cn(isAnimating && "animate-check-bounce")}>
          <Checkbox
            checked={bill.isPaid}
            onCheckedChange={handleTogglePaid}
            className="h-4 w-4 data-[state=checked]:bg-success data-[state=checked]:border-success"
          />
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a conta "{bill.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
