import { useState } from 'react';
import { CategorySummary, CATEGORY_LABELS } from '@/types/bill';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface ExpensesSectionProps {
  data: CategorySummary[];
  paidTotal: number;
  pendingTotal: number;
}

type TabType = 'pagos' | 'apagar' | 'categoria';

export function ExpensesSection({ data, paidTotal, pendingTotal }: ExpensesSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('categoria');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const chartData = data.map(item => ({
    name: CATEGORY_LABELS[item.category],
    value: item.total,
    color: item.color,
  }));

  const total = data.reduce((sum, item) => sum + item.total, 0);

  const tabs = [
    { id: 'pagos' as TabType, label: 'Pagos' },
    { id: 'apagar' as TabType, label: 'A Pagar' },
    { id: 'categoria' as TabType, label: 'Detalhes por Categoria' },
  ];

  return (
    <div className="bg-card rounded-xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Despesas</h3>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'categoria' && (
        <div className="flex items-start gap-6">
          <div className="w-44 h-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 space-y-2">
            {data.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-sm py-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{CATEGORY_LABELS[item.category]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{formatCurrency(item.total)}</span>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {((item.total / total) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pagos' && (
        <div className="text-center py-8">
          <p className="text-3xl font-bold text-success">{formatCurrency(paidTotal)}</p>
          <p className="text-sm text-muted-foreground mt-1">Total Pago</p>
        </div>
      )}

      {activeTab === 'apagar' && (
        <div className="text-center py-8">
          <p className="text-3xl font-bold text-warning">{formatCurrency(pendingTotal)}</p>
          <p className="text-sm text-muted-foreground mt-1">Total a Pagar</p>
        </div>
      )}
    </div>
  );
}
