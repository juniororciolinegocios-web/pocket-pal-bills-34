 import { useState, useRef, useEffect } from 'react';
 import { MessageCircle, X, Trash2, Sparkles } from 'lucide-react';
 import { Button } from '@/components/ui/button';
 import { Card } from '@/components/ui/card';
 import { ScrollArea } from '@/components/ui/scroll-area';
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
 
 export function ChatAssistant({ bills, totals, onAddBill, onTogglePaid }: ChatAssistantProps) {
   const [isOpen, setIsOpen] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);
 
   const { messages, isLoading, sendMessage, clearMessages } = useChat({
     financialContext: { ...totals, bills },
     onAddBill,
     onTogglePaid,
     bills,
   });
 
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
 
         {/* Messages */}
         <ScrollArea className="flex-1" ref={scrollRef}>
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