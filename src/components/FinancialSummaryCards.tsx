import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialSummaryCardsProps {
  total: number;
  paid: number;
  pending: number;
  progress: number;
  dateRange: string;
}

export function FinancialSummaryCards({ total, paid, pending, progress, dateRange }: FinancialSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Resultado do Período */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Resultado do Período</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {formatCurrency(total)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{dateRange}</p>
          </div>
          <div className="flex items-center gap-1 text-success">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Entradas (Pagos) */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
          <span className="font-medium text-foreground">Pagos</span>
          <span className="text-sm font-medium text-success">Realizados</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Pago</span>
            <span className="font-semibold text-success">{formatCurrency(paid)}</span>
          </div>
        </div>
      </div>

      {/* Saídas (Pendentes) */}
      <div className="bg-card rounded-xl p-5 border border-border">
        <div className="flex items-center justify-between border-b border-border pb-3 mb-3">
          <span className="font-medium text-foreground">Pendentes</span>
          <span className="text-sm font-medium text-warning">A Pagar</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Pendente</span>
            <span className="font-semibold text-warning">{formatCurrency(pending)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
