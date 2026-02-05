 import { ReactNode, useState } from 'react';
 import { Header } from '@/components/Header';
 import { AddBillDialog } from '@/components/AddBillDialog';
 import { useBills } from '@/hooks/useBills';
 
 interface LayoutProps {
   children: ReactNode;
 }
 
 export function Layout({ children }: LayoutProps) {
   const { addBill } = useBills();
   const [addDialogOpen, setAddDialogOpen] = useState(false);
 
   return (
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
     </div>
   );
 }