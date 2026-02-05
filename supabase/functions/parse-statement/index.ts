 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
 interface ParsedTransaction {
   date: string;
   description: string;
   amount: number;
   type: 'income' | 'expense';
   category?: string;
 }
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   try {
     const { file_name, file_type, content, bank_account_id } = await req.json();
 
     let transactions: ParsedTransaction[] = [];
 
     if (file_type === 'ofx') {
       transactions = parseOFX(content);
     } else if (file_type === 'csv') {
       transactions = parseCSV(content);
     } else if (file_type === 'image') {
       transactions = await parseImageWithAI(content);
     }
 
     // Save transactions to database
     if (transactions.length > 0) {
       const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
       const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
       const supabase = createClient(supabaseUrl, supabaseKey);
 
       const transactionsToInsert = transactions.map(t => ({
         bank_account_id: bank_account_id || null,
         transaction_type: t.type,
         amount: Math.abs(t.amount),
         description: t.description,
         category: t.category || categorizeTransaction(t.description),
         date: t.date,
         imported_from: file_type,
       }));
 
       const { error } = await supabase
         .from('transactions')
         .insert(transactionsToInsert);
 
       if (error) throw error;
     }
 
     return new Response(JSON.stringify({
       success: true,
       transactions_count: transactions.length,
       message: `${transactions.length} transações encontradas e importadas.`,
     }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   } catch (e) {
     console.error("parse-statement error:", e);
     return new Response(JSON.stringify({ 
       error: e instanceof Error ? e.message : "Erro desconhecido",
       transactions_count: 0,
     }), {
       status: 500,
       headers: { ...corsHeaders, "Content-Type": "application/json" },
     });
   }
 });
 
 function parseOFX(content: string): ParsedTransaction[] {
   const transactions: ParsedTransaction[] = [];
   
   // Simple OFX parser - looks for STMTTRN blocks
   const transactionBlocks = content.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) || [];
   
   for (const block of transactionBlocks) {
     const dtPosted = block.match(/<DTPOSTED>(\d{8})/)?.[1];
     const amount = block.match(/<TRNAMT>([-\d.]+)/)?.[1];
     const memo = block.match(/<MEMO>([^<]+)/)?.[1] || block.match(/<NAME>([^<]+)/)?.[1];
     
     if (dtPosted && amount && memo) {
       const year = dtPosted.substring(0, 4);
       const month = dtPosted.substring(4, 6);
       const day = dtPosted.substring(6, 8);
       const numAmount = parseFloat(amount);
       
       transactions.push({
         date: `${year}-${month}-${day}`,
         description: memo.trim(),
         amount: Math.abs(numAmount),
         type: numAmount >= 0 ? 'income' : 'expense',
       });
     }
   }
   
   return transactions;
 }
 
 function parseCSV(content: string): ParsedTransaction[] {
   const transactions: ParsedTransaction[] = [];
   const lines = content.split('\n').filter(l => l.trim());
   
   // Skip header
   for (let i = 1; i < lines.length; i++) {
     const parts = lines[i].split(/[,;]/).map(p => p.trim().replace(/"/g, ''));
     
     if (parts.length >= 3) {
       // Try to find date, description, amount in various formats
       let date = '', description = '', amount = 0;
       
       for (const part of parts) {
         // Date patterns
         const dateMatch = part.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
         if (dateMatch) {
           date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
           continue;
         }
         
         const isoDate = part.match(/(\d{4})-(\d{2})-(\d{2})/);
         if (isoDate) {
           date = part;
           continue;
         }
         
         // Amount pattern
         const numPart = part.replace(/[R$\s]/g, '').replace(',', '.');
         if (/^-?\d+\.?\d*$/.test(numPart)) {
           amount = parseFloat(numPart);
           continue;
         }
         
         // Description (longest remaining text)
         if (part.length > description.length && isNaN(parseFloat(part))) {
           description = part;
         }
       }
       
       if (date && description && amount !== 0) {
         transactions.push({
           date,
           description,
           amount: Math.abs(amount),
           type: amount >= 0 ? 'income' : 'expense',
         });
       }
     }
   }
   
   return transactions;
 }
 
 async function parseImageWithAI(base64Image: string): Promise<ParsedTransaction[]> {
   const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
   if (!LOVABLE_API_KEY) {
     throw new Error("LOVABLE_API_KEY not configured");
   }
 
   const systemPrompt = `Você é um extrator de dados de extratos bancários. Analise a imagem e extraia todas as transações visíveis.
 
 Retorne APENAS um JSON válido com esta estrutura:
 {
   "transactions": [
     {
       "date": "YYYY-MM-DD",
       "description": "Descrição da transação",
       "amount": 123.45,
       "type": "expense" ou "income"
     }
   ]
 }
 
 Regras:
 - Valores negativos ou débitos = "expense"
 - Valores positivos ou créditos = "income"
 - Converta datas para formato ISO (YYYY-MM-DD)
 - Mantenha a descrição original
 - Se não encontrar transações, retorne {"transactions": []}`;
 
   const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
     method: "POST",
     headers: {
       Authorization: `Bearer ${LOVABLE_API_KEY}`,
       "Content-Type": "application/json",
     },
     body: JSON.stringify({
       model: "google/gemini-2.5-flash",
       messages: [
         { role: "system", content: systemPrompt },
         { 
           role: "user", 
           content: [
             { type: "text", text: "Extraia as transações desta imagem de extrato bancário:" },
             { type: "image_url", image_url: { url: base64Image } }
           ]
         },
       ],
       temperature: 0.1,
     }),
   });
 
   if (!response.ok) {
     throw new Error("Erro ao processar imagem com IA");
   }
 
   const data = await response.json();
   const content = data.choices?.[0]?.message?.content || '';
   
   // Parse JSON from response
   const jsonMatch = content.match(/\{[\s\S]*\}/);
   if (!jsonMatch) {
     return [];
   }
 
   try {
     const parsed = JSON.parse(jsonMatch[0]);
     return parsed.transactions || [];
   } catch {
     return [];
   }
 }
 
 function categorizeTransaction(description: string): string {
   const desc = description.toLowerCase();
   
   // Cartão de crédito
   if (/nubank|itau|bradesco|c6|santander|inter|fatura|cartao/i.test(desc)) return 'CARTAO';
   
   // Alimentação
   if (/ifood|uber eats|rappi|restaurante|lanchonete|mercado|supermercado|padaria/i.test(desc)) return 'ALIMENTACAO';
   
   // Transporte
   if (/uber|99|taxi|combustivel|gasolina|posto|estacionamento|sem parar/i.test(desc)) return 'TRANSPORTE';
   
   // Casa
   if (/luz|energia|agua|gas|internet|telefone|celular|aluguel|condominio/i.test(desc)) return 'CASA';
   
   // Saúde
   if (/farmacia|drogaria|hospital|medico|consulta|plano|unimed|amil/i.test(desc)) return 'SAUDE';
   
   // Educação
   if (/escola|faculdade|curso|livro|mensalidade/i.test(desc)) return 'EDUCACAO';
   
   // Lazer
   if (/netflix|spotify|amazon|disney|cinema|teatro|show|viagem/i.test(desc)) return 'LAZER';
   
   // Transferências
   if (/pix|ted|doc|transferencia/i.test(desc)) return 'TRANSFERENCIA';
   
   // Salário
   if (/salario|pagamento|remuneracao|ferias|13|decimo/i.test(desc)) return 'SALARIO';
   
   return 'OUTROS';
 }