import { useState, useMemo, useEffect } from 'react';
import { Layout } from '@/components/Layout';
 import { useBillsContext } from '@/components/Layout';
import { MonthSelector } from '@/components/MonthSelector';
import { FinancialSummaryCards } from '@/components/FinancialSummaryCards';
import { ExpensesSection } from '@/components/ExpensesSection';
import { BillsList } from '@/components/BillsList';
import { ProgressBar } from '@/components/ProgressBar';
 import { HealthScore } from '@/components/HealthScore';
 import { DailyInsight } from '@/components/DailyInsight';
import { Skeleton } from '@/components/ui/skeleton';
import { BankAccountsCard } from '@/components/BankAccountsCard';
import { StatementImporter } from '@/components/StatementImporter';
import { FinancialAnalysis } from '@/components/FinancialAnalysis';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { BillCategory, CategorySummary, CATEGORY_COLORS } from '@/types/bill';

type PeriodFilter = 'today' | 'week' | 'month';

function IndexContent() {
  const { bills, togglePaid, deleteBill, totals, categorySummary } = useBillsContext();
  const { 
    accounts, 
    transactions, 
    summary, 
    isLoading: accountsLoading,
    addAccount,
    updateBalance,
    deleteAccount,
    refresh: refreshAccounts,
  } = useBankAccounts();
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

  const filteredCategorySummary = useMemo((): CategorySummary[] => {
    const categories: Record<BillCategory, number> = {
      CARTAO: 0,
      ALUGUEL: 0,
      CASA: 0,
      INVESTIMENTO: 0,
      CONVENIO: 0,
      ESCOLA: 0,
      OUTROS: 0,
    };

    filteredBills.forEach(bill => {
      categories[bill.category] += bill.amount;
    });

    return Object.entries(categories)
      .filter(([_, total]) => total > 0)
      .map(([category, total]) => ({
        category: category as BillCategory,
        total,
        color: CATEGORY_COLORS[category as BillCategory],
      }))
      .sort((a, b) => b.total - a.total);
  }, [filteredBills, categorySummary]);

  return (
      <div className="space-y-6 animate-fade-in">
        {/* Top Row: Daily Insight + Health Score + Bank Accounts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <DailyInsight bills={bills} totals={totals} />
          <HealthScore bills={bills} totals={totals} />
          <BankAccountsCard
            accounts={accounts}
            totalBalance={summary.totalBalance}
            onAddAccount={addAccount}
            onUpdateBalance={updateBalance}
            onDeleteAccount={deleteAccount}
          />
        </div>

        {/* Financial Analysis (only shows if accounts exist) */}
        {accounts.length > 0 && (
          <FinancialAnalysis
            bills={bills}
            billTotals={totals}
            accounts={accounts}
            transactions={transactions}
            summary={summary}
          />
        )}

        {/* Month Selector */}
        <div className="flex items-center justify-between">
          <MonthSelector
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
          />
          
          <div className="flex items-center gap-2">
            <StatementImporter accounts={accounts} onImportComplete={refreshAccounts} />
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
  );
}

const Index = () => {
  return (
    <Layout>
      <IndexContent />
    </Layout>
  );
};

export default Index;
