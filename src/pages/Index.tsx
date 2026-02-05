import { useState } from 'react';
import { useBills } from '@/hooks/useBills';
import { Layout } from '@/components/Layout';
import { MonthSelector } from '@/components/MonthSelector';
import { FinancialSummaryCards } from '@/components/FinancialSummaryCards';
import { ExpensesSection } from '@/components/ExpensesSection';
import { BillsList } from '@/components/BillsList';
import { ProgressBar } from '@/components/ProgressBar';

const Index = () => {
  const { bills, togglePaid, addBill, deleteBill, totals, categorySummary } = useBills();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDateRange = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const formatDate = (date: Date) => 
      date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    
    return `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
  };

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
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              Semana
            </button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-card text-foreground shadow-sm">
              Mês
            </button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-muted-foreground hover:text-foreground transition-colors">
              Hoje
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column - Summary */}
          <div className="lg:col-span-4">
            <FinancialSummaryCards
              total={totals.total}
              paid={totals.paid}
              pending={totals.pending}
              progress={totals.progress}
              dateRange={getDateRange()}
            />
          </div>

          {/* Right Column - Charts & Lists */}
          <div className="lg:col-span-8 space-y-5">
            {/* Progress */}
            <div className="bg-card rounded-xl p-5 border border-border card-hover">
              <h3 className="text-sm font-semibold text-foreground mb-4">Evolução dos Pagamentos</h3>
              <ProgressBar progress={totals.progress} />
            </div>

            {/* Expenses Chart */}
            <div className="card-hover rounded-xl">
              <ExpensesSection 
                data={categorySummary} 
                paidTotal={totals.paid}
                pendingTotal={totals.pending}
              />
            </div>

            {/* Bills List */}
            <div className="bg-card rounded-xl p-5 border border-border card-hover">
              <h3 className="text-sm font-semibold text-foreground mb-4">Contas por Categoria</h3>
              <BillsList
                bills={bills}
                onTogglePaid={togglePaid}
                onDelete={deleteBill}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
