 import { useState, useMemo } from 'react';
 import { Layout } from '@/components/Layout';
 import { useBills } from '@/hooks/useBills';
 import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types/bill';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Checkbox } from '@/components/ui/checkbox';
 import { ChevronLeft, ChevronRight, Calendar, Check, Clock, AlertCircle } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 const Schedule = () => {
   const { bills, togglePaid } = useBills();
   const [currentMonth, setCurrentMonth] = useState(new Date());
   const [selectedDay, setSelectedDay] = useState<number | null>(null);
 
   const formatCurrency = (value: number) => {
     return new Intl.NumberFormat('pt-BR', {
       style: 'currency',
       currency: 'BRL',
     }).format(value);
   };
 
   const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
   const today = new Date();
   const currentDay = today.getDate();
   const isCurrentMonth = today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();
 
   const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
   const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
 
   const billsByDay = useMemo(() => {
     const result: Record<number, typeof bills> = {};
     bills.forEach(bill => {
       if (!result[bill.day]) {
         result[bill.day] = [];
       }
       result[bill.day].push(bill);
     });
     return result;
   }, [bills]);
 
   const selectedDayBills = selectedDay ? (billsByDay[selectedDay] || []) : [];
 
   const getDayStatus = (day: number) => {
     const dayBills = billsByDay[day];
     if (!dayBills || dayBills.length === 0) return null;
     
     const allPaid = dayBills.every(b => b.isPaid);
     const isOverdue = isCurrentMonth && day < currentDay && !allPaid;
     
     if (allPaid) return 'paid';
     if (isOverdue) return 'overdue';
     return 'pending';
   };
 
   const navigateMonth = (direction: number) => {
     setCurrentMonth(prev => {
       const newDate = new Date(prev);
       newDate.setMonth(newDate.getMonth() + direction);
       return newDate;
     });
     setSelectedDay(null);
   };
 
   const calendarDays = [];
   for (let i = 0; i < firstDayOfMonth; i++) {
     calendarDays.push(null);
   }
   for (let day = 1; day <= daysInMonth; day++) {
     calendarDays.push(day);
   }
 
   const upcomingBills = useMemo(() => {
     if (!isCurrentMonth) return [];
     return bills
       .filter(bill => !bill.isPaid && bill.day >= currentDay)
       .sort((a, b) => a.day - b.day)
       .slice(0, 5);
   }, [bills, isCurrentMonth, currentDay]);
 
   return (
     <Layout>
       <div className="space-y-6 animate-fade-in">
         {/* Header */}
         <div>
           <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
           <p className="text-muted-foreground mt-1">Visualize seus vencimentos no calendário</p>
         </div>
 
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Calendar */}
           <Card className="lg:col-span-2">
             <CardHeader className="pb-4">
               <div className="flex items-center justify-between">
                 <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
                   <ChevronLeft className="h-5 w-5" />
                 </Button>
                 <CardTitle className="text-lg capitalize">{monthName}</CardTitle>
                 <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
                   <ChevronRight className="h-5 w-5" />
                 </Button>
               </div>
             </CardHeader>
             <CardContent>
               {/* Weekday headers */}
               <div className="grid grid-cols-7 gap-1 mb-2">
                 {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                   <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                     {day}
                   </div>
                 ))}
               </div>
               
               {/* Calendar grid */}
               <div className="grid grid-cols-7 gap-1">
                 {calendarDays.map((day, index) => {
                   if (day === null) {
                     return <div key={`empty-${index}`} className="aspect-square" />;
                   }
                   
                   const status = getDayStatus(day);
                   const hasBills = billsByDay[day]?.length > 0;
                   const isToday = isCurrentMonth && day === currentDay;
                   const isSelected = selectedDay === day;
                   
                   return (
                     <button
                       key={day}
                       onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                       className={cn(
                         "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative",
                         isToday && "ring-2 ring-primary ring-offset-2",
                         isSelected && "bg-primary text-primary-foreground",
                         !isSelected && hasBills && "bg-secondary hover:bg-secondary/80",
                         !isSelected && !hasBills && "hover:bg-secondary/50"
                       )}
                     >
                       <span className={cn("font-medium", isSelected ? "text-primary-foreground" : "text-foreground")}>
                         {day}
                       </span>
                       {status && !isSelected && (
                         <div className={cn(
                           "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                           status === 'paid' && "bg-success",
                           status === 'pending' && "bg-warning",
                           status === 'overdue' && "bg-destructive"
                         )} />
                       )}
                     </button>
                   );
                 })}
               </div>
 
               {/* Legend */}
               <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <div className="w-2 h-2 rounded-full bg-success" />
                   <span>Pago</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <div className="w-2 h-2 rounded-full bg-warning" />
                   <span>Pendente</span>
                 </div>
                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <div className="w-2 h-2 rounded-full bg-destructive" />
                   <span>Atrasado</span>
                 </div>
               </div>
             </CardContent>
           </Card>
 
           {/* Sidebar */}
           <div className="space-y-4">
             {/* Selected Day */}
             {selectedDay && (
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle className="text-base flex items-center gap-2">
                     <Calendar className="h-4 w-4" />
                     Dia {selectedDay}
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   {selectedDayBills.length > 0 ? (
                     <div className="space-y-2">
                       {selectedDayBills.map(bill => (
                         <div
                           key={bill.id}
                           className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                         >
                           <div className="flex items-center gap-3">
                             <div 
                               className="w-2 h-2 rounded-full" 
                               style={{ backgroundColor: CATEGORY_COLORS[bill.category] }}
                             />
                             <div>
                               <p className={cn("font-medium text-sm", bill.isPaid && "line-through text-muted-foreground")}>
                                 {bill.name}
                               </p>
                               <p className="text-xs text-muted-foreground">{CATEGORY_LABELS[bill.category]}</p>
                             </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <span className={cn("font-semibold text-sm", bill.isPaid ? "text-success" : "text-foreground")}>
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
                   ) : (
                     <p className="text-sm text-muted-foreground text-center py-4">
                       Nenhuma conta neste dia
                     </p>
                   )}
                 </CardContent>
               </Card>
             )}
 
             {/* Upcoming Bills */}
             <Card>
               <CardHeader className="pb-3">
                 <CardTitle className="text-base flex items-center gap-2">
                   <Clock className="h-4 w-4" />
                   Próximos Vencimentos
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 {upcomingBills.length > 0 ? (
                   <div className="space-y-2">
                     {upcomingBills.map(bill => (
                       <div
                         key={bill.id}
                         className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                       >
                         <div className="flex items-center gap-3">
                           <span className="text-xs font-medium text-muted-foreground w-8">
                             Dia {bill.day}
                           </span>
                           <span className="font-medium text-sm truncate max-w-[100px]">{bill.name}</span>
                         </div>
                         <span className="font-semibold text-sm text-foreground">
                           {formatCurrency(bill.amount)}
                         </span>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-sm text-muted-foreground text-center py-4">
                     Nenhum vencimento próximo
                   </p>
                 )}
               </CardContent>
             </Card>
           </div>
         </div>
       </div>
     </Layout>
   );
 };
 
 export default Schedule;