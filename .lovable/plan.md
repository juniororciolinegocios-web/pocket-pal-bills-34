
# Plano: Layout Clean + Novas Páginas

## Resumo

Vou aprimorar o visual do sistema com um layout mais limpo e moderno, além de criar as 4 páginas que aparecem na navegação: **Transações**, **Cartões de Crédito**, **Minhas Categorias** e **Agenda**.

---

## 1. Melhorias no Layout (Visual Clean)

### Header
- Redesenhar com visual mais minimalista
- Melhorar espaçamento e tipografia
- Adicionar indicador visual na página ativa

### Página Inicial (Visão Geral)
- Cards com sombras mais suaves e bordas refinadas
- Espaçamento mais consistente entre seções
- Remover elementos redundantes
- Melhorar hierarquia visual com tipografia

### Componentes Gerais
- Bordas mais sutis
- Paleta de cores mais harmoniosa
- Animações de transição suaves
- Hover states mais elegantes

---

## 2. Página de Transações (`/transacoes`)

Lista completa de todas as contas com funcionalidades avançadas:

- **Tabela de transações** com todas as contas
- **Filtros**: por categoria, status (pago/pendente), período
- **Busca** por nome da conta
- **Ordenação** por data, valor ou nome
- **Ações rápidas**: marcar como pago, editar, excluir

---

## 3. Página de Cartões de Crédito (`/cartoes`)

Visão focada nos cartões:

- **Cards visuais** para cada cartão (Nubank, C6, Itaú, etc.)
- **Total da fatura** de cada cartão
- **Lista de compras** associadas a cada cartão
- **Status**: pago ou pendente
- **Resumo**: total geral de cartões

---

## 4. Página Minhas Categorias (`/categorias`)

Gerenciamento das categorias:

- **Grid de categorias** existentes com cores
- **Total gasto** por categoria
- **Adicionar nova categoria** (futuramente)
- **Estatísticas** de cada categoria
- **Editar cor** e nome da categoria

---

## 5. Página Agenda (`/agenda`)

Calendário de vencimentos:

- **Visualização de calendário** mensal
- **Dias destacados** com contas a vencer
- **Lista lateral** com contas do dia selecionado
- **Cores por status**: verde (pago), amarelo (pendente), vermelho (vencido)

---

## Arquivos a Serem Criados

```text
src/pages/Transactions.tsx      - Página de transações
src/pages/CreditCards.tsx       - Página de cartões
src/pages/Categories.tsx        - Página de categorias
src/pages/Schedule.tsx          - Página de agenda
src/components/Layout.tsx       - Layout compartilhado
src/components/TransactionRow.tsx
src/components/CreditCardItem.tsx
src/components/CategoryCard.tsx
src/components/CalendarView.tsx
```

## Arquivos a Serem Modificados

```text
src/App.tsx                     - Adicionar rotas
src/index.css                   - Ajustes de cores/estilos
src/components/Header.tsx       - Visual refinado
src/pages/Index.tsx             - Layout mais clean
src/components/FinancialSummaryCards.tsx
src/components/ExpensesSection.tsx
src/components/BillsList.tsx
src/components/BillItem.tsx
```

---

## Detalhes Técnicos

### Estrutura de Rotas

```text
/           -> Index.tsx (Visão Geral)
/transacoes -> Transactions.tsx
/cartoes    -> CreditCards.tsx
/categorias -> Categories.tsx
/agenda     -> Schedule.tsx
```

### Componente Layout Compartilhado

Criar um `Layout.tsx` que encapsula o Header + área de conteúdo para evitar repetição em cada página.

### Reutilização do Hook useBills

Todas as páginas utilizarão o `useBills` existente para acessar e manipular os dados das contas.

### Responsividade

Todas as novas páginas serão responsivas, adaptando-se a desktop, tablet e mobile.

---

## Ordem de Implementação

1. Refatorar estilos globais e cores
2. Criar componente Layout compartilhado
3. Melhorar Header com visual clean
4. Atualizar página Index com novo visual
5. Criar página Transações
6. Criar página Cartões de Crédito
7. Criar página Minhas Categorias
8. Criar página Agenda
9. Atualizar rotas no App.tsx
