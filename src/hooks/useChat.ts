 import { useState, useCallback } from 'react';
 import { Bill, BillCategory } from '@/types/bill';
 import { toast } from '@/hooks/use-toast';
 
 interface Message {
   role: 'user' | 'assistant';
   content: string;
 }
 
 interface ToolCall {
   name: string;
   arguments: Record<string, unknown>;
 }
 
 interface FinancialContext {
   total: number;
   paid: number;
   pending: number;
   progress: number;
   bills: Bill[];
 }
 
 interface UseChatOptions {
   financialContext: FinancialContext;
   onAddBill: (bill: Omit<Bill, 'id'>) => void;
   onTogglePaid: (id: string) => void;
   bills: Bill[];
 }
 
 const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
 
 export function useChat({ financialContext, onAddBill, onTogglePaid, bills }: UseChatOptions) {
   const [messages, setMessages] = useState<Message[]>([]);
   const [isLoading, setIsLoading] = useState(false);
 
   const processToolCalls = useCallback((toolCalls: ToolCall[]) => {
     const results: string[] = [];
     
     for (const call of toolCalls) {
       switch (call.name) {
         case 'add_bill': {
           const args = call.arguments as { name: string; amount: number; day: number; category: BillCategory };
           onAddBill({
             name: args.name,
             amount: args.amount,
             day: args.day,
             category: args.category,
             isPaid: false,
           });
           toast({
             title: "Conta adicionada!",
             description: `${args.name} - R$ ${args.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
           });
           results.push(`Conta "${args.name}" adicionada com sucesso!`);
           break;
         }
         case 'get_summary': {
           results.push(`Resumo: Total R$ ${financialContext.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, Pago R$ ${financialContext.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}, Pendente R$ ${financialContext.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
           break;
         }
         case 'list_bills': {
           const args = call.arguments as { category?: BillCategory; status?: 'paid' | 'pending' };
           let filtered = [...bills];
           if (args.category) {
             filtered = filtered.filter(b => b.category === args.category);
           }
           if (args.status) {
             filtered = filtered.filter(b => args.status === 'paid' ? b.isPaid : !b.isPaid);
           }
           results.push(`Encontradas ${filtered.length} contas`);
           break;
         }
         case 'mark_paid': {
           const args = call.arguments as { bill_name: string };
           const bill = bills.find(b => 
             b.name.toLowerCase().includes(args.bill_name.toLowerCase())
           );
           if (bill && !bill.isPaid) {
             onTogglePaid(bill.id);
             toast({
               title: "Conta marcada como paga!",
               description: bill.name,
             });
             results.push(`Conta "${bill.name}" marcada como paga!`);
           } else if (bill?.isPaid) {
             results.push(`A conta "${bill.name}" já está paga.`);
           } else {
             results.push(`Não encontrei uma conta com "${args.bill_name}".`);
           }
           break;
         }
       }
     }
     
     return results;
   }, [bills, financialContext, onAddBill, onTogglePaid]);
 
   const sendMessage = useCallback(async (input: string) => {
     if (!input.trim() || isLoading) return;
 
     const userMsg: Message = { role: 'user', content: input };
     setMessages(prev => [...prev, userMsg]);
     setIsLoading(true);
 
     let assistantContent = '';
     const toolCalls: ToolCall[] = [];
     let currentToolCall: { name: string; arguments: string } | null = null;
 
     const updateAssistant = (content: string) => {
       setMessages(prev => {
         const last = prev[prev.length - 1];
         if (last?.role === 'assistant') {
           return prev.map((m, i) => i === prev.length - 1 ? { ...m, content } : m);
         }
         return [...prev, { role: 'assistant', content }];
       });
     };
 
     try {
       const resp = await fetch(CHAT_URL, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
         },
         body: JSON.stringify({
           messages: [...messages, userMsg],
           financialContext,
         }),
       });
 
       if (!resp.ok) {
         const error = await resp.json();
         throw new Error(error.error || 'Erro ao enviar mensagem');
       }
 
       if (!resp.body) throw new Error('No response body');
 
       const reader = resp.body.getReader();
       const decoder = new TextDecoder();
       let buffer = '';
 
       while (true) {
         const { done, value } = await reader.read();
         if (done) break;
 
         buffer += decoder.decode(value, { stream: true });
 
         let newlineIndex: number;
         while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
           let line = buffer.slice(0, newlineIndex);
           buffer = buffer.slice(newlineIndex + 1);
 
           if (line.endsWith('\r')) line = line.slice(0, -1);
           if (line.startsWith(':') || line.trim() === '') continue;
           if (!line.startsWith('data: ')) continue;
 
           const jsonStr = line.slice(6).trim();
           if (jsonStr === '[DONE]') break;
 
           try {
             const parsed = JSON.parse(jsonStr);
             const delta = parsed.choices?.[0]?.delta;
 
             if (delta?.content) {
               assistantContent += delta.content;
               updateAssistant(assistantContent);
             }
 
             // Handle tool calls
             if (delta?.tool_calls) {
               for (const tc of delta.tool_calls) {
                 if (tc.function?.name) {
                   currentToolCall = { name: tc.function.name, arguments: '' };
                 }
                 if (tc.function?.arguments && currentToolCall) {
                   currentToolCall.arguments += tc.function.arguments;
                 }
               }
             }
 
             // Check if tool call is complete
             if (parsed.choices?.[0]?.finish_reason === 'tool_calls' && currentToolCall) {
               try {
                 const args = JSON.parse(currentToolCall.arguments);
                 toolCalls.push({ name: currentToolCall.name, arguments: args });
               } catch {
                 console.error('Failed to parse tool arguments');
               }
               currentToolCall = null;
             }
           } catch {
             buffer = line + '\n' + buffer;
             break;
           }
         }
       }
 
       // Process any tool calls
       if (toolCalls.length > 0) {
         processToolCalls(toolCalls);
       }
 
     } catch (error) {
       console.error('Chat error:', error);
       toast({
         title: "Erro",
         description: error instanceof Error ? error.message : "Erro ao enviar mensagem",
         variant: "destructive",
       });
       setMessages(prev => prev.filter(m => m !== userMsg));
     } finally {
       setIsLoading(false);
     }
   }, [messages, isLoading, financialContext, processToolCalls]);
 
   const clearMessages = useCallback(() => {
     setMessages([]);
   }, []);
 
   return {
     messages,
     isLoading,
     sendMessage,
     clearMessages,
   };
 }