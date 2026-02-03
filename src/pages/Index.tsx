import { useState } from 'react';
import { useBills } from '@/hooks/useBills';
import { Header } from '@/components/Header';
import { MonthSelector } from '@/components/MonthSelector';
import { FinancialSummaryCards } from '@/components/FinancialSummaryCards';
import { ExpensesSection } from '@/components/ExpensesSection';
import { BillsList } from '@/components/BillsList';
import { AddBillDialog } from '@/components/AddBillDialog';
import { ProgressBar } from '@/components/ProgressBar';

const Index = () => {
  const { bills, togglePaid, addBill, deleteBill, totals, categorySummary } = useBills();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addDialogOpen, setAddDialogOpen] = useState(false);

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
    <div className="min-h-screen bg-background">
      <Header onAddBill={() => setAddDialogOpen(true)} />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Month Selector */}
        <div className="flex items-center justify-between mb-6">
          <MonthSelector 
            currentMonth={currentMonth} 
            onMonthChange={setCurrentMonth} 
          />
          
          <div className="flex gap-1 bg-secondary rounded-lg p-1">
            <button className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors">
              Semana
            </button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-card text-foreground shadow-sm">
              Mês
            </button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground transition-colors">
              Hoje
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
          <div className="lg:col-span-8 space-y-6">
            {/* Progress */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Evolução dos Pagamentos</h3>
              <ProgressBar progress={totals.progress} />
            </div>

            {/* Expenses Chart */}
            <ExpensesSection 
              data={categorySummary} 
              paidTotal={totals.paid}
              pendingTotal={totals.pending}
            />

            {/* Bills List */}
            <div className="bg-card rounded-xl p-5 border border-border">
              <h3 className="font-semibold text-foreground mb-4">Contas por Categoria</h3>
              <BillsList
                bills={bills}
                onTogglePaid={togglePaid}
                onDelete={deleteBill}
              />
            </div>
          </div>
        </div>
      </div>

      <AddBillDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen} 
        onAddBill={addBill} 
      />
    </div>
  );
};

export default Index;
