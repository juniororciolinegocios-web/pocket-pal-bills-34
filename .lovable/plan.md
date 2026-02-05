
# Chat Conversacional com IA para Gestão de Contas

## Visão Geral

Vou criar um assistente virtual integrado ao sistema que permitirá adicionar contas e obter resumos através de conversa natural em português.

---

## Funcionalidades

### Comandos por Linguagem Natural
- **Adicionar contas**: "Adiciona conta de luz de 150 reais dia 15" → cria automaticamente na categoria CASA
- **Resumos**: "Quanto já paguei esse mês?" → retorna totais pagos
- **Consultas**: "Quais contas vencem essa semana?" → lista contas pendentes
- **Por categoria**: "Quanto gasto com cartões?" → soma da categoria CARTAO

### Interface do Chat
- Botão flutuante no canto inferior direito
- Painel deslizante com histórico de mensagens
- Indicador de "digitando" durante processamento
- Renderização de mensagens com Markdown
- Ações rápidas sugeridas pela IA

---

## Arquitetura Técnica

### Backend (Edge Function)

```text
supabase/functions/chat/index.ts
```

A edge function irá:
1. Receber mensagens do usuário
2. Incluir contexto financeiro atual (totais, categorias, contas)
3. Chamar Lovable AI (google/gemini-3-flash-preview)
4. Usar tool calling para extrair ações estruturadas
5. Retornar resposta com streaming

### Tool Calling para Ações

A IA terá acesso a ferramentas:

| Ferramenta | Descrição |
|------------|-----------|
| `add_bill` | Adicionar nova conta com nome, valor, dia, categoria |
| `get_summary` | Obter resumo financeiro (total, pago, pendente) |
| `list_bills` | Listar contas por status ou categoria |
| `mark_paid` | Marcar conta como paga |

### Frontend

```text
src/components/ChatAssistant.tsx    - Componente principal do chat
src/components/ChatMessage.tsx      - Renderização de mensagens
src/components/ChatInput.tsx        - Campo de entrada com envio
src/hooks/useChat.ts                - Hook para gerenciar estado e streaming
```

---

## Fluxo de Dados

```text
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Usuário   │────▶│ Edge Function│────▶│ Lovable AI  │
│  "Adiciona  │     │   /chat      │     │   Gemini    │
│   conta..." │     └──────────────┘     └─────────────┘
└─────────────┘            │                    │
       ▲                   │ Tool Call          │
       │                   ▼                    │
       │         ┌──────────────┐              │
       │         │  Extrai ação │◀─────────────┘
       │         │  estruturada │
       │         └──────────────┘
       │                   │
       │                   ▼
       │         ┌──────────────┐
       └─────────│ Retorna JSON │
                 │ + resposta   │
                 └──────────────┘
```

---

## Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `supabase/functions/chat/index.ts` | Edge function com Lovable AI |
| `src/components/ChatAssistant.tsx` | Container do chat flutuante |
| `src/components/ChatMessage.tsx` | Componente de mensagem |
| `src/components/ChatInput.tsx` | Input com botão enviar |
| `src/hooks/useChat.ts` | Gerenciamento de estado e API |

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/config.toml` | Adicionar configuração da função |
| `src/components/Layout.tsx` | Incluir ChatAssistant |
| `src/hooks/useBills.ts` | Expor função para adicionar via chat |

---

## Exemplos de Interação

**Usuário**: "Adiciona fatura do Nubank de 450 reais para dia 25"
**IA**: "Adicionei a conta **Fatura Nubank** de **R$ 450,00** com vencimento no dia **25**, na categoria **Cartão**."

**Usuário**: "Quanto ainda falta pagar esse mês?"
**IA**: "Você ainda tem **R$ 15.234,50** pendentes de pagamento este mês, distribuídos em 12 contas."

**Usuário**: "Quais contas de cartão tenho?"
**IA**: "Suas contas de cartão:
- Cartão C6: R$ 225,23 (pago)
- Conta Itaú: R$ 1.926,48 (pendente)
- Cartão Nubank PF: R$ 414,71 (pendente)
..."

---

## Considerações de UX

- Chat inicia minimizado como botão flutuante
- Histórico persiste durante a sessão
- Sugestões de comandos para novos usuários
- Feedback visual ao adicionar contas (toast + atualização da lista)
- Tratamento de erros com mensagens amigáveis
