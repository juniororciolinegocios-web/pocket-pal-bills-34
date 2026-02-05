 import { useState, KeyboardEvent } from 'react';
 import { Button } from '@/components/ui/button';
 import { Textarea } from '@/components/ui/textarea';
 import { Send } from 'lucide-react';
 
 interface ChatInputProps {
   onSend: (message: string) => void;
   isLoading: boolean;
   placeholder?: string;
 }
 
 export function ChatInput({ onSend, isLoading, placeholder = "Digite sua mensagem..." }: ChatInputProps) {
   const [input, setInput] = useState('');
 
   const handleSend = () => {
     if (input.trim() && !isLoading) {
       onSend(input.trim());
       setInput('');
     }
   };
 
   const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
     if (e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       handleSend();
     }
   };
 
   return (
     <div className="flex gap-2 p-4 border-t bg-background">
       <Textarea
         value={input}
         onChange={(e) => setInput(e.target.value)}
         onKeyDown={handleKeyDown}
         placeholder={placeholder}
         disabled={isLoading}
         className="min-h-[44px] max-h-32 resize-none"
         rows={1}
       />
       <Button 
         onClick={handleSend} 
         disabled={!input.trim() || isLoading}
         size="icon"
         className="shrink-0"
       >
         <Send className="h-4 w-4" />
       </Button>
     </div>
   );
 }