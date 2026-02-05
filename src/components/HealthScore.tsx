 import { useState, useEffect } from 'react';
 import { motion, AnimatePresence } from 'framer-motion';
 import { Trophy, TrendingUp, TrendingDown, Target, Star, Zap, Shield, Award } from 'lucide-react';
 import { Bill } from '@/types/bill';
 import { cn } from '@/lib/utils';
 
 interface HealthScoreProps {
   bills: Bill[];
   totals: {
     total: number;
     paid: number;
     pending: number;
     progress: number;
   };
 }
 
 interface Achievement {
   id: string;
   name: string;
   description: string;
   icon: React.ReactNode;
   unlocked: boolean;
   progress?: number;
 }
 
 export function HealthScore({ bills, totals }: HealthScoreProps) {
   const [animatedScore, setAnimatedScore] = useState(0);
   const [showDetails, setShowDetails] = useState(false);
 
   // Calculate health score (0-1000)
   const calculateScore = () => {
     if (bills.length === 0) return 500;
 
     let score = 500; // Base score
 
     // Payment progress (up to +200 points)
     const paymentBonus = Math.floor(totals.progress * 2);
     score += paymentBonus;
 
     // Bills paid on time (simulate - up to +150 points)
     const paidCount = bills.filter(b => b.isPaid).length;
     const paidRatio = paidCount / bills.length;
     score += Math.floor(paidRatio * 150);
 
     // Category diversity penalty (too concentrated = risk)
     const categories = new Set(bills.map(b => b.category));
     if (categories.size >= 4) score += 50;
 
     // Credit card ratio penalty
     const cardTotal = bills.filter(b => b.category === 'CARTAO').reduce((s, b) => s + b.amount, 0);
     const cardRatio = totals.total > 0 ? cardTotal / totals.total : 0;
     if (cardRatio > 0.5) score -= 100;
     else if (cardRatio > 0.3) score -= 50;
     else if (cardRatio < 0.2) score += 50;
 
     // Pending bills penalty
     const pendingRatio = totals.total > 0 ? totals.pending / totals.total : 0;
     if (pendingRatio > 0.7) score -= 100;
     else if (pendingRatio > 0.5) score -= 50;
 
     return Math.max(0, Math.min(1000, score));
   };
 
   const score = calculateScore();
 
   // Animate score on mount
   useEffect(() => {
     const duration = 1500;
     const steps = 60;
     const increment = score / steps;
     let current = 0;
     
     const timer = setInterval(() => {
       current += increment;
       if (current >= score) {
         setAnimatedScore(score);
         clearInterval(timer);
       } else {
         setAnimatedScore(Math.floor(current));
       }
     }, duration / steps);
 
     return () => clearInterval(timer);
   }, [score]);
 
   // Score color and label
   const getScoreInfo = () => {
     if (score >= 800) return { color: 'text-emerald-500', bg: 'bg-emerald-500', label: 'Excelente', emoji: '🌟' };
     if (score >= 600) return { color: 'text-primary', bg: 'bg-primary', label: 'Bom', emoji: '👍' };
     if (score >= 400) return { color: 'text-amber-500', bg: 'bg-amber-500', label: 'Regular', emoji: '⚡' };
     if (score >= 200) return { color: 'text-orange-500', bg: 'bg-orange-500', label: 'Atenção', emoji: '⚠️' };
     return { color: 'text-destructive', bg: 'bg-destructive', label: 'Crítico', emoji: '🚨' };
   };
 
   const scoreInfo = getScoreInfo();
 
   // Achievements
   const achievements: Achievement[] = [
     {
       id: 'first_payment',
       name: 'Primeiro Passo',
       description: 'Pagou sua primeira conta',
       icon: <Zap className="w-4 h-4" />,
       unlocked: bills.some(b => b.isPaid),
     },
     {
       id: 'half_paid',
       name: 'Meio Caminho',
       description: 'Pagou 50% das contas',
       icon: <Target className="w-4 h-4" />,
       unlocked: totals.progress >= 50,
       progress: Math.min(totals.progress / 50 * 100, 100),
     },
     {
       id: 'all_paid',
       name: 'Mestre dos Pagamentos',
       description: 'Pagou 100% das contas',
       icon: <Trophy className="w-4 h-4" />,
       unlocked: totals.progress >= 100,
       progress: totals.progress,
     },
     {
       id: 'card_control',
       name: 'Domador de Cartões',
       description: 'Cartões < 30% do total',
       icon: <Shield className="w-4 h-4" />,
       unlocked: (() => {
         const cardTotal = bills.filter(b => b.category === 'CARTAO').reduce((s, b) => s + b.amount, 0);
         return totals.total > 0 && (cardTotal / totals.total) < 0.3;
       })(),
     },
     {
       id: 'diversified',
       name: 'Bem Organizado',
       description: 'Contas em 4+ categorias',
       icon: <Star className="w-4 h-4" />,
       unlocked: new Set(bills.map(b => b.category)).size >= 4,
     },
   ];
 
   const unlockedCount = achievements.filter(a => a.unlocked).length;
 
   return (
     <div className="bg-card rounded-xl border border-border overflow-hidden">
       {/* Main Score Display */}
       <div 
         className="p-5 cursor-pointer"
         onClick={() => setShowDetails(!showDetails)}
       >
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <div className={cn("p-2 rounded-lg", scoreInfo.bg, "bg-opacity-20")}>
               <Trophy className={cn("w-5 h-5", scoreInfo.color)} />
             </div>
             <div>
               <h3 className="text-sm font-semibold text-foreground">Saúde Financeira</h3>
               <p className="text-xs text-muted-foreground">Clique para detalhes</p>
             </div>
           </div>
           <div className="flex items-center gap-2">
             <span className="text-2xl">{scoreInfo.emoji}</span>
             <div className="text-right">
               <span className={cn("text-3xl font-bold tabular-nums", scoreInfo.color)}>
                 {animatedScore}
               </span>
               <span className="text-xs text-muted-foreground block">{scoreInfo.label}</span>
             </div>
           </div>
         </div>
 
         {/* Progress bar */}
         <div className="h-2 bg-muted rounded-full overflow-hidden">
           <motion.div
             className={cn("h-full rounded-full", scoreInfo.bg)}
             initial={{ width: 0 }}
             animate={{ width: `${(animatedScore / 1000) * 100}%` }}
             transition={{ duration: 1.5, ease: "easeOut" }}
           />
         </div>
 
         {/* Quick stats */}
         <div className="flex items-center justify-between mt-3 text-xs">
           <div className="flex items-center gap-1 text-muted-foreground">
             <Award className="w-3.5 h-3.5" />
             <span>{unlockedCount}/{achievements.length} conquistas</span>
           </div>
           <div className="flex items-center gap-1">
             {score > 500 ? (
               <TrendingUp className="w-3.5 h-3.5 text-primary" />
             ) : (
               <TrendingDown className="w-3.5 h-3.5 text-destructive" />
             )}
             <span className={score > 500 ? 'text-primary' : 'text-destructive'}>
               {score > 500 ? 'Subindo' : 'Precisa melhorar'}
             </span>
           </div>
         </div>
       </div>
 
       {/* Expanded Details */}
       <AnimatePresence>
         {showDetails && (
           <motion.div
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.2 }}
             className="border-t border-border overflow-hidden"
           >
             <div className="p-4 space-y-4">
               <h4 className="text-sm font-medium text-foreground">Conquistas</h4>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                 {achievements.map((achievement) => (
                   <div
                     key={achievement.id}
                     className={cn(
                       "p-3 rounded-lg border transition-all",
                       achievement.unlocked 
                         ? "bg-primary/10 border-primary/30" 
                         : "bg-muted/50 border-border opacity-60"
                     )}
                   >
                     <div className="flex items-center gap-2 mb-1">
                       <div className={cn(
                         "p-1.5 rounded-md",
                         achievement.unlocked ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                       )}>
                         {achievement.icon}
                       </div>
                       {achievement.unlocked && (
                         <span className="text-xs">✓</span>
                       )}
                     </div>
                     <p className="text-xs font-medium text-foreground truncate">{achievement.name}</p>
                     <p className="text-[10px] text-muted-foreground truncate">{achievement.description}</p>
                     {!achievement.unlocked && achievement.progress !== undefined && (
                       <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-primary/50 rounded-full"
                           style={{ width: `${achievement.progress}%` }}
                         />
                       </div>
                     )}
                   </div>
                 ))}
               </div>
 
               {/* Tips */}
               <div className="bg-muted/50 rounded-lg p-3">
                 <p className="text-xs text-muted-foreground">
                   💡 <strong className="text-foreground">Dica:</strong>{' '}
                   {score < 400 
                     ? 'Foque em pagar as contas pendentes para melhorar seu score!'
                     : score < 700
                     ? 'Continue assim! Tente manter os cartões abaixo de 30% do total.'
                     : 'Excelente trabalho! Você está no caminho certo! 🎉'
                   }
                 </p>
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </div>
   );
 }