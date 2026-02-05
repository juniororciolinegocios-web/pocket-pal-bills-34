 import { ReactNode, useState, createContext, useContext } from 'react';
 import { Header } from '@/components/Header';
 import { AddBillDialog } from '@/components/AddBillDialog';
 import { ChatAssistant } from '@/components/ChatAssistant';
 import { useBills } from '@/hooks/useBills';
 
 interface LayoutProps {
   children: ReactNode;
 }
 
 interface BillsContextType {
   bills: ReturnType<typeof useBills>['bills'];
   totals: ReturnType<typeof useBills>['totals'];
   togglePaid: ReturnType<typeof useBills>['togglePaid'];
   addBill: ReturnType<typeof useBills>['addBill'];
   deleteBill: ReturnType<typeof useBills>['deleteBill'];
   updateBill: ReturnType<typeof useBills>['updateBill'];
   categorySummary: ReturnType<typeof useBills>['categorySummary'];
 }
 
 const BillsContext = createContext<BillsContextType | null>(null);
 
 export function useBillsContext() {
   const context = useContext(BillsContext);
   if (!context) {
     throw new Error('useBillsContext must be used within a Layout');
   }
   return context;
 }
 
 export function Layout({ children }: LayoutProps) {
   const billsData = useBills();
   const { addBill, bills, totals, togglePaid } = billsData;
   const [addDialogOpen, setAddDialogOpen] = useState(false);
 
   return (
     <BillsContext.Provider value={billsData}>
       <div className="min-h-screen bg-background">
         <Header onAddBill={() => setAddDialogOpen(true)} />
         <main className="container mx-auto px-4 py-6 max-w-7xl">
           {children}
         </main>
         <AddBillDialog 
           open={addDialogOpen} 
           onOpenChange={setAddDialogOpen} 
           onAddBill={addBill} 
         />
         <ChatAssistant
           bills={bills}
           totals={totals}
           onAddBill={addBill}
           onTogglePaid={togglePaid}
         />
       </div>
     </BillsContext.Provider>
   );
 }