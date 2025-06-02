# Estrutura Completa do Sistema de Chat - Documentação Técnica Detalhada

## 📋 Visão Geral do Sistema
Sistema de chat inteligente com IA usando Next.js 14, AI SDK da Vercel, Groq API e interface moderna com Tailwind CSS. O sistema oferece uma experiência de chat profissional com múltiplas conversas, sistema de menções, processamento inteligente e interface responsiva.

## 🏗️ Arquitetura Completa

### 📁 Estrutura Detalhada de Pastas e Arquivos

\`\`\`
/
├── app/                                    # App Router do Next.js 14
│   ├── layout.tsx                         # Layout raiz da aplicação
│   ├── page.tsx                           # Página inicial com seletor de roles
│   ├── globals.css                        # Estilos globais e customizações CSS
│   └── api/                               # API Routes do Next.js
│       ├── chat/
│       │   └── route.ts                   # Endpoint principal do chat
│       └── check-connection/
│           └── route.ts                   # Endpoint de verificação de conexão
├── components/                            # Componentes React organizados
│   ├── ui/                                # Componentes base do shadcn/ui
│   │   ├── button.tsx                     # Componente de botão
│   │   ├── input.tsx                      # Componente de input
│   │   ├── scroll-area.tsx                # Área de scroll customizada
│   │   ├── dropdown-menu.tsx              # Menu dropdown
│   │   ├── popover.tsx                    # Componente popover
│   │   ├── command.tsx                    # Interface de comando
│   │   ├── switch.tsx                     # Switch toggle
│   │   └── tooltip.tsx                    # Tooltips
│   ├── chat-form.tsx                      # Componente principal do chat
│   ├── chat-header.tsx                    # Cabeçalho do chat
│   ├── chat-dropdown.tsx                  # Dropdown de seleção de chats
│   ├── message-actions.tsx                # Ações das mensagens (dropdown)
│   ├── mention-text.tsx                   # Renderização de menções
│   ├── mention-selector.tsx               # Seletor de menções
│   ├── journey-map.tsx                    # Mapa da jornada do usuário
│   ├── attachment-menu.tsx                # Menu de anexos
│   ├── thinking-process.tsx               # Visualização do processo de pensamento
│   ├── system-status.tsx                  # Status do sistema
│   ├── status-icon.tsx                    # Ícone de status com logs
│   ├── typing-animation.tsx               # Animação de digitação
│   ├── theme-provider.tsx                 # Provedor de tema
│   ├── theme-toggle.tsx                   # Toggle de tema
│   ├── model-selector.tsx                 # Seletor de modelos de IA
│   ├── role-selector.tsx                  # Seletor de áreas profissionais
│   ├── suggested-prompts.tsx              # Prompts sugeridos
│   ├── copy-to-clipboard.tsx              # Componente de cópia
│   ├── autoresize-textarea.tsx            # Textarea com redimensionamento
│   └── sidebar.tsx                        # Sidebar (preparada para uso futuro)
├── services/                              # Serviços de negócio
│   ├── chat-service.ts                    # Gerenciamento de múltiplos chats
│   ├── decision-service.ts                # Simulação de decisão de ferramentas MCP
│   └── mcp-service.ts                     # Serviço MCP (Model Context Protocol)
├── config/                                # Configurações
│   └── mcp-servers.json                   # Configuração dos servidores MCP
├── hooks/                                 # Custom React Hooks
│   ├── use-mobile.tsx                     # Hook para detecção mobile
│   └── use-toast.ts                       # Hook para toasts
├── lib/                                   # Utilitários
│   └── utils.ts                           # Funções utilitárias (cn, etc.)
├── tailwind.config.js                     # Configuração do Tailwind CSS
├── package.json                           # Dependências e scripts
└── tsconfig.json                          # Configuração TypeScript
\`\`\`

## 🔧 Componentes Principais - Análise Detalhada

### 1. ChatForm (`components/chat-form.tsx`)
**Responsabilidade**: Componente principal que orquestra toda a interface do chat

**Estados Principais**:
\`\`\`typescript
// Estados de mensagens e chat
messages: Message[]                    // Lista de mensagens do chat atual
input: string                         // Texto atual do textarea
isLoading: boolean                    // Estado de carregamento da API
isStreaming: boolean                  // Estado de streaming de resposta
selectedModel: string                 // Modelo de IA selecionado

// Estados de contexto e menções
messageContexts: MessageContext[]     // Contextos das mensagens para menções
showMentionSelector: boolean          // Visibilidade do seletor de menções
mentionQuery: string                  // Query atual da menção
cursorPosition: number                // Posição do cursor no textarea

// Estados de UI e interação
hasInteracted: boolean                // Se o usuário já interagiu
activeButton: ActiveButton            // Botão ativo no momento
hasTyped: boolean                     // Se há texto digitado
isTransitioning: boolean              // Estado de transição entre telas
currentChatId: string                 // ID do chat atual

// Estados de processamento
thinkingProcesses: Map<string, DecisionProcess>  // Processos de pensamento por mensagem
expandedProcesses: Set<string>        // Processos expandidos
lastProcess: DecisionProcess | null   // Último processo executado
\`\`\`

**Funcionalidades Implementadas**:
- ✅ Envio e recebimento de mensagens via AI SDK
- ✅ Sistema de menções com `@` e autocomplete
- ✅ Seleção dinâmica de modelos de IA (Groq)
- ✅ Upload de arquivos (preparado)
- ✅ Animações de transição suaves
- ✅ Gerenciamento de estado complexo
- ✅ Responsividade mobile/desktop
- ✅ Streaming de respostas em tempo real

### 2. Sistema de Menções
**Componentes Envolvidos**:
- `MentionText`: Renderiza texto com menções estilizadas
- `MentionSelector`: Interface para seleção de mensagens
- `AutoResizeTextarea`: Textarea com suporte a menções

**Fluxo Detalhado**:
\`\`\`
1. Usuário digita '@' no textarea
   ↓
2. handleInputChange detecta padrão /@(\w*)$/
   ↓
3. setShowMentionSelector(true) + setMentionQuery(match)
   ↓
4. MentionSelector filtra messageContexts por query
   ↓
5. Usuário seleciona mensagem
   ↓
6. handleMentionSelect insere @{resumo} no texto
   ↓
7. MentionText renderiza com estilização especial
\`\`\`

**Estrutura de Contexto**:
\`\`\`typescript
interface MessageContext {
  id: string          // ID único da mensagem
  summary: string     // Resumo de 8 palavras
  content: string     // Conteúdo completo
  role: "user" | "assistant"  // Tipo de mensagem
  timestamp: Date     // Timestamp de criação
}
\`\`\`

### 3. Sistema de Ações de Mensagem
**Componente**: `MessageActions`
**Implementação**: Dropdown contextual com ações específicas

**Ações para Usuário**:
- ✏️ Editar mensagem (preparado)
- 📋 Copiar texto
- 🗑️ Excluir mensagem (preparado)

**Ações para Assistente**:
- 🔄 Regenerar resposta
- 📋 Copiar texto
- 📤 Compartilhar (preparado)
- 👍 Útil (preparado)
- 👎 Não útil (preparado)

### 4. Journey Map
**Componente**: `JourneyMap`
**Posicionamento**: Header centralizado
**Funcionalidade**: Visualização horizontal da jornada do chat

**Características**:
- 📍 Mostra últimas 6 mensagens
- 🎯 Indicador visual por tipo (usuário/assistente)
- ⭐ Destaque da mensagem atual
- 📊 Contador de mensagens extras

## 🔄 Fluxo de Dados Detalhado

### 1. Ciclo de Vida de uma Mensagem
\`\`\`
[Usuário digita] 
    ↓
[handleInputChange] → detecta menções → atualiza UI
    ↓
[handleSubmit] → valida input → inicia transição
    ↓
[setIsThinking(true)] → gera processo de pensamento
    ↓
[decisionService.decideTools] → simula seleção de ferramentas
    ↓
[append (AI SDK)] → envia para API /api/chat
    ↓
[API Route] → processa com Groq → retorna stream
    ↓
[onResponse] → inicia streaming → setIsStreaming(true)
    ↓
[Streaming] → atualiza UI em tempo real
    ↓
[onFinish] → finaliza → gera contexto → salva mensagem
\`\`\`

### 2. Gerenciamento de Estado de Chat
\`\`\`
[ChatService] (Singleton)
    ↓
[localStorage] ← → [chats: Chat[]]
    ↓
[selectedChatId] → [getChatMessages(id)]
    ↓
[messageListeners] → [notifica componentes]
    ↓
[ChatForm] → [atualiza messages]
\`\`\`

### 3. Sistema de Persistência (Atual)
\`\`\`typescript
// Estrutura atual (localStorage)
localStorage: {
  "chats": Chat[],                           // Lista de chats
  "chat-messages-{chatId}": Message[]        // Mensagens por chat
}

// Estrutura futura (preparada para backend)
/*
Backend API Structure (Para implementação futura):
POST /api/chats                              // Criar chat
GET /api/chats                               // Listar chats
GET /api/chats/{id}                          // Obter chat específico
PUT /api/chats/{id}                          // Atualizar chat
DELETE /api/chats/{id}                       // Deletar chat
GET /api/chats/{id}/messages                 // Obter mensagens
POST /api/chats/{id}/messages                // Adicionar mensagem
PUT /api/chats/{id}/messages/{messageId}     // Editar mensagem
DELETE /api/chats/{id}/messages/{messageId}  // Deletar mensagem

Database Schema (Sugestão):
Table: chats
- id: string (primary key)
- title: string
- created_at: timestamp
- updated_at: timestamp
- user_id: string (foreign key)

Table: messages
- id: string (primary key)
- chat_id: string (foreign key)
- role: enum('user', 'assistant')
- content: text
- metadata: json (thinking_process, etc.)
- created_at: timestamp

Table: users
- id: string (primary key)
- email: string
- roles: json array
- created_at: timestamp
*/
\`\`\`

## 🌐 Backend/API Detalhado

### 1. API Routes Implementadas

#### `/api/chat` (POST)
**Responsabilidade**: Processar mensagens do chat e retornar streaming response

**Input**:
\`\`\`typescript
{
  messages: CoreMessage[],      // Histórico de mensagens
  model: string,               // Modelo selecionado (ex: "groq:llama-3.1-70b-versatile")
  userRoles?: string[]         // Áreas profissionais do usuário
}
\`\`\`

**Processamento**:
1. ✅ Validação da GROQ_API_KEY
2. ✅ Criação de system prompt baseado em userRoles
3. ✅ Seleção e instanciação do modelo Groq
4. ✅ Configuração de parâmetros (maxTokens: 4000, temperature: 0.7)
5. ✅ Streaming via AI SDK
6. ✅ Tratamento de erros com fallback

**Output**: `DataStreamResponse` (streaming)

**Tratamento de Erros**:
- ❌ API key não encontrada → 500 com detalhes
- ❌ Modelo inválido → fallback para llama-3.1-8b-instant
- ❌ Erro de streaming → configuração simplificada
- ❌ Erro crítico → resposta JSON com debug info

#### `/api/check-connection` (GET)
**Responsabilidade**: Verificar conectividade e saúde da API Groq

**Processamento**:
1. ✅ Verificação de variáveis de ambiente
2. ✅ Teste de chamada simples para Groq
3. ✅ Validação de resposta
4. ✅ Coleta de métricas de uso

**Output**:
\`\`\`typescript
{
  success: boolean,
  message?: string,
  modelInfo?: {
    model: string,
    provider: string,
    response: string,
    usage: object
  },
  error?: string,
  debug?: object,
  timestamp: string
}
\`\`\`

### 2. Integração com Groq API

**Modelos Disponíveis**:
\`\`\`typescript
const models = [
  {
    value: "groq:llama-3.1-70b-versatile",
    label: "Llama 3.1 70B Versatile",
    description: "Modelo principal - equilíbrio entre velocidade e qualidade"
  },
  {
    value: "groq:llama-3.1-8b-instant", 
    label: "Llama 3.1 8B Instant",
    description: "Modelo rápido - respostas instantâneas"
  },
  {
    value: "groq:llama-3.3-70b-versatile",
    label: "Llama 3.3 70B Versatile", 
    description: "Modelo mais recente - melhor qualidade"
  },
  {
    value: "groq:mixtral-8x7b-32768",
    label: "Mixtral 8x7B",
    description: "Modelo especializado - contexto longo"
  }
]
\`\`\`

**Configuração de Sistema**:
\`\`\`typescript
// System prompt dinâmico baseado em roles
const systemPrompt = userRoles?.length > 0 
  ? `Você é um assistente especializado nas seguintes áreas: ${userRoles.join(", ")}. 
     Forneça respostas precisas e relevantes para estas áreas profissionais, utilizando 
     terminologia apropriada e considerando as necessidades específicas destes campos. 
     Quando possível, ofereça exemplos práticos e recomendações aplicáveis ao contexto brasileiro.`
  : "Você é um assistente útil e amigável."
\`\`\`

### 3. Variáveis de Ambiente
\`\`\`env
# Obrigatórias
GROQ_API_KEY=gsk_...                    # Chave da API Groq

# Opcionais
NODE_ENV=development                    # Ambiente de execução
NEXT_PUBLIC_APP_URL=http://localhost:3000  # URL da aplicação (para futuras integrações)

# Futuras (preparadas para implementação)
# DATABASE_URL=postgresql://...         # URL do banco de dados
# NEXTAUTH_SECRET=...                   # Secret para autenticação
# NEXTAUTH_URL=...                      # URL para NextAuth
# REDIS_URL=...                         # URL do Redis para cache
\`\`\`

## 🎨 Sistema de Temas e Estilização

### Paleta de Cores Detalhada

**Tema Claro** (baseado em #ffeec9):
\`\`\`css
:root {
  --background: 45 50% 96%;        /* #faf8f2 - fundo principal */
  --foreground: 30 25% 15%;        /* #2b2419 - texto principal */
  --primary: 35 35% 25%;           /* #453a2a - cor primária */
  --primary-foreground: 45 50% 96%; /* #faf8f2 - texto em primária */
  --secondary: 42 30% 88%;         /* #e8e0d1 - cor secundária */
  --secondary-foreground: 30 25% 20%; /* #332821 - texto em secundária */
  --muted: 42 25% 85%;             /* #ddd4c5 - elementos silenciados */
  --muted-foreground: 30 15% 40%;  /* #5c5248 - texto silenciado */
  --border: 42 20% 82%;            /* #d1c8b8 - bordas */
  --accent: 40 35% 80%;            /* #d4c7b0 - acentos */
}
\`\`\`

**Tema Escuro** (baseado em #1a0e00):
\`\`\`css
.dark {
  --background: 30 100% 5%;        /* #1a0e00 - fundo principal */
  --foreground: 45 40% 90%;        /* #e8e0d1 - texto principal */
  --primary: 42 60% 70%;           /* #c4b896 - dourado claro */
  --primary-foreground: 30 100% 5%; /* #1a0e00 - texto em primária */
  --secondary: 30 60% 12%;         /* #3d2817 - cor secundária */
  --secondary-foreground: 45 30% 85%; /* #ddd4c5 - texto em secundária */
  --muted: 30 50% 15%;             /* #4d3322 - elementos silenciados */
  --muted-foreground: 45 20% 65%;  /* #a69c8f - texto silenciado */
  --border: 30 40% 18%;            /* #5c4a3a - bordas */
}
\`\`\`

### CSS Customizado Avançado

**Scrollbars Elegantes**:
\`\`\`css
/* Scrollbar principal - minimalista */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 2px;
  transition: background-color 0.2s ease;
}

/* Scrollbar do chat - ainda mais sutil */
.chat-scroll::-webkit-scrollbar {
  width: 3px;
}

.chat-scroll::-webkit-scrollbar-thumb {
  background: hsl(var(--border) / 0.5);
}
\`\`\`

**Animações de Performance**:
\`\`\`css
/* Otimização para streaming */
.streaming-mode * {
  transition: none !important;
  animation-duration: 0s !important;
}

/* Animações GPU-aceleradas */
.optimize-gpu {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Contenção de layout */
.message-container {
  contain: layout style paint;
  will-change: auto;
}
\`\`\`

## 📱 Sistema de Responsividade

### Breakpoints Definidos
\`\`\`css
/* Mobile First Approach */
/* Base: 0px - 767px (Mobile) */
/* sm: 768px+ (Tablet) */
/* md: 1024px+ (Desktop) */
/* lg: 1280px+ (Large Desktop) */
/* xl: 1536px+ (Extra Large) */
\`\`\`

### Adaptações por Dispositivo

**Mobile (< 768px)**:
- ✅ Textarea com comportamento touch otimizado
- ✅ Botões com área de toque adequada (44px+)
- ✅ Scrolling com momentum nativo iOS
- ✅ Viewport height dinâmico (-webkit-fill-available)
- ✅ Teclado virtual handling

**Tablet (768px - 1023px)**:
- ✅ Layout híbrido mobile/desktop
- ✅ Sidebar colapsável
- ✅ Touch e mouse support

**Desktop (1024px+)**:
- ✅ Layout completo com sidebar
- ✅ Atalhos de teclado (Cmd+Enter, etc.)
- ✅ Hover states completos
- ✅ Múltiplas colunas quando apropriado

## 🔧 Serviços Detalhados

### 1. ChatService
**Padrão**: Singleton
**Responsabilidade**: Gerenciamento completo de múltiplos chats

**Métodos Principais**:
\`\`\`typescript
class ChatService {
  // Getters
  getChats(): Chat[]                           // Lista todos os chats
  getSelectedChat(): Chat | null               // Chat atualmente selecionado
  getSelectedChatId(): string | null           // ID do chat selecionado
  getChatMessages(chatId: string): Message[]   // Mensagens de um chat específico

  // Mutators
  createChat(title?: string): Chat             // Cria novo chat
  selectChat(chatId: string): void             // Seleciona chat existente
  updateChatTitle(chatId: string, newTitle: string): void  // Renomeia chat
  updateLastMessage(chatId: string, message: string): void // Atualiza preview
  deleteChat(chatId: string): void             // Remove chat e mensagens
  saveChatMessages(chatId: string, messages: Message[]): void // Persiste mensagens

  // Observers
  subscribe(listener: (chats: Chat[]) => void): () => void           // Observer para lista de chats
  subscribeToMessages(listener: (messages: Message[]) => void): () => void // Observer para mensagens
}
\`\`\`

**Persistência Atual**:
\`\`\`typescript
// localStorage keys
"chats" → Chat[]                    // Lista de chats
"chat-messages-{id}" → Message[]    // Mensagens por chat
\`\`\`

### 2. DecisionService
**Responsabilidade**: Simulação de processo de decisão de ferramentas MCP

**Categorias de Input**:
\`\`\`typescript
const CATEGORIES = {
  RESEARCH: ["sequencial-thinking", "fetch-content-tool"],
  BROWSING: ["browser-tools", "fetch-content-tool"], 
  COMPLEX_REASONING: ["sequencial-thinking", "Magic"],
  GENERAL: ["sequencial-thinking"]
}
\`\`\`

**Processo de Decisão**:
1. 🧠 Análise do input do usuário
2. 🏷️ Categorização baseada em palavras-chave
3. 🛠️ Seleção de ferramentas apropriadas
4. ⚡ Simulação de execução
5. 📊 Geração de resultados

### 3. MCPService (Preparado)
**Status**: Estrutura preparada para integração futura
**Responsabilidade**: Gerenciamento de servidores MCP reais

\`\`\`typescript
// Configuração atual (simulada)
const mcpServers = {
  "sequencial-thinking": { /* config */ },
  "browser-tools": { /* config */ },
  "fetch-content-tool": { /* config */ },
  "Magic": { /* config */ }
}

// Implementação futura
/*
class MCPService {
  async startServer(serverName: string): Promise<string>
  async stopServer(serverName: string): Promise<void>
  async executeCommand(server: string, command: string): Promise<any>
  getActiveServers(): string[]
}
*/
\`\`\`

## 🚀 Otimizações de Performance

### Renderização Otimizada
\`\`\`typescript
// Memoização de componentes pesados
const renderMessage = useCallback((message, index) => {
  // Renderização otimizada de mensagens
}, [isStreaming, expandedProcesses, isLoading])

// Virtualização preparada para muitas mensagens
const messages = useMemo(() => {
  if (isStreaming) {
    return originalMessages.filter(/* otimização */)
  }
  return originalMessages
}, [originalMessages, isStreaming])
\`\`\`

### Gerenciamento de Estado
\`\`\`typescript
// Estados derivados para evitar re-renders
const isLoadingOrThinking = isLoading || isThinking

// Debounce em inputs críticos
const handleInputChange = useCallback(
  debounce((value: string) => {
    // Lógica de input
  }, 100),
  []
)
\`\`\`

### Lazy Loading
\`\`\`typescript
// Componentes carregados sob demanda
const HeavyComponent = lazy(() => import('./HeavyComponent'))

// Imagens com loading otimizado
<img loading="lazy" src={src || "/placeholder.svg"} alt={alt} />
\`\`\`

## 🔐 Segurança Implementada

### Validações de Input
\`\`\`typescript
// Sanitização de mensagens
const sanitizeInput = (input: string) => {
  return input.trim().slice(0, 4000) // Limite de caracteres
}

// Validação de tipos TypeScript
interface MessageInput {
  content: string
  role: "user" | "assistant"
}
\`\`\`

### Proteção de API
\`\`\`typescript
// Rate limiting implícito via Groq API
// Validação de API key no servidor
if (!process.env.GROQ_API_KEY) {
  return new Response(JSON.stringify({
    error: "API key não configurada"
  }), { status: 500 })
}
\`\`\`

### Dados Sensíveis
- ✅ API keys apenas no servidor (não expostas ao cliente)
- ✅ Logs não contêm informações sensíveis
- ✅ Mensagens não persistidas no servidor (apenas localStorage)
- ✅ Escape automático de caracteres especiais no Markdown

## 📦 Dependências e Versões

### Core Dependencies
\`\`\`json
{
  "next": "14.2.16",                    // Framework React
  "react": "^19",                       // Biblioteca UI
  "typescript": "^5",                   // Tipagem estática
  "ai": "^4.0.0",                      // AI SDK da Vercel
  "@ai-sdk/groq": "^1.0.0",            // Integração Groq
  "@ai-sdk/react": "^0.0.62",          // Hooks React para AI
  "tailwindcss": "^3.4.17",            // Framework CSS
  "framer-motion": "^11.11.17",        // Animações
  "lucide-react": "^0.454.0",          // Ícones
  "next-themes": "^0.4.4",             // Gerenciamento de tema
  "react-markdown": "^8.0.7",          // Renderização Markdown
  "remark-gfm": "^4.0.0",              // GitHub Flavored Markdown
  "remark-emoji": "^4.0.1"             // Suporte a emojis
}
\`\`\`

### UI Components (shadcn/ui)
\`\`\`json
{
  "@radix-ui/react-*": "^1.x.x",       // Primitivos UI
  "class-variance-authority": "^0.7.1", // Variantes de classe
  "clsx": "^2.1.1",                    // Utilitário de classes
  "tailwind-merge": "^2.5.5",          // Merge de classes Tailwind
  "tailwindcss-animate": "^1.0.7"      // Animações Tailwind
}
\`\`\`

## 🔄 Estados da Aplicação Completos

### Estados Globais (ChatForm)
\`\`\`typescript
// Mensagens e chat
messages: Message[]                    // Mensagens do chat atual
input: string                         // Texto do textarea
isLoading: boolean                    // Carregamento da API
isStreaming: boolean                  // Streaming ativo
selectedModel: string                 // Modelo de IA selecionado
currentChatId: string                 // ID do chat atual

// Contextos e menções
messageContexts: MessageContext[]     // Contextos para menções
showMentionSelector: boolean          // Visibilidade do seletor
mentionQuery: string                  // Query da menção
cursorPosition: number                // Posição do cursor

// UI e interação
hasInteracted: boolean                // Primeira interação
activeButton: ActiveButton            // Botão ativo
hasTyped: boolean                     // Texto digitado
isTransitioning: boolean              // Transição de tela
attachmentMenuOpen: boolean           // Menu de anexos aberto

// Processos de pensamento
thinkingProcesses: Map<string, DecisionProcess>  // Processos por mensagem
expandedProcesses: Set<string>        // Processos expandidos
lastProcess: DecisionProcess | null   // Último processo
isThinking: boolean                   // Processamento ativo
currentThinkingMessageId: string | null  // ID da mensagem sendo processada

// Responsividade e dispositivo
isMobile: boolean                     // Detecção mobile
viewportHeight: number                // Altura da viewport

// Debug e desenvolvimento
debugInfo: string                     // Informações de debug
renderedMessageIds: Set<string>       // IDs renderizados
\`\`\`

### Tipos TypeScript Principais
\`\`\`typescript
interface Chat {
  id: string
  title: string
  lastMessage?: string
  timestamp: Date
  selected?: boolean
}

interface MessageContext {
  id: string
  summary: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface DecisionProcess {
  steps: ThoughtStep[]
  selectedMCPs: string[]
  currentStep: number
  completed: boolean
  results?: ResultItem[]
}

interface ThoughtStep {
  type: string
  content: string
  completed: boolean
  details?: string[]
}

type ActiveButton = "none" | "add" | "deepSearch" | "think" | "model"
\`\`\`

## 🎯 Roadmap de Melhorias Futuras

### Backend e Persistência
\`\`\`typescript
// 1. Sistema de Autenticação
/*
- NextAuth.js integration
- Google/GitHub OAuth
- JWT tokens
- User sessions
*/

// 2. Banco de Dados
/*
- PostgreSQL com Prisma ORM
- Tabelas: users, chats, messages, user_roles
- Migrations e seeds
- Backup automático
*/

// 3. API REST Completa
/*
POST /api/auth/signin
POST /api/auth/signout
GET /api/user/profile
PUT /api/user/profile
GET /api/chats
POST /api/chats
GET /api/chats/[id]
PUT /api/chats/[id]
DELETE /api/chats/[id]
GET /api/chats/[id]/messages
POST /api/chats/[id]/messages
*/
\`\`\`

### Features Avançadas
\`\`\`typescript
// 1. Busca e Filtros
/*
- Busca full-text em mensagens
- Filtros por data, tipo, modelo
- Tags e categorias
- Favoritos
*/

// 2. Colaboração
/*
- Compartilhamento de chats
- Comentários em mensagens
- Workspaces de equipe
- Permissões granulares
*/

// 3. Integrações
/*
- Slack/Discord bots
- API webhooks
- Zapier integration
- Export para PDF/Word
*/
\`\`\`

### Performance e Escalabilidade
\`\`\`typescript
// 1. Otimizações
/*
- Virtual scrolling para 1000+ mensagens
- Service Worker para cache
- PWA capabilities
- Offline support
*/

// 2. Monitoramento
/*
- Analytics de uso
- Error tracking (Sentry)
- Performance monitoring
- User feedback system
*/

// 3. Infraestrutura
/*
- CDN para assets
- Redis para cache
- Load balancing
- Auto-scaling
*/
\`\`\`

## 📊 Métricas e Monitoramento

### Performance Atual
- ⚡ First Contentful Paint: < 1.5s
- ⚡ Time to Interactive: < 2.5s
- ⚡ Cumulative Layout Shift: < 0.1
- ⚡ Largest Contentful Paint: < 2.5s

### Monitoramento Implementado
- 📊 System Status com logs exportáveis
- 📊 Connection health check
- 📊 Error boundaries em componentes críticos
- 📊 Console logging estruturado

### Métricas Futuras
\`\`\`typescript
/*
- User engagement metrics
- Chat completion rates
- Model performance comparison
- Error rates por endpoint
- Response time distribution
- User satisfaction scores
*/
\`\`\`

Esta documentação fornece uma visão completa e detalhada de toda a arquitetura, implementações e estrutura do sistema, servindo como base sólida para futuras expansões e melhorias.

