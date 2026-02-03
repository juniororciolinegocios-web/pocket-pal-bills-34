import { Wallet, CheckCircle, Clock, Receipt } from 'lucide-react';
import { useBills } from '@/hooks/useBills';
import { SummaryCard } from '@/components/SummaryCard';
import { ProgressBar } from '@/components/ProgressBar';
import { BillItem } from '@/components/BillItem';
import { CategoryChart } from '@/components/CategoryChart';
import { AddBillDialog } from '@/components/AddBillDialog';

const Index = () => {
  const { bills, togglePaid, addBill, deleteBill, totals, categorySummary } = useBills();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const currentMonth = new Date().toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const paidCount = bills.filter(b => b.isPaid).length;
  const pendingCount = bills.filter(b => !b.isPaid).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Minhas Contas</h1>
            <p className="text-muted-foreground capitalize mt-1">{currentMonth}</p>
          </div>
          <AddBillDialog onAddBill={addBill} />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            title="Total do Mês"
            value={formatCurrency(totals.total)}
            icon={Wallet}
            subtitle={`${bills.length} contas`}
          />
          <SummaryCard
            title="Pago"
            value={formatCurrency(totals.paid)}
            icon={CheckCircle}
            variant="success"
            subtitle={`${paidCount} contas pagas`}
          />
          <SummaryCard
            title="Pendente"
            value={formatCurrency(totals.pending)}
            icon={Clock}
            variant="warning"
            subtitle={`${pendingCount} a pagar`}
          />
          <SummaryCard
            title="Contas"
            value={bills.length.toString()}
            icon={Receipt}
            subtitle="cadastradas"
          />
        </div>

        {/* Progress Bar */}
        <div className="glass-card rounded-xl p-5 mb-6 animate-fade-in">
          <ProgressBar progress={totals.progress} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bills List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Lista de Contas</h2>
              <span className="text-sm text-muted-foreground">
                Ordenado por dia
              </span>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {bills.map((bill) => (
                <BillItem
                  key={bill.id}
                  bill={bill}
                  onTogglePaid={togglePaid}
                  onDelete={deleteBill}
                />
              ))}
              {bills.length === 0 && (
                <div className="glass-card rounded-xl p-8 text-center">
                  <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhuma conta cadastrada</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Clique em "Nova Conta" para começar
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Category Chart */}
          <div className="lg:col-span-1">
            <CategoryChart data={categorySummary} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
