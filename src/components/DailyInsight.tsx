 import { useState, useEffect } from 'react';
 import { Lightbulb, ChevronRight, RefreshCw, Sparkles, TrendingUp, AlertTriangle, PartyPopper, GraduationCap, Heart } from 'lucide-react';
 import { Bill } from '@/types/bill';
 import { cn } from '@/lib/utils';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 
 interface DailyInsightProps {
   bills: Bill[];
   totals: {
     total: number;
     paid: number;
     pending: number;
     progress: number;
   };
 }
 
 interface Insight {
   type: 'tip' | 'warning' | 'celebration' | 'education' | 'motivation';
   title: string;
   content: string;
   action?: string;
 }
 
 const insightIcons = {
   tip: Lightbulb,
   warning: AlertTriangle,
   celebration: PartyPopper,
   education: GraduationCap,
   motivation: Heart,
 };
 
 const insightStyles = {
   tip: {
     bg: 'bg-amber-500/10',
     border: 'border-amber-500/30',
     icon: 'text-amber-500',
     iconBg: 'bg-amber-500/20',
   },
   warning: {
     bg: 'bg-destructive/10',
     border: 'border-destructive/30',
     icon: 'text-destructive',
     iconBg: 'bg-destructive/20',
   },
   celebration: {
     bg: 'bg-primary/10',
     border: 'border-primary/30',
     icon: 'text-primary',
     iconBg: 'bg-primary/20',
   },
   education: {
     bg: 'bg-blue-500/10',
     border: 'border-blue-500/30',
     icon: 'text-blue-500',
     iconBg: 'bg-blue-500/20',
   },
   motivation: {
     bg: 'bg-pink-500/10',
     border: 'border-pink-500/30',
     icon: 'text-pink-500',
     iconBg: 'bg-pink-500/20',
   },
 };
 
 export function DailyInsight({ bills, totals }: DailyInsightProps) {
   const [insight, setInsight] = useState<Insight | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [isExpanded, setIsExpanded] = useState(false);
 
   // Generate local insight based on data
   const generateLocalInsight = (): Insight => {
     const today = new Date().getDate();
     const cardTotal = bills.filter(b => b.category === 'CARTAO').reduce((s, b) => s + b.amount, 0);
     const cardRatio = totals.total > 0 ? (cardTotal / totals.total) * 100 : 0;
     const pendingBills = bills.filter(b => !b.isPaid);
     const urgentBills = pendingBills.filter(b => b.day <= today + 3 && b.day >= today);
 
     // Celebration: All paid
     if (totals.progress >= 100) {
       return {
         type: 'celebration',
         title: '🎉 Parabéns! Você zerou!',
         content: `Todas as ${bills.length} contas deste mês foram pagas! Você é um exemplo de disciplina financeira.`,
         action: 'Que tal definir uma meta para o próximo mês?',
       };
     }
 
     // Warning: Urgent bills
     if (urgentBills.length > 0) {
       const urgentTotal = urgentBills.reduce((s, b) => s + b.amount, 0);
       return {
         type: 'warning',
         title: `⚠️ ${urgentBills.length} conta(s) vencem em breve!`,
         content: `Você tem R$ ${urgentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para pagar nos próximos 3 dias. ${urgentBills.map(b => b.name).join(', ')}.`,
         action: 'Abra o chat e diga "marcar como pago" quando pagar!',
       };
     }
 
     // Education: High card ratio
     if (cardRatio > 40) {
       return {
         type: 'education',
         title: '💳 Cartões representam ' + cardRatio.toFixed(0) + '% dos gastos',
         content: 'Quando os cartões passam de 30% do orçamento, os juros podem virar uma bola de neve. Considere usar débito para compras do dia a dia.',
         action: 'Pergunte ao assistente: "Como reduzir gastos com cartão?"',
       };
     }
 
     // Motivation: Good progress
     if (totals.progress >= 50 && totals.progress < 100) {
       return {
         type: 'motivation',
         title: '💪 Você está no caminho certo!',
         content: `Já pagou ${totals.progress.toFixed(0)}% das contas (R$ ${totals.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}). Faltam apenas R$ ${totals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para zerar o mês!`,
         action: 'Continue assim! Cada conta paga é uma vitória.',
       };
     }
 
     // Tip: General financial tip
     const tips = [
       {
         title: '💡 Regra 50-30-20',
         content: 'Divida sua renda: 50% para necessidades, 30% para desejos e 20% para poupança. Essa divisão simples pode transformar suas finanças.',
         action: 'Pergunte ao assistente como aplicar isso no seu orçamento!',
       },
       {
         title: '💡 Pague-se primeiro',
         content: 'Antes de pagar qualquer conta, separe pelo menos 10% da sua renda para investimentos. Seu "eu" do futuro agradece!',
         action: 'Que tal criar uma meta de poupança?',
       },
       {
         title: '💡 Efeito latte',
         content: 'Pequenos gastos diários somam fortunas. Um café de R$ 10/dia são R$ 300/mês ou R$ 3.600/ano! Onde estão seus "cafezinhos"?',
         action: 'Analise seus gastos recorrentes pequenos.',
       },
     ];
 
     return { type: 'tip', ...tips[Math.floor(Math.random() * tips.length)] };
   };
 
   // Fetch AI-generated insight
   const fetchAIInsight = async () => {
     setIsLoading(true);
     try {
       const context = {
         total: totals.total,
         paid: totals.paid,
         pending: totals.pending,
         progress: totals.progress,
         billsCount: bills.length,
         categories: [...new Set(bills.map(b => b.category))],
         cardTotal: bills.filter(b => b.category === 'CARTAO').reduce((s, b) => s + b.amount, 0),
       };
 
       const { data, error } = await supabase.functions.invoke('generate-insight', {
         body: { context },
       });
 
       if (error) throw error;
       if (data?.insight) {
         setInsight(data.insight);
       }
     } catch {
       // Fallback to local insight
       setInsight(generateLocalInsight());
     } finally {
       setIsLoading(false);
     }
   };
 
   // Initialize with local insight
   useEffect(() => {
     setInsight(generateLocalInsight());
   }, [bills.length, totals.progress]);
 
   if (!insight) return null;
 
   const Icon = insightIcons[insight.type];
   const styles = insightStyles[insight.type];
 
   return (
     <div 
       className={cn(
         "rounded-xl border overflow-hidden transition-all cursor-pointer",
         styles.bg,
         styles.border
       )}
       onClick={() => setIsExpanded(!isExpanded)}
     >
       <div className="p-4">
         <div className="flex items-start gap-3">
           <div className={cn("p-2 rounded-lg shrink-0", styles.iconBg)}>
             <Icon className={cn("w-5 h-5", styles.icon)} />
           </div>
           <div className="flex-1 min-w-0">
             <div className="flex items-center justify-between gap-2">
               <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
               <button
                 onClick={(e) => {
                   e.stopPropagation();
                   fetchAIInsight();
                 }}
                 disabled={isLoading}
                 className="p-1.5 rounded-lg hover:bg-background/50 transition-colors"
               >
                 <RefreshCw className={cn("w-4 h-4 text-muted-foreground", isLoading && "animate-spin")} />
               </button>
             </div>
             <p className={cn(
               "text-sm text-muted-foreground mt-1 transition-all",
               isExpanded ? "" : "line-clamp-2"
             )}>
               {insight.content}
             </p>
             {insight.action && isExpanded && (
               <div className="mt-3 flex items-center gap-2 text-xs font-medium text-foreground">
                 <Sparkles className="w-3.5 h-3.5" />
                 <span>{insight.action}</span>
               </div>
             )}
           </div>
           <ChevronRight className={cn(
             "w-4 h-4 text-muted-foreground shrink-0 transition-transform",
             isExpanded && "rotate-90"
           )} />
         </div>
       </div>
     </div>
   );
 }