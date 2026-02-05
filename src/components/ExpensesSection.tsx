import { useState, useMemo } from 'react';
import { useCountUp } from '@/hooks/useCountUp';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CategorySummary, CATEGORY_LABELS } from '@/types/bill';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

interface ExpensesSectionProps {
  data: CategorySummary[];
  paidTotal: number;
  pendingTotal: number;
}

type TabType = 'pagos' | 'apagar' | 'categoria';

export function ExpensesSection({ data, paidTotal, pendingTotal }: ExpensesSectionProps) {
  const [activeTab, setActiveTab] = useState<TabType>('categoria');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const animatedPaidTotal = useCountUp({ start: 0, end: paidTotal, duration: 800, decimals: 2, delay: 50 });
  const animatedPendingTotal = useCountUp({ start: 0, end: pendingTotal, duration: 800, decimals: 2, delay: 100 });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const chartData = useMemo(() => {
    return data.map(item => ({
      name: CATEGORY_LABELS[item.category],
      value: item.total,
      color: item.color,
      category: item.category,
    }));
  }, [data]);

  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + item.total, 0);
  }, [data]);

  const handlePieClick = (entry: any) => {
    setSelectedCategory(selectedCategory === entry.category ? null : entry.category);
  };

  const filteredData = useMemo(() => {
    return selectedCategory ? data.filter(item => item.category === selectedCategory) : data;
  }, [data, selectedCategory]);

  const tabs = [
    { id: 'categoria' as TabType, label: 'Detalhes por Categoria' },
    { id: 'pagos' as TabType, label: 'Pagos' },
    { id: 'apagar' as TabType, label: 'A Pagar' },
  ];

  return (
    <TooltipProvider>
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
          <div className="animate-tab-fade-in flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-40 h-40 flex-shrink-0 cursor-pointer">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={selectedCategory ? 75 : 70}
                        paddingAngle={2}
                        dataKey="value"
                        onClick={(entry) => handlePieClick(entry)}
                      >
                        {chartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color}
                            opacity={selectedCategory && selectedCategory !== entry.category ? 0.3 : 1}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
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
              </TooltipTrigger>
              <TooltipContent>Clique para filtrar por categoria</TooltipContent>
            </Tooltip>

            <div className="flex-1 w-full space-y-2">
              {filteredData.map((item) => (
                <div
                  key={item.category}
                  onClick={() => setSelectedCategory(selectedCategory === item.category ? null : item.category)}
                  className={`flex items-center justify-between text-sm py-1.5 px-2 rounded-lg transition-all cursor-pointer ${
                    selectedCategory === item.category
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-secondary/50"
                  }`}
                >
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
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="mt-3 text-xs text-primary hover:underline"
                >
                  Limpar filtro
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pagos' && (
          <div className="animate-tab-fade-in text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 mb-4">
              <span className="text-3xl">✓</span>
            </div>
            <p className="text-3xl font-bold text-success">{formatCurrency(animatedPaidTotal)}</p>
            <p className="text-sm text-muted-foreground mt-2">Total pago neste período</p>
          </div>
        )}

        {activeTab === 'apagar' && (
          <div className="animate-tab-fade-in text-center py-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-warning/10 mb-4">
              <span className="text-3xl">⏳</span>
            </div>
            <p className="text-3xl font-bold text-warning">{formatCurrency(animatedPendingTotal)}</p>
            <p className="text-sm text-muted-foreground mt-2">Total a pagar neste período</p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
