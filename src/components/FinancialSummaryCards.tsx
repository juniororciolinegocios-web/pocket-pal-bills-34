import { TrendingUp, Check, Clock } from 'lucide-react';
import { useCountUp } from '@/hooks/useCountUp';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FinancialSummaryCardsProps {
  total: number;
  paid: number;
  pending: number;
  progress: number;
  dateRange: string;
}

export function FinancialSummaryCards({ total, paid, pending, progress, dateRange }: FinancialSummaryCardsProps) {
  const animatedTotal = useCountUp({ start: 0, end: total, duration: 800, decimals: 2, delay: 0 });
  const animatedPaid = useCountUp({ start: 0, end: paid, duration: 800, decimals: 2, delay: 50 });
  const animatedPending = useCountUp({ start: 0, end: pending, duration: 800, decimals: 2, delay: 100 });
  const animatedProgress = useCountUp({ start: 0, end: progress, duration: 600, decimals: 1, delay: 150 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Resultado do Período */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-card rounded-xl p-5 border border-border card-hover cursor-help animate-fade-in stagger-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Resultado do Período</p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {formatCurrency(animatedTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">{dateRange}</p>
                </div>
                <div className="flex items-center gap-1.5 text-success bg-success/10 px-2 py-1 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-xs font-medium">{animatedProgress.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>Soma de todas as contas do período</TooltipContent>
        </Tooltip>

        {/* Entradas (Pagos) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-card rounded-xl p-5 border border-border card-hover cursor-help animate-fade-in stagger-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-success/10">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm font-medium text-foreground">Pagos</span>
              </div>
              <p className="text-2xl font-bold text-success">{formatCurrency(animatedPaid)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total pago no período</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>Contas já pagas e confirmadas</TooltipContent>
        </Tooltip>

        {/* Saídas (Pendentes) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-card rounded-xl p-5 border border-border card-hover cursor-help animate-fade-in stagger-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
                <span className="text-sm font-medium text-foreground">Pendentes</span>
              </div>
              <p className="text-2xl font-bold text-warning">{formatCurrency(animatedPending)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total a pagar</p>
            </div>
          </TooltipTrigger>
          <TooltipContent>Contas que ainda precisam ser pagas</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
