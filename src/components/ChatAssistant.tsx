import { useState, useRef, useEffect, forwardRef } from 'react';
import { MessageCircle, X, Trash2, Sparkles, Bell, AlertTriangle, PartyPopper, TrendingUp, CreditCard } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
 import { ChatMessage } from '@/components/ChatMessage';
 import { ChatInput } from '@/components/ChatInput';
 import { useChat } from '@/hooks/useChat';
 import { Bill } from '@/types/bill';
 import { cn } from '@/lib/utils';
 
 interface ChatAssistantProps {
   bills: Bill[];
   totals: {
     total: number;
     paid: number;
     pending: number;
     progress: number;
   };
   onAddBill: (bill: Omit<Bill, 'id'>) => void;
   onTogglePaid: (id: string) => void;
 }
 
 const SUGGESTIONS = [
   "Quanto ainda falta pagar?",
   "Quais contas de cartão tenho?",
   "Lista as contas pendentes",
 ];

const alertIcons = {
  urgent: AlertTriangle,
  reminder: TrendingUp,
  celebration: PartyPopper,
  pattern: CreditCard,
};

const alertStyles = {
  urgent: 'bg-destructive/10 border-destructive/30 text-destructive',
  reminder: 'bg-primary/10 border-primary/30 text-primary',
  celebration: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600',
  pattern: 'bg-amber-500/10 border-amber-500/30 text-amber-600',
};
 
 export function ChatAssistant({ bills, totals, onAddBill, onTogglePaid }: ChatAssistantProps) {
   const [isOpen, setIsOpen] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);
 
  const { messages, isLoading, sendMessage, clearMessages, alerts, dismissAlert } = useChat({
     financialContext: { ...totals, bills },
     onAddBill,
     onTogglePaid,
     bills,
   });

  const activeAlerts = alerts.filter(a => !a.dismissed);
 
   // Auto-scroll to bottom when new messages arrive
   useEffect(() => {
     if (scrollRef.current) {
       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
   }, [messages]);
 
   return (
     <>
       {/* Floating Button */}
       <Button
         onClick={() => setIsOpen(true)}
         className={cn(
           "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
           "bg-primary hover:bg-primary/90 transition-transform hover:scale-105",
           isOpen && "hidden"
         )}
         size="icon"
       >
         <MessageCircle className="h-6 w-6" />
       </Button>
 
       {/* Chat Panel */}
       <Card className={cn(
         "fixed bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] z-50",
         "flex flex-col shadow-2xl transition-all duration-300",
         isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
       )}>
         {/* Header */}
         <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
           <div className="flex items-center gap-2">
             <Sparkles className="h-5 w-5" />
             <span className="font-semibold">Assistente Financeiro</span>
              {activeAlerts.length > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground text-primary text-xs font-bold">
                  {activeAlerts.length}
                </span>
              )}
           </div>
           <div className="flex items-center gap-1">
             <Button
               variant="ghost"
               size="icon"
               onClick={clearMessages}
               className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
               title="Limpar conversa"
             >
               <Trash2 className="h-4 w-4" />
             </Button>
             <Button
               variant="ghost"
               size="icon"
               onClick={() => setIsOpen(false)}
               className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
             >
               <X className="h-4 w-4" />
             </Button>
           </div>
         </div>
 
          {/* Smart Alerts */}
          {activeAlerts.length > 0 && (
            <div className="p-3 border-b space-y-2">
              {activeAlerts.map((alert) => {
                const Icon = alertIcons[alert.type];
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded-lg border text-xs",
                      alertStyles[alert.type]
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0 mt-0.5" />
                    <span className="flex-1">{alert.message}</span>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

         {/* Messages */}
          <ScrollArea className="flex-1">
            <div ref={scrollRef}>
           {messages.length === 0 ? (
             <div className="p-6 space-y-4">
               <div className="text-center text-muted-foreground">
                 <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                 <p className="text-sm">
                   Olá! Sou seu assistente financeiro. Posso ajudar você a:
                 </p>
                 <ul className="text-sm mt-2 space-y-1">
                   <li>• Adicionar novas contas</li>
                   <li>• Ver resumos financeiros</li>
                   <li>• Listar contas por categoria</li>
                   <li>• Marcar contas como pagas</li>
                 </ul>
               </div>
               <div className="space-y-2">
                 <p className="text-xs text-muted-foreground text-center">Sugestões:</p>
                 <div className="flex flex-wrap gap-2 justify-center">
                   {SUGGESTIONS.map((suggestion) => (
                     <Button
                       key={suggestion}
                       variant="outline"
                       size="sm"
                       onClick={() => sendMessage(suggestion)}
                       className="text-xs"
                     >
                       {suggestion}
                     </Button>
                   ))}
                 </div>
               </div>
             </div>
           ) : (
             <div>
               {messages.map((msg, i) => (
                 <ChatMessage key={i} role={msg.role} content={msg.content} />
               ))}
               {isLoading && messages[messages.length - 1]?.role === 'user' && (
                 <div className="flex gap-3 p-4">
                   <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                     <Sparkles className="h-4 w-4 animate-pulse" />
                   </div>
                   <div className="flex items-center">
                     <span className="text-sm text-muted-foreground">Pensando...</span>
                   </div>
                 </div>
               )}
             </div>
           )}
            </div>
         </ScrollArea>
 
         {/* Input */}
         <ChatInput
           onSend={sendMessage}
           isLoading={isLoading}
           placeholder="Ex: Adiciona conta de luz de R$150 dia 15"
         />
       </Card>
     </>
   );
 }