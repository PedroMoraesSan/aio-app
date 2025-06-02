"use client"

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'

interface MessageContext {
  id: string
  summary: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface OptimizedChatOptions {
  selectedModel: string
  userRoles: string[]
  onMessageSent?: (message: string) => void
}

// Implementação simples de debounce sem dependência externa
function debounce<T extends (...args: any[]) => void>(func: T, delay: number): T {
  let timeoutId: NodeJS.Timeout
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }) as T
}

export function useOptimizedChat({
  selectedModel,
  userRoles,
  onMessageSent
}: OptimizedChatOptions) {
  // Estados centralizados e otimizados
  const [chatState, setChatState] = useState({
    isThinking: false,
    currentThinkingMessageId: null as string | null,
    hasInteracted: false,
    activeButton: "none" as "none" | "add" | "deepSearch" | "think" | "model",
    hasTyped: false,
    attachmentMenuOpen: false,
    showMentionSelector: false,
    mentionQuery: "",
    cursorPosition: 0,
  })

  const [messageContexts, setMessageContexts] = useState<MessageContext[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")

  // Refs para performance
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Função de geração de resumo memoizada
  const generateMessageSummary = useCallback((content: string): string => {
    const words = content.split(" ").slice(0, 8).join(" ")
    return words.length < content.length ? `${words}...` : words
  }, [])

  // Hook do chat com callbacks otimizados
  const chatHook = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
      userRoles,
    },
    onResponse: useCallback((response: Response) => {
      console.log(`Resposta recebida: ${response.status}`)
      setDebugInfo((prev) => prev + `\nRecebida resposta: ${response.status}`)
      setIsStreaming(true)
    }, []),
    onFinish: useCallback((message: any) => {
      console.log("Mensagem finalizada com sucesso")
      setDebugInfo((prev) => prev + `\nMensagem finalizada: ${message.id}`)

      // Gerar contexto da mensagem de forma otimizada
      const summary = generateMessageSummary(message.content)
      const newContext: MessageContext = {
        id: message.id,
        summary,
        content: message.content,
        role: message.role as "user" | "assistant",
        timestamp: new Date(),
      }
      
      setMessageContexts((prev) => [...prev, newContext])
      setIsStreaming(false)
      
      setChatState(prev => ({
        ...prev,
        isThinking: false,
        currentThinkingMessageId: null
      }))

      onMessageSent?.(message.content)
    }, [onMessageSent, generateMessageSummary]),
    onError: useCallback((error: Error) => {
      setTimeout(() => {
        console.error("Erro no chat:", error)
        setDebugInfo((prev) => prev + `\nErro: ${error.message}`)
        setChatState(prev => ({
          ...prev,
          isThinking: false,
          currentThinkingMessageId: null
        }))
        setIsStreaming(false)
      }, 0)
    }, []),
  })

  // Debounced input handler para performance
  const debouncedInputChange = useMemo(
    () => debounce((value: string) => {
      // Detectar menções
      const mentionMatch = value.match(/@(\w*)$/)
      if (mentionMatch) {
        setChatState(prev => ({
          ...prev,
          showMentionSelector: true,
          mentionQuery: mentionMatch[1]
        }))
      } else {
        setChatState(prev => ({
          ...prev,
          showMentionSelector: false,
          mentionQuery: ""
        }))
      }
      
      setChatState(prev => ({
        ...prev,
        hasTyped: value.length > 0
      }))
    }, 150),
    []
  )

  // Input handler otimizado
  const handleInputChange = useCallback((value: string) => {
    chatHook.setInput(value)
    debouncedInputChange(value)
    
    setChatState(prev => ({
      ...prev,
      hasInteracted: true
    }))
  }, [chatHook.setInput, debouncedInputChange])

  // Submit handler otimizado
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!chatHook.input.trim() || chatHook.isLoading) return

    setChatState(prev => ({
      ...prev,
      isThinking: true,
      hasTyped: false
    }))

    await chatHook.append({
      role: "user",
      content: chatHook.input,
    })
  }, [chatHook.input, chatHook.isLoading, chatHook.append])

  // State updaters otimizados
  const updateChatState = useCallback((updates: Partial<typeof chatState>) => {
    setChatState(prev => ({ ...prev, ...updates }))
  }, [])

  // Mensagens processadas com memoização
  const processedMessages = useMemo(() => {
    if (isStreaming) {
      return chatHook.messages.filter((msg, index) => {
        if (msg.role === "assistant" && index === chatHook.messages.length - 1) {
          return false
        }
        return true
      })
    }
    return chatHook.messages
  }, [chatHook.messages, isStreaming])

  // Auto-scroll otimizado
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [processedMessages.length])

  return {
    // Chat hook original
    ...chatHook,
    
    // Estados otimizados
    chatState,
    updateChatState,
    messageContexts,
    isStreaming,
    debugInfo,
    
    // Mensagens processadas
    messages: processedMessages,
    
    // Handlers otimizados
    handleInputChange,
    handleSubmit,
    
    // Refs
    textareaRef,
    messagesEndRef,
    chatContainerRef,
    
    // Utils
    generateMessageSummary,
  }
} 