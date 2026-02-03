import { useState, useEffect, useMemo } from 'react';
import { Bill, BillCategory, CategorySummary, CATEGORY_COLORS } from '@/types/bill';
import { initialBills } from '@/data/initialBills';

const STORAGE_KEY = 'bills-data';

export function useBills() {
  const [bills, setBills] = useState<Bill[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialBills;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  }, [bills]);

  const togglePaid = (id: string) => {
    setBills(prev => 
      prev.map(bill => 
        bill.id === id ? { ...bill, isPaid: !bill.isPaid } : bill
      )
    );
  };

  const addBill = (bill: Omit<Bill, 'id'>) => {
    const newBill: Bill = {
      ...bill,
      id: Date.now().toString(),
    };
    setBills(prev => [...prev, newBill].sort((a, b) => a.day - b.day));
  };

  const deleteBill = (id: string) => {
    setBills(prev => prev.filter(bill => bill.id !== id));
  };

  const updateBill = (id: string, updates: Partial<Omit<Bill, 'id'>>) => {
    setBills(prev =>
      prev.map(bill =>
        bill.id === id ? { ...bill, ...updates } : bill
      ).sort((a, b) => a.day - b.day)
    );
  };

  const totals = useMemo(() => {
    const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
    const paid = bills.reduce((sum, bill) => bill.isPaid ? sum + bill.amount : sum, 0);
    const pending = total - paid;
    const progress = total > 0 ? (paid / total) * 100 : 0;
    return { total, paid, pending, progress };
  }, [bills]);

  const categorySummary = useMemo((): CategorySummary[] => {
    const summary: Record<BillCategory, number> = {
      CARTAO: 0,
      ALUGUEL: 0,
      CASA: 0,
      INVESTIMENTO: 0,
      CONVENIO: 0,
      ESCOLA: 0,
      OUTROS: 0,
    };

    bills.forEach(bill => {
      summary[bill.category] += bill.amount;
    });

    return Object.entries(summary)
      .filter(([_, total]) => total > 0)
      .map(([category, total]) => ({
        category: category as BillCategory,
        total,
        color: CATEGORY_COLORS[category as BillCategory],
      }))
      .sort((a, b) => b.total - a.total);
  }, [bills]);

  return {
    bills,
    togglePaid,
    addBill,
    deleteBill,
    updateBill,
    totals,
    categorySummary,
  };
}
