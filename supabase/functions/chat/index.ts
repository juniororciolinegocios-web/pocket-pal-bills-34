 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 const tools = [
   {
     type: "function",
     function: {
       name: "add_bill",
       description: "Adiciona uma nova conta/despesa ao sistema",
       parameters: {
         type: "object",
         properties: {
           name: { type: "string", description: "Nome da conta (ex: Conta de luz, Fatura Nubank)" },
           amount: { type: "number", description: "Valor em reais" },
           day: { type: "integer", description: "Dia do mês do vencimento (1-31)" },
           category: { 
             type: "string", 
             enum: ["CARTAO", "ALUGUEL", "CASA", "INVESTIMENTO", "CONVENIO", "ESCOLA", "OUTROS"],
             description: "Categoria da conta: CARTAO para cartões de crédito, ALUGUEL para aluguel, CASA para despesas da casa (luz, água, gás, internet), INVESTIMENTO para investimentos, CONVENIO para planos de saúde, ESCOLA para educação, OUTROS para demais"
           },
         },
         required: ["name", "amount", "day", "category"],
       },
     },
   },
   {
     type: "function",
     function: {
       name: "get_summary",
       description: "Retorna o resumo financeiro do mês (total, pago, pendente)",
       parameters: {
         type: "object",
         properties: {},
         required: [],
       },
     },
   },
   {
     type: "function",
     function: {
       name: "list_bills",
       description: "Lista as contas, opcionalmente filtradas por categoria ou status",
       parameters: {
         type: "object",
         properties: {
           category: { 
             type: "string", 
             enum: ["CARTAO", "ALUGUEL", "CASA", "INVESTIMENTO", "CONVENIO", "ESCOLA", "OUTROS"],
             description: "Filtrar por categoria (opcional)"
           },
           status: { 
             type: "string", 
             enum: ["paid", "pending"],
             description: "Filtrar por status: paid (pagas) ou pending (pendentes)"
           },
         },
         required: [],
       },
     },
   },
   {
     type: "function",
     function: {
       name: "mark_paid",
       description: "Marca uma conta como paga pelo nome",
       parameters: {
         type: "object",
         properties: {
           bill_name: { type: "string", description: "Nome ou parte do nome da conta a marcar como paga" },
         },
         required: ["bill_name"],
       },
     },
   },
 ];
 
 const systemPrompt = `Você é um assistente financeiro inteligente para gerenciamento de contas pessoais. Você ajuda os usuários a:
 - Adicionar novas contas/despesas
 - Consultar resumos financeiros
 - Listar contas por categoria ou status
 - Marcar contas como pagas
 
 Regras importantes:
 1. Sempre responda em português brasileiro
 2. Seja conciso e amigável
 3. Ao adicionar contas, deduza a categoria correta:
    - Menções a "cartão", "fatura", "Nubank", "Itaú", "C6", "Bradesco", etc → CARTAO
    - "Aluguel", "condomínio" → ALUGUEL
    - "Luz", "água", "gás", "internet", "telefone" → CASA
    - "CDB", "ações", "investimento", "poupança" → INVESTIMENTO
    - "Plano de saúde", "convênio", "dentista" → CONVENIO
    - "Escola", "faculdade", "curso", "mensalidade escolar" → ESCOLA
    - Outros casos → OUTROS
 4. Formate valores monetários como R$ X.XXX,XX
 5. Use as ferramentas disponíveis para executar ações
 6. Se o usuário não especificar o dia, pergunte qual dia do mês
 7. Se o valor não for claro, peça confirmação`;
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { messages, financialContext } = await req.json();
     const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
     
     if (!LOVABLE_API_KEY) {
       throw new Error("LOVABLE_API_KEY is not configured");
     }
 
     // Build context-aware system prompt
     const contextInfo = financialContext ? `
 
 Contexto financeiro atual:
 - Total de contas: R$ ${financialContext.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
 - Já pago: R$ ${financialContext.paid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
 - Pendente: R$ ${financialContext.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
 - Progresso: ${financialContext.progress.toFixed(0)}%
 
 Contas cadastradas:
 ${financialContext.bills.map((b: any) => `- ${b.name}: R$ ${b.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (dia ${b.day}, ${b.category}, ${b.isPaid ? 'pago' : 'pendente'})`).join('\n')}` : '';
 
     const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
       method: "POST",
       headers: {
         Authorization: `Bearer ${LOVABLE_API_KEY}`,
         "Content-Type": "application/json",
       },
       body: JSON.stringify({
         model: "google/gemini-3-flash-preview",
         messages: [
           { role: "system", content: systemPrompt + contextInfo },
           ...messages,
         ],
         tools,
         stream: true,
       }),
     });
 
     if (!response.ok) {
       if (response.status === 429) {
         return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
           status: 429,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
       if (response.status === 402) {
         return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione mais créditos à sua conta." }), {
           status: 402,
           headers: { ...corsHeaders, "Content-Type": "application/json" },
         });
       }
       const errorText = await response.text();
       console.error("AI gateway error:", response.status, errorText);
       return new Response(JSON.stringify({ error: "Erro ao processar sua mensagem" }), {
         status: 500,
         headers: { ...corsHeaders, "Content-Type": "application/json" },
       });
     }
 
     return new Response(response.body, {
       headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
     });
   } catch (e) {
     console.error("chat error:", e);
     return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
       status: 500,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   }
 });