 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { context } = await req.json();
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     const systemPrompt = `Você é um coach financeiro amigável e educativo. Gere um insight diário personalizado baseado no contexto financeiro do usuário.
 
 Contexto:
 - Total de contas: R$ ${context.total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
 - Já pago: R$ ${context.paid?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
 - Pendente: R$ ${context.pending?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
 - Progresso: ${context.progress?.toFixed(0) || 0}%
 - Número de contas: ${context.billsCount || 0}
 - Total em cartões: R$ ${context.cardTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
 - Categorias: ${context.categories?.join(', ') || 'nenhuma'}
 
 Retorne APENAS um JSON válido com esta estrutura:
 {
   "type": "tip" | "warning" | "celebration" | "education" | "motivation",
   "title": "Título curto com emoji",
   "content": "Texto educativo de 1-2 frases",
   "action": "Sugestão de próximo passo"
 }
 
 Regras:
 - Se progresso >= 100%: celebration
 - Se pendente > 70%: warning ou motivation
 - Se cartões > 40% do total: education sobre dívidas
 - Senão: tip com dica financeira prática
 - Seja amigável, nunca julgue
 - Use linguagem simples e brasileira`;
 
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-3-flash-preview",
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: "Gere um insight financeiro personalizado para hoje." },
         ],
         temperature: 0.7,
       }),
     });
 
     if (!response.ok) {
       const errorText = await response.text();
       console.error("AI gateway error:", response.status, errorText);
       throw new Error("Failed to generate insight");
     }
 
     const data = await response.json();
     const content = data.choices?.[0]?.message?.content;
 
     // Parse JSON from response
     const jsonMatch = content?.match(/\{[\s\S]*\}/);
     if (!jsonMatch) {
       throw new Error("Invalid response format");
     }
 
     const insight = JSON.parse(jsonMatch[0]);
 
     return new Response(JSON.stringify({ insight }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (e) {
     console.error("generate-insight error:", e);
     return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
       status: 500,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   }
 });