 import { Layout } from '@/components/Layout';
 import { useBills } from '@/hooks/useBills';
 import { CATEGORY_LABELS, CATEGORY_COLORS, BillCategory } from '@/types/bill';
 import { Card, CardContent } from '@/components/ui/card';
 import { Progress } from '@/components/ui/progress';
 import { Tags, TrendingUp } from 'lucide-react';
 import { useMemo } from 'react';
 
 const Categories = () => {
   const { bills, categorySummary, totals } = useBills();
 
   const formatCurrency = (value: number) => {
     return new Intl.NumberFormat('pt-BR', {
       style: 'currency',
       currency: 'BRL',
     }).format(value);
   };
 
   const categoryStats = useMemo(() => {
     const stats: Record<BillCategory, { total: number; paid: number; pending: number; count: number }> = {} as any;
     
     Object.keys(CATEGORY_LABELS).forEach(cat => {
       stats[cat as BillCategory] = { total: 0, paid: 0, pending: 0, count: 0 };
     });
 
     bills.forEach(bill => {
       stats[bill.category].total += bill.amount;
       stats[bill.category].count++;
       if (bill.isPaid) {
         stats[bill.category].paid += bill.amount;
       } else {
         stats[bill.category].pending += bill.amount;
       }
     });
 
     return stats;
   }, [bills]);
 
   return (
     <Layout>
       <div className="space-y-6 animate-fade-in">
         {/* Header */}
         <div className="flex items-center justify-between">
           <div>
             <h1 className="text-2xl font-bold text-foreground">Minhas Categorias</h1>
             <p className="text-muted-foreground mt-1">Visualize seus gastos por categoria</p>
           </div>
         </div>
 
         {/* Summary */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-primary/10">
                   <Tags className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Categorias Ativas</p>
                   <p className="text-xl font-bold text-foreground">{categorySummary.length}</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-secondary">
                   <TrendingUp className="h-5 w-5 text-foreground" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Total Geral</p>
                   <p className="text-xl font-bold text-foreground">{formatCurrency(totals.total)}</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-6">
               <p className="text-sm text-muted-foreground">Maior Categoria</p>
               {categorySummary[0] && (
                 <div className="flex items-center gap-2 mt-1">
                   <div 
                     className="w-3 h-3 rounded-full" 
                     style={{ backgroundColor: categorySummary[0].color }}
                   />
                   <p className="text-lg font-bold text-foreground">
                     {CATEGORY_LABELS[categorySummary[0].category]}
                   </p>
                 </div>
               )}
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-6">
               <p className="text-sm text-muted-foreground">Contas Cadastradas</p>
               <p className="text-xl font-bold text-foreground mt-1">{bills.length}</p>
             </CardContent>
           </Card>
         </div>
 
         {/* Categories Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {(Object.keys(CATEGORY_LABELS) as BillCategory[]).map((category) => {
             const stats = categoryStats[category];
             const percentage = totals.total > 0 ? (stats.total / totals.total) * 100 : 0;
             const paidPercentage = stats.total > 0 ? (stats.paid / stats.total) * 100 : 0;
             
             return (
               <Card key={category} className="card-hover overflow-hidden">
                 <div 
                   className="h-1.5" 
                   style={{ backgroundColor: CATEGORY_COLORS[category] }}
                 />
                 <CardContent className="p-5">
                   <div className="flex items-start justify-between mb-4">
                     <div className="flex items-center gap-3">
                       <div 
                         className="w-10 h-10 rounded-xl flex items-center justify-center"
                         style={{ backgroundColor: `${CATEGORY_COLORS[category]}20` }}
                       >
                         <div 
                           className="w-4 h-4 rounded-full" 
                           style={{ backgroundColor: CATEGORY_COLORS[category] }}
                         />
                       </div>
                       <div>
                         <h3 className="font-semibold text-foreground">{CATEGORY_LABELS[category]}</h3>
                         <p className="text-xs text-muted-foreground">{stats.count} conta(s)</p>
                       </div>
                     </div>
                     <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                       {percentage.toFixed(1)}%
                     </span>
                   </div>
                   
                   <div className="space-y-3">
                     <div className="flex items-center justify-between">
                       <span className="text-sm text-muted-foreground">Total</span>
                       <span className="font-semibold text-foreground">{formatCurrency(stats.total)}</span>
                     </div>
                     
                     <div className="space-y-1.5">
                       <div className="flex items-center justify-between text-xs">
                         <span className="text-muted-foreground">Pago</span>
                         <span className="text-success font-medium">{formatCurrency(stats.paid)}</span>
                       </div>
                       <Progress value={paidPercentage} className="h-1.5" />
                     </div>
                     
                     {stats.pending > 0 && (
                       <div className="flex items-center justify-between text-xs">
                         <span className="text-muted-foreground">Pendente</span>
                         <span className="text-warning font-medium">{formatCurrency(stats.pending)}</span>
                       </div>
                     )}
                   </div>
                 </CardContent>
               </Card>
             );
           })}
         </div>
       </div>
     </Layout>
   );
 };
 
 export default Categories;