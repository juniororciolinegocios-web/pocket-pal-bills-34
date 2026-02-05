import { TrendingUp, Check, Clock } from 'lucide-react';

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
      <div className="bg-card rounded-xl p-5 border border-border card-hover">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Resultado do Período</p>
            <p className="text-2xl font-bold text-foreground mt-2">
              {formatCurrency(total)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">{dateRange}</p>
          </div>
          <div className="flex items-center gap-1.5 text-success bg-success/10 px-2 py-1 rounded-full">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs font-medium">{progress.toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Entradas (Pagos) */}
      <div className="bg-card rounded-xl p-5 border border-border card-hover">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-success/10">
            <Check className="h-4 w-4 text-success" />
          </div>
          <span className="text-sm font-medium text-foreground">Pagos</span>
        </div>
        <p className="text-2xl font-bold text-success">{formatCurrency(paid)}</p>
        <p className="text-xs text-muted-foreground mt-1">Total pago no período</p>
      </div>

      {/* Saídas (Pendentes) */}
      <div className="bg-card rounded-xl p-5 border border-border card-hover">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-warning/10">
            <Clock className="h-4 w-4 text-warning" />
          </div>
          <span className="text-sm font-medium text-foreground">Pendentes</span>
        </div>
        <p className="text-2xl font-bold text-warning">{formatCurrency(pending)}</p>
        <p className="text-xs text-muted-foreground mt-1">Total a pagar</p>
      </div>
    </div>
  );
}
