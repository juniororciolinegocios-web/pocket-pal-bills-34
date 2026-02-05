 import ReactMarkdown from 'react-markdown';
 import { cn } from '@/lib/utils';
 import { User, Bot } from 'lucide-react';
 
 interface ChatMessageProps {
   role: 'user' | 'assistant';
   content: string;
 }
 
 export function ChatMessage({ role, content }: ChatMessageProps) {
   const isUser = role === 'user';
 
   return (
     <div className={cn(
       "flex gap-3 p-4",
       isUser ? "bg-muted/50" : "bg-background"
     )}>
       <div className={cn(
         "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
         isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
       )}>
         {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
       </div>
       <div className="flex-1 overflow-hidden">
         <div className="prose prose-sm dark:prose-invert max-w-none">
           <ReactMarkdown>{content}</ReactMarkdown>
         </div>
       </div>
     </div>
   );
 }