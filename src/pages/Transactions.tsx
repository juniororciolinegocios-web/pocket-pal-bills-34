 import { useState, useMemo } from 'react';
 import { Layout } from '@/components/Layout';
 import { useBills } from '@/hooks/useBills';
 import { Bill, CATEGORY_LABELS, BillCategory } from '@/types/bill';
 import { Input } from '@/components/ui/input';
 import { Button } from '@/components/ui/button';
 import { Checkbox } from '@/components/ui/checkbox';
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from '@/components/ui/select';
 import { Search, ArrowUpDown, Trash2, Check, X } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 type SortField = 'day' | 'name' | 'amount';
 type SortOrder = 'asc' | 'desc';
 type StatusFilter = 'all' | 'paid' | 'pending';
 
 const Transactions = () => {
   const { bills, togglePaid, deleteBill } = useBills();
   const [search, setSearch] = useState('');
   const [categoryFilter, setCategoryFilter] = useState<BillCategory | 'all'>('all');
   const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
   const [sortField, setSortField] = useState<SortField>('day');
   const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
 
   const formatCurrency = (value: number) => {
     return new Intl.NumberFormat('pt-BR', {
       style: 'currency',
       currency: 'BRL',
     }).format(value);
   };
 
   const filteredAndSortedBills = useMemo(() => {
     let result = [...bills];
 
     // Search filter
     if (search) {
       result = result.filter(bill =>
         bill.name.toLowerCase().includes(search.toLowerCase())
       );
     }
 
     // Category filter
     if (categoryFilter !== 'all') {
       result = result.filter(bill => bill.category === categoryFilter);
     }
 
     // Status filter
     if (statusFilter === 'paid') {
       result = result.filter(bill => bill.isPaid);
     } else if (statusFilter === 'pending') {
       result = result.filter(bill => !bill.isPaid);
     }
 
     // Sort
     result.sort((a, b) => {
       let comparison = 0;
       if (sortField === 'day') {
         comparison = a.day - b.day;
       } else if (sortField === 'name') {
         comparison = a.name.localeCompare(b.name);
       } else if (sortField === 'amount') {
         comparison = a.amount - b.amount;
       }
       return sortOrder === 'asc' ? comparison : -comparison;
     });
 
     return result;
   }, [bills, search, categoryFilter, statusFilter, sortField, sortOrder]);
 
   const toggleSort = (field: SortField) => {
     if (sortField === field) {
       setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
     } else {
       setSortField(field);
       setSortOrder('asc');
     }
   };
 
   const totals = useMemo(() => {
     const total = filteredAndSortedBills.reduce((sum, bill) => sum + bill.amount, 0);
     const paid = filteredAndSortedBills.filter(b => b.isPaid).reduce((sum, b) => sum + b.amount, 0);
     const pending = total - paid;
     return { total, paid, pending };
   }, [filteredAndSortedBills]);
 
   return (
     <Layout>
       <div className="space-y-6 animate-fade-in">
         {/* Header */}
         <div>
           <h1 className="text-2xl font-bold text-foreground">Transações</h1>
           <p className="text-muted-foreground mt-1">Gerencie todas as suas contas em um só lugar</p>
         </div>
 
         {/* Filters */}
         <div className="bg-card rounded-xl p-4 border border-border">
           <div className="flex flex-col sm:flex-row gap-4">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="Buscar por nome..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="pl-10"
               />
             </div>
             <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as BillCategory | 'all')}>
               <SelectTrigger className="w-full sm:w-44">
                 <SelectValue placeholder="Categoria" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">Todas categorias</SelectItem>
                 {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                   <SelectItem key={key} value={key}>{label}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
               <SelectTrigger className="w-full sm:w-36">
                 <SelectValue placeholder="Status" />
               </SelectTrigger>
               <SelectContent>
                 <SelectItem value="all">Todos</SelectItem>
                 <SelectItem value="paid">Pagos</SelectItem>
                 <SelectItem value="pending">Pendentes</SelectItem>
               </SelectContent>
             </Select>
           </div>
         </div>
 
         {/* Summary Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <div className="bg-card rounded-xl p-4 border border-border">
             <p className="text-sm text-muted-foreground">Total Filtrado</p>
             <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(totals.total)}</p>
           </div>
           <div className="bg-card rounded-xl p-4 border border-border">
             <p className="text-sm text-muted-foreground">Pago</p>
             <p className="text-2xl font-bold text-success mt-1">{formatCurrency(totals.paid)}</p>
           </div>
           <div className="bg-card rounded-xl p-4 border border-border">
             <p className="text-sm text-muted-foreground">Pendente</p>
             <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(totals.pending)}</p>
           </div>
         </div>
 
         {/* Table */}
         <div className="bg-card rounded-xl border border-border overflow-hidden">
           <div className="overflow-x-auto">
             <table className="w-full">
               <thead>
                 <tr className="border-b border-border bg-secondary/50">
                   <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12">
                     <button onClick={() => toggleSort('day')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                       Dia
                       <ArrowUpDown className="h-3 w-3" />
                     </button>
                   </th>
                   <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                     <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                       Nome
                       <ArrowUpDown className="h-3 w-3" />
                     </button>
                   </th>
                   <th className="text-left p-4 text-sm font-medium text-muted-foreground">Categoria</th>
                   <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                     <button onClick={() => toggleSort('amount')} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                       Valor
                       <ArrowUpDown className="h-3 w-3" />
                     </button>
                   </th>
                   <th className="text-center p-4 text-sm font-medium text-muted-foreground w-24">Status</th>
                   <th className="text-right p-4 text-sm font-medium text-muted-foreground w-20">Ações</th>
                 </tr>
               </thead>
               <tbody>
                 {filteredAndSortedBills.map((bill, index) => (
                   <tr 
                     key={bill.id} 
                     className={cn(
                       "border-b border-border/50 hover:bg-secondary/30 transition-colors",
                       index === filteredAndSortedBills.length - 1 && "border-b-0"
                     )}
                   >
                     <td className="p-4">
                       <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-medium">
                         {bill.day}
                       </span>
                     </td>
                     <td className="p-4">
                       <span className={cn("font-medium", bill.isPaid && "text-muted-foreground line-through")}>
                         {bill.name}
                       </span>
                     </td>
                     <td className="p-4">
                       <span className="text-sm text-muted-foreground">{CATEGORY_LABELS[bill.category]}</span>
                     </td>
                     <td className="p-4 text-right">
                       <span className={cn("font-semibold tabular-nums", bill.isPaid ? "text-success" : "text-foreground")}>
                         {formatCurrency(bill.amount)}
                       </span>
                     </td>
                     <td className="p-4">
                       <div className="flex justify-center">
                         <Checkbox
                           checked={bill.isPaid}
                           onCheckedChange={() => togglePaid(bill.id)}
                           className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                         />
                       </div>
                     </td>
                     <td className="p-4">
                       <div className="flex justify-end">
                         <Button
                           variant="ghost"
                           size="icon"
                           className="h-8 w-8 text-muted-foreground hover:text-destructive"
                           onClick={() => deleteBill(bill.id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           {filteredAndSortedBills.length === 0 && (
             <div className="p-12 text-center">
               <p className="text-muted-foreground">Nenhuma transação encontrada</p>
             </div>
           )}
         </div>
       </div>
     </Layout>
   );
 };
 
 export default Transactions;