 import { useMemo } from 'react';
 import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, PiggyBank, Target, ArrowRight } from 'lucide-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Progress } from '@/components/ui/progress';
 import { Bill } from '@/types/bill';
 import { BankAccount, Transaction, FinancialSummary } from '@/types/finance';
 import { cn } from '@/lib/utils';
 
 interface FinancialAnalysisProps {
   bills: Bill[];
   billTotals: { total: number; paid: number; pending: number; progress: number };
   accounts: BankAccount[];
   transactions: Transaction[];
   summary: FinancialSummary;
 }
 
 export function FinancialAnalysis({
   bills,
   billTotals,
   accounts,
   transactions,
   summary,
 }: FinancialAnalysisProps) {
   // Saldo vs Contas a pagar
   const balanceVsBills = useMemo(() => {
     const availableBalance = summary.totalBalance;
     const pendingBills = billTotals.pending;
     const coverage = pendingBills > 0 ? (availableBalance / pendingBills) * 100 : 100;
     const surplus = availableBalance - pendingBills;
     
     return {
       availableBalance,
       pendingBills,
       coverage: Math.min(coverage, 100),
       surplus,
       status: surplus >= 0 ? 'ok' : 'alert',
     };
   }, [summary.totalBalance, billTotals.pending]);
 
   // Projeção de fluxo de caixa (próximos 3 meses)
   const cashflowProjection = useMemo(() => {
     const monthlyIncome = summary.totalIncome;
     const monthlyExpenses = summary.totalExpenses + billTotals.total;
     const monthlySurplus = monthlyIncome - monthlyExpenses;
     
     const projections = [1, 2, 3].map(month => ({
       month,
       balance: summary.totalBalance + (monthlySurplus * month),
     }));
     
     return {
       monthlyIncome,
       monthlyExpenses,
       monthlySurplus,
       projections,
     };
   }, [summary, billTotals.total]);
 
   // Distribuição ideal 50-30-20
   const distributionAnalysis = useMemo(() => {
     const totalIncome = summary.totalIncome || billTotals.total * 1.5; // Estimate if no income
     
     const ideal = {
       necessidades: totalIncome * 0.5,
       desejos: totalIncome * 0.3,
       poupanca: totalIncome * 0.2,
     };
     
     // Categorize expenses
     const necessidadesCats = ['CASA', 'ALUGUEL', 'SAUDE', 'TRANSPORTE', 'ALIMENTACAO'];
     const desejosCats = ['LAZER', 'CARTAO'];
     
     const actual = {
       necessidades: bills.filter(b => necessidadesCats.includes(b.category)).reduce((s, b) => s + b.amount, 0),
       desejos: bills.filter(b => desejosCats.includes(b.category)).reduce((s, b) => s + b.amount, 0),
       poupanca: 0,
     };
     
     return {
       totalIncome,
       ideal,
       actual,
       necessidadesPercent: totalIncome > 0 ? (actual.necessidades / totalIncome) * 100 : 0,
       desejosPercent: totalIncome > 0 ? (actual.desejos / totalIncome) * 100 : 0,
     };
   }, [bills, summary.totalIncome, billTotals.total]);
 
   // Alertas inteligentes
   const alerts = useMemo(() => {
     const items: { type: 'warning' | 'danger' | 'success'; message: string }[] = [];
     
     if (balanceVsBills.surplus < 0) {
       items.push({
         type: 'danger',
         message: `Saldo insuficiente! Faltam R$ ${Math.abs(balanceVsBills.surplus).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para pagar as contas pendentes.`,
       });
     } else if (balanceVsBills.surplus < billTotals.total * 0.2) {
       items.push({
         type: 'warning',
         message: `Saldo apertado. Após pagar as contas, sobrarão apenas R$ ${balanceVsBills.surplus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
       });
     } else {
       items.push({
         type: 'success',
         message: `Saldo confortável! Você tem R$ ${balanceVsBills.surplus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de sobra após as contas.`,
       });
     }
     
     if (distributionAnalysis.desejosPercent > 35) {
       items.push({
         type: 'warning',
         message: `Gastos com "desejos" estão em ${distributionAnalysis.desejosPercent.toFixed(0)}% (ideal: 30%). Considere reduzir.`,
       });
     }
     
     if (cashflowProjection.monthlySurplus < 0) {
       items.push({
         type: 'danger',
         message: `Fluxo de caixa negativo! Você gasta R$ ${Math.abs(cashflowProjection.monthlySurplus).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a mais do que ganha.`,
       });
     }
     
     return items;
   }, [balanceVsBills, distributionAnalysis, cashflowProjection, billTotals.total]);
 
   if (accounts.length === 0) {
     return null;
   }
 
   return (
     <div className="space-y-4">
       {/* Alertas */}
       {alerts.length > 0 && (
         <div className="space-y-2">
           {alerts.map((alert, i) => (
             <div
               key={i}
               className={cn(
                 "flex items-center gap-3 p-3 rounded-lg border text-sm",
                 alert.type === 'danger' && "bg-destructive/10 border-destructive/30 text-destructive",
                 alert.type === 'warning' && "bg-amber-500/10 border-amber-500/30 text-amber-600",
                 alert.type === 'success' && "bg-primary/10 border-primary/30 text-primary"
               )}
             >
               {alert.type === 'danger' && <AlertTriangle className="w-4 h-4 shrink-0" />}
               {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 shrink-0" />}
               {alert.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
               <span>{alert.message}</span>
             </div>
           ))}
         </div>
       )}
 
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {/* Saldo vs Contas */}
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm flex items-center gap-2">
               <Target className="w-4 h-4 text-primary" />
               Saldo vs Contas a Pagar
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Saldo disponível</span>
               <span className="font-semibold text-primary">
                 R$ {balanceVsBills.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </span>
             </div>
             <div className="flex justify-between text-sm">
               <span className="text-muted-foreground">Contas pendentes</span>
               <span className="font-semibold text-destructive">
                 R$ {balanceVsBills.pendingBills.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </span>
             </div>
             <Progress value={balanceVsBills.coverage} className="h-2" />
             <div className="flex justify-between text-xs">
               <span className="text-muted-foreground">Cobertura</span>
               <span className={balanceVsBills.surplus >= 0 ? 'text-primary' : 'text-destructive'}>
                 {balanceVsBills.coverage.toFixed(0)}%
               </span>
             </div>
             <div className="pt-2 border-t">
               <div className="flex justify-between items-center">
                 <span className="text-sm text-muted-foreground">Após pagar tudo:</span>
                 <span className={cn(
                   "font-bold",
                   balanceVsBills.surplus >= 0 ? 'text-primary' : 'text-destructive'
                 )}>
                   {balanceVsBills.surplus >= 0 ? '+' : ''}
                   R$ {balanceVsBills.surplus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                 </span>
               </div>
             </div>
           </CardContent>
         </Card>
 
         {/* Distribuição 50-30-20 */}
         <Card>
           <CardHeader className="pb-2">
             <CardTitle className="text-sm flex items-center gap-2">
               <PiggyBank className="w-4 h-4 text-primary" />
               Regra 50-30-20
             </CardTitle>
           </CardHeader>
           <CardContent className="space-y-3">
             <div className="space-y-2">
               <div className="flex justify-between items-center text-sm">
                 <span>Necessidades (50%)</span>
                 <span className={distributionAnalysis.necessidadesPercent > 55 ? 'text-destructive' : 'text-foreground'}>
                   {distributionAnalysis.necessidadesPercent.toFixed(0)}%
                 </span>
               </div>
               <Progress 
                 value={Math.min(distributionAnalysis.necessidadesPercent, 100)} 
                 className="h-2"
               />
             </div>
             <div className="space-y-2">
               <div className="flex justify-between items-center text-sm">
                 <span>Desejos (30%)</span>
                 <span className={distributionAnalysis.desejosPercent > 35 ? 'text-destructive' : 'text-foreground'}>
                   {distributionAnalysis.desejosPercent.toFixed(0)}%
                 </span>
               </div>
               <Progress 
                 value={Math.min(distributionAnalysis.desejosPercent, 100)} 
                 className="h-2"
               />
             </div>
             <div className="pt-2 text-xs text-muted-foreground">
               💡 Ideal: 50% necessidades, 30% desejos, 20% poupança
             </div>
           </CardContent>
         </Card>
 
         {/* Fluxo de Caixa Projetado */}
         <Card className="md:col-span-2">
           <CardHeader className="pb-2">
             <CardTitle className="text-sm flex items-center gap-2">
               {cashflowProjection.monthlySurplus >= 0 ? (
                 <TrendingUp className="w-4 h-4 text-primary" />
               ) : (
                 <TrendingDown className="w-4 h-4 text-destructive" />
               )}
               Projeção de Fluxo de Caixa
             </CardTitle>
           </CardHeader>
           <CardContent>
             <div className="flex items-center justify-between gap-4">
               <div className="text-center">
                 <p className="text-xs text-muted-foreground">Hoje</p>
                 <p className="font-bold text-lg">
                   R$ {summary.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                 </p>
               </div>
               {cashflowProjection.projections.map((proj, i) => (
                 <div key={proj.month} className="flex items-center gap-2">
                   <ArrowRight className="w-4 h-4 text-muted-foreground" />
                   <div className="text-center">
                     <p className="text-xs text-muted-foreground">
                       {proj.month === 1 ? 'Próximo mês' : `${proj.month} meses`}
                     </p>
                     <p className={cn(
                       "font-bold text-lg",
                       proj.balance >= 0 ? 'text-foreground' : 'text-destructive'
                     )}>
                       R$ {proj.balance.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
             <div className="mt-4 pt-3 border-t flex justify-between text-sm">
               <span className="text-muted-foreground">
                 Fluxo mensal: {cashflowProjection.monthlySurplus >= 0 ? '+' : ''}
                 R$ {cashflowProjection.monthlySurplus.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
               </span>
               <span className={cashflowProjection.monthlySurplus >= 0 ? 'text-primary' : 'text-destructive'}>
                 {cashflowProjection.monthlySurplus >= 0 ? 'Saudável' : 'Deficitário'}
               </span>
             </div>
           </CardContent>
         </Card>
       </div>
     </div>
   );
 }