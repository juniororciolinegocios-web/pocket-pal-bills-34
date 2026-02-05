 import { useState } from 'react';
 import { Plus, Wallet, Building2, PiggyBank, CreditCard, TrendingUp, Banknote, Smartphone, MoreVertical, Pencil, Trash2 } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { BankAccount, AccountType, ACCOUNT_TYPE_LABELS } from '@/types/finance';
 import { cn } from '@/lib/utils';
 
 const accountIcons: Record<AccountType, React.ReactNode> = {
   checking: <Building2 className="w-5 h-5" />,
   savings: <PiggyBank className="w-5 h-5" />,
   credit_card: <CreditCard className="w-5 h-5" />,
   investment: <TrendingUp className="w-5 h-5" />,
   cash: <Banknote className="w-5 h-5" />,
   digital_wallet: <Smartphone className="w-5 h-5" />,
 };
 
 interface BankAccountsCardProps {
   accounts: BankAccount[];
   totalBalance: number;
  onAddAccount: (account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>) => Promise<BankAccount | void>;
   onUpdateBalance: (id: string, balance: number) => Promise<void>;
   onDeleteAccount: (id: string) => Promise<void>;
 }
 
 export function BankAccountsCard({
   accounts,
   totalBalance,
   onAddAccount,
   onUpdateBalance,
   onDeleteAccount,
 }: BankAccountsCardProps) {
   const [isAddOpen, setIsAddOpen] = useState(false);
   const [editingBalance, setEditingBalance] = useState<string | null>(null);
   const [newBalance, setNewBalance] = useState('');
   
   // Form state
   const [formData, setFormData] = useState({
     name: '',
     account_type: 'checking' as AccountType,
     institution: '',
     current_balance: '',
     credit_limit: '',
     color: '#10b981',
   });
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     await onAddAccount({
       name: formData.name,
       account_type: formData.account_type,
       institution: formData.institution || undefined,
       current_balance: parseFloat(formData.current_balance) || 0,
       credit_limit: formData.credit_limit ? parseFloat(formData.credit_limit) : undefined,
       color: formData.color,
       icon: 'wallet',
       is_active: true,
     });
     setFormData({
       name: '',
       account_type: 'checking',
       institution: '',
       current_balance: '',
       credit_limit: '',
       color: '#10b981',
     });
     setIsAddOpen(false);
   };
 
   const handleBalanceUpdate = async (id: string) => {
     const balance = parseFloat(newBalance);
     if (!isNaN(balance)) {
       await onUpdateBalance(id, balance);
     }
     setEditingBalance(null);
     setNewBalance('');
   };
 
   return (
     <Card>
       <CardHeader className="pb-3">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-2">
             <Wallet className="w-5 h-5 text-primary" />
             <CardTitle className="text-base">Minhas Contas</CardTitle>
           </div>
           <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
             <DialogTrigger asChild>
               <Button size="sm" variant="outline" className="h-8">
                 <Plus className="w-4 h-4 mr-1" />
                 Adicionar
               </Button>
             </DialogTrigger>
             <DialogContent>
               <DialogHeader>
                 <DialogTitle>Nova Conta</DialogTitle>
               </DialogHeader>
               <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="space-y-2">
                   <Label>Nome da conta</Label>
                   <Input
                     value={formData.name}
                     onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                     placeholder="Ex: Nubank, Itaú, Carteira"
                     required
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Tipo</Label>
                     <Select
                       value={formData.account_type}
                       onValueChange={(v) => setFormData(p => ({ ...p, account_type: v as AccountType }))}
                     >
                       <SelectTrigger>
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                           <SelectItem key={value} value={value}>{label}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                   <div className="space-y-2">
                     <Label>Instituição</Label>
                     <Input
                       value={formData.institution}
                       onChange={(e) => setFormData(p => ({ ...p, institution: e.target.value }))}
                       placeholder="Ex: Banco do Brasil"
                     />
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label>Saldo atual</Label>
                     <Input
                       type="number"
                       step="0.01"
                       value={formData.current_balance}
                       onChange={(e) => setFormData(p => ({ ...p, current_balance: e.target.value }))}
                       placeholder="0,00"
                     />
                   </div>
                   {formData.account_type === 'credit_card' && (
                     <div className="space-y-2">
                       <Label>Limite</Label>
                       <Input
                         type="number"
                         step="0.01"
                         value={formData.credit_limit}
                         onChange={(e) => setFormData(p => ({ ...p, credit_limit: e.target.value }))}
                         placeholder="5000,00"
                       />
                     </div>
                   )}
                 </div>
                 <div className="space-y-2">
                   <Label>Cor</Label>
                   <div className="flex gap-2">
                     {['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280'].map(color => (
                       <button
                         key={color}
                         type="button"
                         className={cn(
                           "w-8 h-8 rounded-full border-2 transition-transform",
                           formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                         )}
                         style={{ backgroundColor: color }}
                         onClick={() => setFormData(p => ({ ...p, color }))}
                       />
                     ))}
                   </div>
                 </div>
                 <Button type="submit" className="w-full">Adicionar Conta</Button>
               </form>
             </DialogContent>
           </Dialog>
         </div>
         <div className="mt-2">
           <p className="text-xs text-muted-foreground">Saldo total</p>
           <p className={cn(
             "text-2xl font-bold",
             totalBalance >= 0 ? 'text-primary' : 'text-destructive'
           )}>
             R$ {totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
           </p>
         </div>
       </CardHeader>
       <CardContent className="space-y-2">
         {accounts.length === 0 ? (
           <div className="text-center py-6 text-muted-foreground">
             <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
             <p className="text-sm">Nenhuma conta cadastrada</p>
             <p className="text-xs">Adicione suas contas para começar</p>
           </div>
         ) : (
           accounts.map(account => (
             <div
               key={account.id}
               className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
             >
               <div className="flex items-center gap-3">
                 <div
                   className="p-2 rounded-lg"
                   style={{ backgroundColor: `${account.color}20`, color: account.color }}
                 >
                   {accountIcons[account.account_type]}
                 </div>
                 <div>
                   <p className="text-sm font-medium">{account.name}</p>
                   <p className="text-xs text-muted-foreground">
                     {ACCOUNT_TYPE_LABELS[account.account_type]}
                     {account.institution && ` • ${account.institution}`}
                   </p>
                 </div>
               </div>
               <div className="flex items-center gap-2">
                 {editingBalance === account.id ? (
                   <div className="flex items-center gap-1">
                     <Input
                       type="number"
                       step="0.01"
                       value={newBalance}
                       onChange={(e) => setNewBalance(e.target.value)}
                       className="w-24 h-8 text-sm"
                       autoFocus
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') handleBalanceUpdate(account.id);
                         if (e.key === 'Escape') setEditingBalance(null);
                       }}
                     />
                     <Button size="sm" variant="ghost" className="h-8" onClick={() => handleBalanceUpdate(account.id)}>
                       ✓
                     </Button>
                   </div>
                 ) : (
                   <>
                     <span className={cn(
                       "font-semibold",
                       account.current_balance >= 0 ? 'text-foreground' : 'text-destructive'
                     )}>
                       R$ {account.current_balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                     </span>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                           <MoreVertical className="w-4 h-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => {
                           setEditingBalance(account.id);
                           setNewBalance(account.current_balance.toString());
                         }}>
                           <Pencil className="w-4 h-4 mr-2" />
                           Atualizar saldo
                         </DropdownMenuItem>
                         <DropdownMenuItem 
                           onClick={() => onDeleteAccount(account.id)}
                           className="text-destructive"
                         >
                           <Trash2 className="w-4 h-4 mr-2" />
                           Remover
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </>
                 )}
               </div>
             </div>
           ))
         )}
       </CardContent>
     </Card>
   );
 }