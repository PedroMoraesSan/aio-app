# Estrutura do Sistema de Chat - Documentação Técnica

## 📋 Visão Geral
Sistema de chat inteligente com IA usando Next.js, AI SDK, Groq API e interface moderna com Tailwind CSS.

## 🏗️ Arquitetura Frontend

### 📁 Estrutura de Pastas
\`\`\`
/
├── app/
│   ├── layout.tsx              # Layout principal da aplicação
│   ├── page.tsx                # Página inicial com seletor de roles
│   ├── globals.css             # Estilos globais e customizações
│   └── api/
│       ├── chat/
│       │   └── route.ts        # API route para chat com Groq
│       └── check-connection/
│           └── route.ts        # API route para verificar conexão
├── components/
│   ├── ui/                     # Componentes base do shadcn/ui
│   ├── chat-form.tsx           # Componente principal do chat
│   ├── message-actions.tsx     # Ações das mensagens (dropdown)
│   ├── mention-text.tsx        # Renderização de menções
│   ├── mention-selector.tsx    # Seletor de menções
│   ├── journey-map.tsx         # Mapa da jornada do usuário
│   ├── attachment-menu.tsx     # Menu de anexos
│   ├── thinking-process.tsx    # Visualização do processo de pensamento
│   ├── system-status.tsx       # Status do sistema
│   ├── status-icon.tsx         # Ícone de status com logs
│   ├── typing-animation.tsx    # Animação de digitação
│   ├── theme-provider.tsx      # Provedor de tema
│   ├── theme-toggle.tsx        # Toggle de tema
│   ├── model-selector.tsx      # Seletor de modelos
│   ├── chat-dropdown.tsx       # Dropdown de chats
│   ├── role-selector.tsx       # Seletor de áreas profissionais
│   ├── suggested-prompts.tsx   # Prompts sugeridos
│   ├── copy-to-clipboard.tsx   # Componente de cópia
│   ├── autoresize-textarea.tsx # Textarea com redimensionamento
│   └── sidebar.tsx             # Sidebar (não utilizada atualmente)
├── services/
│   ├── chat-service.ts         # Serviço de gerenciamento de chats
│   ├── decision-service.ts     # Serviço de decisão de ferramentas MCP
│   └── mcp-service.ts          # Serviço MCP (Model Context Protocol)
├── config/
│   └── mcp-servers.json        # Configuração dos servidores MCP
├── hooks/
│   ├── use-mobile.tsx          # Hook para detecção mobile
│   └── use-toast.ts            # Hook para toasts
└── lib/
    └── utils.ts                # Utilitários (cn function)
\`\`\`

## 🔧 Componentes Principais

### 1. ChatForm (`components/chat-form.tsx`)
**Responsabilidade**: Componente principal que gerencia toda a interface do chat
**Estado Principal**:
- `messages`: Lista de mensagens do chat
- `input`: Texto atual do textarea
- `isLoading`: Estado de carregamento
- `selectedModel`: Modelo de IA selecionado
- `messageContexts`: Contextos das mensagens para menções
- `thinkingProcesses`: Processos de pensamento das mensagens

**Funcionalidades**:
- Envio e recebimento de mensagens
- Sistema de menções com `@`
- Seleção de modelos de IA
- Upload de arquivos
- Animações de transição
- Gerenciamento de estado do chat

### 2. Sistema de Menções
**Componentes**:
- `MentionText`: Renderiza texto com menções estilizadas
- `MentionSelector`: Interface para seleção de mensagens para mencionar

**Fluxo**:
1. Usuário digita `@` no textarea
2. Sistema detecta e abre `MentionSelector`
3. Lista mensagens anteriores filtradas por query
4. Usuário seleciona mensagem
5. Texto é inserido como `@{resumo da mensagem}`

### 3. Sistema de Ações de Mensagem
**Componente**: `MessageActions`
**Funcionalidades**:
- Dropdown com ações contextuais
- Ações para usuário: Editar, Excluir
- Ações para assistente: Regenerar, Compartilhar, Like/Dislike, Copiar

### 4. Journey Map
**Componente**: `JourneyMap`
**Funcionalidade**: Visualização lateral da jornada do usuário no chat
**Características**:
- Posicionamento absoluto (não interfere no layout)
- Lista cronológica de mensagens
- Indicadores visuais por tipo de mensagem
- Efeitos de hover elegantes

## 🔄 Fluxo de Dados

### 1. Envio de Mensagem
\`\`\`
Usuário digita → handleInputChange → detecta menções → 
handleSubmit → append (AI SDK) → API route → Groq API → 
streaming response → onFinish → atualiza contextos
\`\`\`

### 2. Sistema de Contextos
\`\`\`
Nova mensagem → generateMessageSummary → 
MessageContext criado → adicionado ao estado → 
disponível para menções
\`\`\`

### 3. Processo de Pensamento
\`\`\`
Mensagem enviada → DecisionService.decideTools → 
ThinkingProcess criado → exibido durante carregamento → 
finalizado com resposta
\`\`\`

## 🌐 Backend/API

### 1. API Routes

#### `/api/chat` (POST)
**Responsabilidade**: Processar mensagens do chat
**Input**:
\`\`\`typescript
{
  messages: CoreMessage[],
  model: string,
  userRoles?: string[]
}
\`\`\`
**Output**: Stream de texto da resposta da IA
**Integração**: Groq API via AI SDK

#### `/api/check-connection` (GET)
**Responsabilidade**: Verificar conectividade com Groq API
**Output**:
\`\`\`typescript
{
  success: boolean,
  message?: string,
  error?: string,
  modelInfo?: object,
  debug?: object
}
\`\`\`

### 2. Variáveis de Ambiente
\`\`\`env
GROQ_API_KEY=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
NODE_ENV=development
\`\`\`

### 3. Modelos Disponíveis
- `groq:llama-3.1-70b-versatile` (padrão)
- `groq:llama-3.1-8b-instant`
- `groq:llama-3.3-70b-versatile`
- `groq:mixtral-8x7b-32768`

## 🎨 Sistema de Temas

### Paleta de Cores
**Tema Claro**: Baseado em tons bege/marrom (#ffeec9)
**Tema Escuro**: Baseado em tons escuros (#1a0e00)

### CSS Customizado
- Scrollbars elegantes e minimalistas
- Animações suaves para transições
- Efeitos de hover para mensagens
- Estilização especial para menções
- Loading states animados

## 📱 Responsividade

### Breakpoints
- Mobile: < 768px
- Desktop: ≥ 768px

### Adaptações Mobile
- Textarea com comportamento diferenciado
- Botões otimizados para touch
- Scrolling otimizado
- Viewport height dinâmico

## 🔧 Serviços

### 1. ChatService
**Responsabilidade**: Gerenciamento de múltiplos chats
**Funcionalidades**:
- Criar/deletar chats
- Alternar entre chats
- Persistência no localStorage
- Gerenciamento de estado

### 2. DecisionService
**Responsabilidade**: Simular decisão de ferramentas MCP
**Funcionalidades**:
- Categorizar input do usuário
- Selecionar ferramentas apropriadas
- Gerar processo de pensamento visual
- Simular execução de ferramentas

### 3. MCPService
**Responsabilidade**: Gerenciar servidores MCP (futuro)
**Status**: Preparado para integração futura

## 🚀 Performance

### Otimizações Implementadas
- Lazy loading de componentes
- Memoização com `useCallback` e `useMemo`
- Debounce em inputs
- Streaming de respostas
- GPU acceleration para animações
- Contenção de layout para mensagens

### Monitoramento
- Logs do sistema exportáveis em JSON
- Status de conexão em tempo real
- Debug info em desenvolvimento

## 🔐 Segurança

### Validações
- Sanitização de inputs
- Validação de tipos TypeScript
- Rate limiting implícito via Groq API
- Escape de caracteres especiais

### Dados Sensíveis
- API keys apenas no servidor
- Logs não contêm dados sensíveis
- Mensagens não persistidas no servidor

## 📦 Dependências Principais

### Core
- `next`: Framework React
- `react`: Biblioteca UI
- `typescript`: Tipagem estática

### AI/Chat
- `ai`: AI SDK da Vercel
- `@ai-sdk/groq`: Integração Groq
- `@ai-sdk/react`: Hooks React para AI

### UI/Styling
- `tailwindcss`: Framework CSS
- `framer-motion`: Animações
- `lucide-react`: Ícones
- `next-themes`: Gerenciamento de tema

### Markdown/Text
- `react-markdown`: Renderização Markdown
- `remark-gfm`: GitHub Flavored Markdown
- `remark-emoji`: Suporte a emojis

## 🔄 Estados da Aplicação

### Estados Globais (ChatForm)
\`\`\`typescript
// Mensagens e chat
messages: Message[]
input: string
isLoading: boolean
isStreaming: boolean

// Contextos e menções
messageContexts: MessageContext[]
showMentionSelector: boolean
mentionQuery: string

// UI e interação
hasInteracted: boolean
activeButton: ActiveButton
hasTyped: boolean
selectedModel: string

// Processos de pensamento
thinkingProcesses: Map<string, DecisionProcess>
expandedProcesses: Set<string>
\`\`\`

### Tipos Principais
\`\`\`typescript
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
\`\`\`

## 🎯 Próximos Passos Recomendados

### Backend
1. Implementar persistência real de chats
2. Sistema de autenticação
3. Rate limiting customizado
4. Integração MCP real
5. Suporte a múltiplos provedores de IA

### Frontend
1. PWA capabilities
2. Offline support
3. Busca em mensagens
4. Exportação de conversas
5. Compartilhamento de chats

### Performance
1. Virtual scrolling para muitas mensagens
2. Compressão de imagens
3. Lazy loading de componentes pesados
4. Service worker para cache

Esta documentação fornece uma visão completa da arquitetura atual e serve como base para futuras expansões do sistema.
\`\`\`

Implementei todas as melhorias solicitadas:

## ✨ **Principais Implementações:**

### 1. **Scrollbar Elegante e Minimalista**
- **Largura reduzida**: 3-4px para máxima elegância
- **Cores sutis**: Usando variáveis CSS do tema
- **Hover effects**: Transições suaves
- **Classe específica**: `.chat-scroll` para o chat principal

### 2. **Sistema de Ações com Dropdown**
- **Componente MessageActions**: Dropdown com três pontos
- **Ações contextuais**: Diferentes para usuário vs assistente
- **Integração elegante**: Aparece ao lado dos botões de pensamento
- **Animações suaves**: Fade in/out com framer-motion

### 3. **Estilização Melhorada de Menções**
- **CSS avançado**: Gradientes, bordas, sombras
- **Efeitos shimmer**: Animação de brilho no hover
- **Responsivo**: Funciona em tema claro e escuro
- **Classe `.mention`**: Estilização completa no CSS

### 4. **Sistema Completo de Menções**
- **Detecção automática**: Regex para detectar `@` no textarea
- **MentionSelector**: Dropdown com mensagens disponíveis
- **Contextos automáticos**: Geração de resumos das mensagens
- **Integração backend**: Preparado para enviar contexto referenciado

### 5. **Botão de Carregamento Elegante**
- **Efeito shimmer**: Animação de brilho durante carregamento
- **Pulse animation**: Quando há texto digitado
- **Transições suaves**: 300ms para todas as mudanças
- **Estados visuais**: Diferentes cores para cada estado

### 6. **Hover Effects para Mensagens**
- **Classe `.message-hover`**: Efeito de elevação sutil
- **Transform**: `translateY(-1px)` no hover
- **Box shadow**: Sombras elegantes adaptadas ao tema
- **Transições**: Cubic-bezier para movimento natural

### 7. **Journey Map Vertical**
- **Posicionamento absoluto**: `fixed left-4 top-1/2`
- **Não interfere no layout**: Totalmente independente
- **Visualização da jornada**: Timeline vertical das mensagens
- **Hover effects**: Movimento horizontal no hover
- **Indicador ativo**: Ponto destacando mensagem atual

### 8. **Documentação Completa (Estrutura.md)**
- **Arquitetura detalhada**: Frontend e backend
- **Fluxo de dados**: Como as informações circulam
- **Componentes**: Responsabilidades e funcionalidades
- **Estados**: Tipos TypeScript e gerenciamento
- **Performance**: Otimizações implementadas
- **Próximos passos**: Roadmap para melhorias

## 🎯 **Funcionalidades Implementadas:**

### Sistema de Menções:
- **Detecção em tempo real** ao digitar `@`
- **Seletor inteligente** com busca por query
- **Contextos automáticos** de todas as mensagens
- **Estilização premium** com gradientes e animações

### Journey Map:
- **Timeline visual** da conversa
- **Ícones diferenciados** para usuário/assistente
- **Timestamps** e resumos das mensagens
- **Indicador de posição atual**

### Ações de Mensagem:
- **Dropdown contextual** com três pontos
- **Ações específicas** por tipo de mensagem
- **Integração com CopyToClipboard**
- **Feedback visual** adequado

### Performance e UX:
- **Scrollbars minimalistas** em todo o sistema
- **Animações fluidas** com cubic-bezier
- **Estados de carregamento** elegantes
- **Responsividade** mantida

A interface agora está completamente moderna, funcional e elegante, com todos os sistemas integrados e documentação completa para futuras expansões!
