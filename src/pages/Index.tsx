import { useState, useMemo, useEffect } from 'react';
import { useBills } from '@/hooks/useBills';
import { Layout } from '@/components/Layout';
import { MonthSelector } from '@/components/MonthSelector';
import { FinancialSummaryCards } from '@/components/FinancialSummaryCards';
import { ExpensesSection } from '@/components/ExpensesSection';
import { BillsList } from '@/components/BillsList';
import { ProgressBar } from '@/components/ProgressBar';
import { Skeleton } from '@/components/ui/skeleton';

type PeriodFilter = 'today' | 'week' | 'month';

const Index = () => {
  const { bills, togglePaid, addBill, deleteBill, totals, categorySummary } = useBills();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const getDateRange = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    if (periodFilter === 'today') {
      const today = new Date();
      const formatDate = (date: Date) =>
        date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
      return formatDate(today);
    }

    if (periodFilter === 'week') {
      const today = new Date();
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const formatDate = (date: Date) =>
        date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

      return `${formatDate(today)} - ${formatDate(weekEnd)}`;
    }

    // Month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const formatDate = (date: Date) =>
      date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });

    return `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
  };

  const filteredBills = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();

    return bills.filter(bill => {
      if (periodFilter === 'today') {
        return bill.day === currentDay;
      }

      if (periodFilter === 'week') {
        const weekDays = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() + i);
          weekDays.push(d.getDate());
        }
        return weekDays.includes(bill.day);
      }

      // Month - mostrar todos os bills do mês selecionado
      return true;
    });
  }, [bills, periodFilter]);

  const filteredTotals = useMemo(() => {
    const total = filteredBills.reduce((sum, bill) => sum + bill.amount, 0);
    const paid = filteredBills.filter(bill => bill.isPaid).reduce((sum, bill) => sum + bill.amount, 0);
    const pending = total - paid;
    const progress = total > 0 ? (paid / total) * 100 : 0;

    return { total, paid, pending, progress };
  }, [filteredBills]);

  const filteredCategorySummary = useMemo(() => {
    const categories: { [key: string]: any } = {};

    filteredBills.forEach(bill => {
      if (!categories[bill.category]) {
        const categoryData = categorySummary.find(c => c.category === bill.category);
        categories[bill.category] = categoryData || { category: bill.category, total: 0, color: '#ccc' };
      }
      categories[bill.category].total = (categories[bill.category].total || 0) + bill.amount;
    });

    return Object.values(categories);
  }, [filteredBills, categorySummary]);

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Month Selector */}
        <div className="flex items-center justify-between">
          <MonthSelector
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />

          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setPeriodFilter('today')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                periodFilter === 'today'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setPeriodFilter('week')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                periodFilter === 'week'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setPeriodFilter('month')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                periodFilter === 'month'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mês
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column - Summary */}
          <div className="lg:col-span-4">
            {isLoading ? (
              <div className="space-y-4 stagger-1">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </div>
            ) : (
              <FinancialSummaryCards
                total={filteredTotals.total}
                paid={filteredTotals.paid}
                pending={filteredTotals.pending}
                progress={filteredTotals.progress}
                dateRange={getDateRange()}
              />
            )}
          </div>

          {/* Right Column - Charts & Lists */}
          <div className="lg:col-span-8 space-y-5">
            {/* Progress */}
            <div className="bg-card rounded-xl p-5 border border-border card-hover stagger-2 animate-fade-in">
              <h3 className="text-sm font-semibold text-foreground mb-4">Evolução dos Pagamentos</h3>
              {isLoading ? (
                <Skeleton className="h-4 rounded-full" />
              ) : (
                <ProgressBar progress={filteredTotals.progress} />
              )}
            </div>

            {/* Expenses Chart */}
            <div className="card-hover rounded-xl stagger-3 animate-fade-in">
              {isLoading ? (
                <div className="bg-card rounded-xl p-5 border border-border">
                  <Skeleton className="h-64 rounded-lg" />
                </div>
              ) : (
                <ExpensesSection
                  data={filteredCategorySummary}
                  paidTotal={filteredTotals.paid}
                  pendingTotal={filteredTotals.pending}
                />
              )}
            </div>

            {/* Bills List */}
            <div className="bg-card rounded-xl p-5 border border-border card-hover stagger-4 animate-fade-in">
              <h3 className="text-sm font-semibold text-foreground mb-4">Contas por Categoria</h3>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                </div>
              ) : (
                <BillsList
                  bills={filteredBills}
                  onTogglePaid={togglePaid}
                  onDelete={deleteBill}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
