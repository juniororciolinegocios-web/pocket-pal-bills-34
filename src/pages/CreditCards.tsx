 import { useMemo } from 'react';
 import { Layout } from '@/components/Layout';
 import { useBills } from '@/hooks/useBills';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Checkbox } from '@/components/ui/checkbox';
 import { CreditCard, Check, Clock } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 const CreditCards = () => {
   const { bills, togglePaid } = useBills();
 
   const formatCurrency = (value: number) => {
     return new Intl.NumberFormat('pt-BR', {
       style: 'currency',
       currency: 'BRL',
     }).format(value);
   };
 
   // Group credit card bills by name (Nubank, C6, etc.)
   const cardGroups = useMemo(() => {
     const cardBills = bills.filter(bill => bill.category === 'CARTAO');
     const groups: Record<string, typeof cardBills> = {};
     
     cardBills.forEach(bill => {
       const cardName = bill.name.split(' ')[0]; // First word as card name
       if (!groups[cardName]) {
         groups[cardName] = [];
       }
       groups[cardName].push(bill);
     });
     
     return groups;
   }, [bills]);
 
   const totalCards = useMemo(() => {
     const cardBills = bills.filter(bill => bill.category === 'CARTAO');
     const total = cardBills.reduce((sum, bill) => sum + bill.amount, 0);
     const paid = cardBills.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
     return { total, paid, pending: total - paid };
   }, [bills]);
 
   const cardColors: Record<string, { bg: string; text: string; accent: string }> = {
     Nubank: { bg: 'from-purple-600 to-purple-800', text: 'text-white', accent: 'bg-purple-400' },
     C6: { bg: 'from-gray-800 to-gray-900', text: 'text-white', accent: 'bg-gray-400' },
     Itau: { bg: 'from-orange-500 to-orange-700', text: 'text-white', accent: 'bg-orange-300' },
     Bradesco: { bg: 'from-red-600 to-red-800', text: 'text-white', accent: 'bg-red-400' },
     default: { bg: 'from-primary to-primary/80', text: 'text-primary-foreground', accent: 'bg-primary/50' },
   };
 
   const getCardStyle = (cardName: string) => {
     return cardColors[cardName] || cardColors.default;
   };
 
   return (
     <Layout>
       <div className="space-y-6 animate-fade-in">
         {/* Header */}
         <div>
           <h1 className="text-2xl font-bold text-foreground">Cartões de Crédito</h1>
           <p className="text-muted-foreground mt-1">Acompanhe suas faturas de cartão</p>
         </div>
 
         {/* Summary */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-primary/10">
                   <CreditCard className="h-5 w-5 text-primary" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Total em Cartões</p>
                   <p className="text-xl font-bold text-foreground">{formatCurrency(totalCards.total)}</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-success/10">
                   <Check className="h-5 w-5 text-success" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Faturas Pagas</p>
                   <p className="text-xl font-bold text-success">{formatCurrency(totalCards.paid)}</p>
                 </div>
               </div>
             </CardContent>
           </Card>
           <Card>
             <CardContent className="pt-6">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-warning/10">
                   <Clock className="h-5 w-5 text-warning" />
                 </div>
                 <div>
                   <p className="text-sm text-muted-foreground">Faturas Pendentes</p>
                   <p className="text-xl font-bold text-warning">{formatCurrency(totalCards.pending)}</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         </div>
 
         {/* Cards Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {Object.entries(cardGroups).map(([cardName, cardBills]) => {
             const style = getCardStyle(cardName);
             const total = cardBills.reduce((sum, b) => sum + b.amount, 0);
             const isPaid = cardBills.every(b => b.isPaid);
             
             return (
               <Card key={cardName} className="overflow-hidden">
                 {/* Card Visual */}
                 <div className={cn("p-6 bg-gradient-to-br", style.bg)}>
                   <div className="flex justify-between items-start mb-8">
                     <div>
                       <p className={cn("text-sm opacity-80", style.text)}>Fatura do Mês</p>
                       <p className={cn("text-2xl font-bold mt-1", style.text)}>{formatCurrency(total)}</p>
                     </div>
                     <Badge variant={isPaid ? "default" : "secondary"} className={cn(isPaid && "bg-success")}>
                       {isPaid ? 'Pago' : 'Pendente'}
                     </Badge>
                   </div>
                   <div className="flex justify-between items-end">
                     <div>
                       <p className={cn("text-lg font-semibold", style.text)}>{cardName}</p>
                       <p className={cn("text-xs opacity-70", style.text)}>•••• •••• •••• ••••</p>
                     </div>
                     <CreditCard className={cn("h-8 w-8 opacity-50", style.text)} />
                   </div>
                 </div>
                 
                 {/* Bill Details */}
                 <CardContent className="p-4">
                   <p className="text-sm font-medium text-muted-foreground mb-3">Compras neste cartão</p>
                   <div className="space-y-2">
                     {cardBills.map(bill => (
                       <div 
                         key={bill.id}
                         className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                       >
                         <div className="flex items-center gap-3">
                           <span className="text-xs text-muted-foreground w-6">Dia {bill.day}</span>
                           <span className={cn("font-medium", bill.isPaid && "line-through text-muted-foreground")}>
                             {bill.name}
                           </span>
                         </div>
                         <div className="flex items-center gap-3">
                           <span className={cn("font-semibold tabular-nums", bill.isPaid ? "text-success" : "text-foreground")}>
                             {formatCurrency(bill.amount)}
                           </span>
                           <Checkbox
                             checked={bill.isPaid}
                             onCheckedChange={() => togglePaid(bill.id)}
                             className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                 </CardContent>
               </Card>
             );
           })}
         </div>
 
         {Object.keys(cardGroups).length === 0 && (
           <Card className="p-12">
             <div className="text-center">
               <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
               <p className="text-muted-foreground">Nenhuma fatura de cartão cadastrada</p>
               <p className="text-sm text-muted-foreground mt-1">Adicione contas com a categoria "Cartão"</p>
             </div>
           </Card>
         )}
       </div>
     </Layout>
   );
 };
 
 export default CreditCards;