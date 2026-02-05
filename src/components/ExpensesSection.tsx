import { useState } from 'react';
import { CategorySummary, CATEGORY_LABELS } from '@/types/bill';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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
    { id: 'categoria' as TabType, label: 'Detalhes por Categoria' },
    { id: 'pagos' as TabType, label: 'Pagos' },
    { id: 'apagar' as TabType, label: 'A Pagar' },
  ];

  return (
    <div className="bg-card rounded-xl p-5 border border-border card-hover">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h3 className="text-sm font-semibold text-foreground">Despesas</h3>
        <div className="flex gap-1 bg-secondary rounded-lg p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'categoria' && (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-40 h-40 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
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
          
          <div className="flex-1 w-full space-y-2">
            {data.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
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
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <p className="text-3xl font-bold text-success">{formatCurrency(paidTotal)}</p>
          <p className="text-sm text-muted-foreground mt-2">Total pago neste período</p>
        </div>
      )}

      {activeTab === 'apagar' && (
        <div className="text-center py-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warning/10 mb-4">
            <span className="text-3xl">⏳</span>
          </div>
          <p className="text-3xl font-bold text-warning">{formatCurrency(pendingTotal)}</p>
          <p className="text-sm text-muted-foreground mt-2">Total a pagar neste período</p>
        </div>
      )}
    </div>
  );
}
