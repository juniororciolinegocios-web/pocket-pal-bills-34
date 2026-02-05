 export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash' | 'digital_wallet';
 export type TransactionType = 'income' | 'expense' | 'transfer';
 
 export interface BankAccount {
   id: string;
   user_id?: string;
   name: string;
   account_type: AccountType;
   institution?: string;
   current_balance: number;
   credit_limit?: number;
   color: string;
   icon: string;
   is_active: boolean;
   last_sync_at?: string;
   created_at: string;
   updated_at: string;
 }
 
 export interface Transaction {
   id: string;
   user_id?: string;
   bank_account_id?: string;
   transaction_type: TransactionType;
   amount: number;
   description: string;
   category?: string;
   date: string;
   is_recurring: boolean;
   imported_from?: string;
   external_id?: string;
   metadata?: Record<string, unknown>;
   created_at: string;
 }
 
 export interface BalanceHistory {
   id: string;
   bank_account_id: string;
   balance: number;
   recorded_at: string;
 }
 
 export interface StatementImport {
   id: string;
   bank_account_id?: string;
   file_name: string;
   file_type: 'ofx' | 'csv' | 'image';
   status: 'pending' | 'processing' | 'completed' | 'failed';
   transactions_count: number;
   error_message?: string;
   created_at: string;
 }
 
 export interface FinancialSummary {
   totalBalance: number;
   totalIncome: number;
   totalExpenses: number;
   netCashflow: number;
   accountBreakdown: { account: BankAccount; balance: number }[];
   categoryBreakdown: { category: string; amount: number; percentage: number }[];
   projectedBalance: number;
 }
 
 export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
   checking: 'Conta Corrente',
   savings: 'Poupança',
   credit_card: 'Cartão de Crédito',
   investment: 'Investimentos',
   cash: 'Dinheiro',
   digital_wallet: 'Carteira Digital',
 };
 
 export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
   checking: 'building-2',
   savings: 'piggy-bank',
   credit_card: 'credit-card',
   investment: 'trending-up',
   cash: 'banknote',
   digital_wallet: 'smartphone',
 };