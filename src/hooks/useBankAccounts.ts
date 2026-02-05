 import { useState, useEffect, useCallback } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { BankAccount, Transaction, FinancialSummary } from '@/types/finance';
 import { toast } from 'sonner';
 
 export function useBankAccounts() {
   const [accounts, setAccounts] = useState<BankAccount[]>([]);
   const [transactions, setTransactions] = useState<Transaction[]>([]);
   const [isLoading, setIsLoading] = useState(true);
 
   // Load accounts
   const loadAccounts = useCallback(async () => {
     try {
       const { data, error } = await supabase
         .from('bank_accounts')
         .select('*')
         .eq('is_active', true)
         .order('created_at', { ascending: false });
 
       if (error) throw error;
       setAccounts((data || []) as BankAccount[]);
     } catch (error) {
       console.error('Error loading accounts:', error);
     }
   }, []);
 
   // Load transactions (last 90 days)
   const loadTransactions = useCallback(async () => {
     try {
       const ninetyDaysAgo = new Date();
       ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
 
       const { data, error } = await supabase
         .from('transactions')
         .select('*')
         .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
         .order('date', { ascending: false });
 
       if (error) throw error;
       setTransactions((data || []) as Transaction[]);
     } catch (error) {
       console.error('Error loading transactions:', error);
     }
   }, []);
 
   // Initial load
   useEffect(() => {
     Promise.all([loadAccounts(), loadTransactions()]).finally(() => {
       setIsLoading(false);
     });
   }, [loadAccounts, loadTransactions]);
 
   // Add account
   const addAccount = async (account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>) => {
     try {
       const { data, error } = await supabase
         .from('bank_accounts')
         .insert(account)
         .select()
         .single();
 
       if (error) throw error;
       setAccounts(prev => [data as BankAccount, ...prev]);
       toast.success('Conta adicionada!');
       return data as BankAccount;
     } catch (error) {
       console.error('Error adding account:', error);
       toast.error('Erro ao adicionar conta');
       throw error;
     }
   };
 
   // Update account
   const updateAccount = async (id: string, updates: Partial<BankAccount>) => {
     try {
       const { error } = await supabase
         .from('bank_accounts')
         .update(updates)
         .eq('id', id);
 
       if (error) throw error;
       setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
       toast.success('Conta atualizada!');
     } catch (error) {
       console.error('Error updating account:', error);
       toast.error('Erro ao atualizar conta');
     }
   };
 
   // Update balance
   const updateBalance = async (id: string, newBalance: number) => {
     try {
       const { error: updateError } = await supabase
         .from('bank_accounts')
         .update({ current_balance: newBalance, last_sync_at: new Date().toISOString() })
         .eq('id', id);
 
       if (updateError) throw updateError;
 
       // Record history
       await supabase.from('balance_history').upsert({
         bank_account_id: id,
         balance: newBalance,
         recorded_at: new Date().toISOString().split('T')[0],
       });
 
       setAccounts(prev => prev.map(a => a.id === id ? { ...a, current_balance: newBalance } : a));
       toast.success('Saldo atualizado!');
     } catch (error) {
       console.error('Error updating balance:', error);
       toast.error('Erro ao atualizar saldo');
     }
   };
 
   // Delete account
   const deleteAccount = async (id: string) => {
     try {
       const { error } = await supabase
         .from('bank_accounts')
         .update({ is_active: false })
         .eq('id', id);
 
       if (error) throw error;
       setAccounts(prev => prev.filter(a => a.id !== id));
       toast.success('Conta removida!');
     } catch (error) {
       console.error('Error deleting account:', error);
       toast.error('Erro ao remover conta');
     }
   };
 
   // Add transaction
  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> => {
     try {
       const { data, error } = await supabase
         .from('transactions')
        .insert([{
          user_id: transaction.user_id,
          bank_account_id: transaction.bank_account_id,
          transaction_type: transaction.transaction_type,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          date: transaction.date,
          is_recurring: transaction.is_recurring,
          imported_from: transaction.imported_from,
          external_id: transaction.external_id,
          metadata: transaction.metadata ? JSON.parse(JSON.stringify(transaction.metadata)) : null,
        }])
         .select()
         .single();
 
       if (error) throw error;
       setTransactions(prev => [data as Transaction, ...prev]);
 
       // Update account balance
       if (transaction.bank_account_id) {
         const account = accounts.find(a => a.id === transaction.bank_account_id);
         if (account) {
           const delta = transaction.transaction_type === 'income' ? transaction.amount : -transaction.amount;
           await updateBalance(account.id, account.current_balance + delta);
         }
       }
 
       toast.success('Transação adicionada!');
       return data as Transaction;
     } catch (error) {
       console.error('Error adding transaction:', error);
       toast.error('Erro ao adicionar transação');
       throw error;
     }
   };
 
   // Financial summary
   const summary: FinancialSummary = {
     totalBalance: accounts.reduce((sum, a) => 
       a.account_type === 'credit_card' ? sum : sum + a.current_balance, 0),
     totalIncome: transactions
       .filter(t => t.transaction_type === 'income')
       .reduce((sum, t) => sum + t.amount, 0),
     totalExpenses: transactions
       .filter(t => t.transaction_type === 'expense')
       .reduce((sum, t) => sum + t.amount, 0),
     netCashflow: 0,
     accountBreakdown: accounts.map(a => ({ account: a, balance: a.current_balance })),
     categoryBreakdown: [],
     projectedBalance: 0,
   };
 
   summary.netCashflow = summary.totalIncome - summary.totalExpenses;
 
   // Category breakdown
   const categoryTotals: Record<string, number> = {};
   transactions
     .filter(t => t.transaction_type === 'expense')
     .forEach(t => {
       const cat = t.category || 'Outros';
       categoryTotals[cat] = (categoryTotals[cat] || 0) + t.amount;
     });
 
   summary.categoryBreakdown = Object.entries(categoryTotals)
     .map(([category, amount]) => ({
       category,
       amount,
       percentage: summary.totalExpenses > 0 ? (amount / summary.totalExpenses) * 100 : 0,
     }))
     .sort((a, b) => b.amount - a.amount);
 
   return {
     accounts,
     transactions,
     summary,
     isLoading,
     addAccount,
     updateAccount,
     updateBalance,
     deleteAccount,
     addTransaction,
     refresh: () => Promise.all([loadAccounts(), loadTransactions()]),
   };
 }