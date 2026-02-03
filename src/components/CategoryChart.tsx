import { CategorySummary, CATEGORY_LABELS } from '@/types/bill';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryChartProps {
  data: CategorySummary[];
}

export function CategoryChart({ data }: CategoryChartProps) {
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

  return (
    <div className="glass-card rounded-xl p-5 animate-fade-in">
      <h3 className="text-lg font-semibold text-foreground mb-4">Gastos por Categoria</h3>
      
      <div className="flex items-center gap-6">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
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
        
        <div className="flex-1 space-y-2 max-h-40 overflow-y-auto">
          {data.map((item) => (
            <div key={item.category} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{CATEGORY_LABELS[item.category]}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{formatCurrency(item.total)}</span>
                <span className="text-xs text-muted-foreground">
                  ({((item.total / total) * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
