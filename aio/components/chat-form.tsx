"use client"

import type React from "react"
import { useCallback, useMemo } from "react"

import { cn } from "@/lib/utils"
import { useChat } from "ai/react"
import {
  ArrowUpIcon,
  Loader2,
  Search,
  Lightbulb,
  Plus,
  ChevronDown,
  ChevronUp,
  Brain,
  Square,
  Bot,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { useState, useEffect, useRef } from "react"
import { ThinkingProcess } from "@/components/thinking-process"
import { decisionService, type DecisionProcess } from "@/services/decision-service"
import { motion, AnimatePresence } from "framer-motion"
import { SuggestedPrompts } from "@/components/suggested-prompts"
import { ThemeToggle } from "@/components/theme-toggle"
import { ModelSelector } from "@/components/model-selector"
import { useTheme } from "next-themes"
import { TypingAnimation } from "@/components/typing-animation"
import { SystemStatus } from "@/components/system-status"
import { ChatDropdown } from "@/components/chat-dropdown"
import { AttachmentMenu } from "@/components/attachment-menu"
import { MentionText } from "@/components/mention-text"
import { MessageActions } from "@/components/message-actions"
import { JourneyMap } from "@/components/journey-map"
import { MentionSelector } from "@/components/mention-selector"
import { chatService } from "@/services/chat-service"

type ActiveButton = "none" | "add" | "deepSearch" | "think" | "model"

interface ChatFormProps extends React.ComponentProps<"form"> {
  userRoles?: string[]
  chatId?: string
  onMessageSent?: (message: string) => void
}

interface MessageContext {
  id: string
  summary: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export function ChatForm({ className, userRoles = [], chatId, onMessageSent, ...props }: ChatFormProps) {
  const { theme } = useTheme()
  const [selectedModel, setSelectedModel] = useState("groq:llama-3.1-70b-versatile")
  const [thinkingProcesses, setThinkingProcesses] = useState<Map<string, DecisionProcess>>(new Map())
  const [isThinking, setIsThinking] = useState(false)
  const [currentThinkingMessageId, setCurrentThinkingMessageId] = useState<string | null>(null)
  const [expandedProcesses, setExpandedProcesses] = useState<Set<string>>(new Set())
  const [hasInteracted, setHasInteracted] = useState(false)
  const [activeButton, setActiveButton] = useState<ActiveButton>("none")
  const [hasTyped, setHasTyped] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)
  const [lastProcess, setLastProcess] = useState<DecisionProcess | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const [renderedMessageIds, setRenderedMessageIds] = useState<Set<string>>(new Set())
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string>("default")
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false)
  const [messageContexts, setMessageContexts] = useState<MessageContext[]>([])
  const [showMentionSelector, setShowMentionSelector] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [cursorPosition, setCursorPosition] = useState(0)

  const {
    messages: originalMessages,
    input,
    setInput,
    append,
    isLoading,
    reload,
    stop,
    error,
    setMessages,
  } = useChat({
    api: "/api/chat",
    body: {
      model: selectedModel,
      userRoles,
    },
    onResponse: (response) => {
      console.log(`Resposta recebida: ${response.status}`)
      setDebugInfo((prev) => prev + `\nRecebida resposta: ${response.status}`)
      setIsStreaming(true)
    },
    onFinish: (message) => {
      console.log("Mensagem finalizada com sucesso")
      setDebugInfo((prev) => prev + `\nMensagem finalizada: ${message.id}`)

      // Adicionar contexto da mensagem
      const summary = generateMessageSummary(message.content)
      const newContext: MessageContext = {
        id: message.id,
        summary,
        content: message.content,
        role: message.role as "user" | "assistant",
        timestamp: new Date(),
      }
      setMessageContexts((prev) => [...prev, newContext])

      if (currentThinkingMessageId && message.id) {
        const process = thinkingProcesses.get(currentThinkingMessageId)
        if (process) {
          const completedProcess = { ...process, completed: true }
          setLastProcess(completedProcess)

          setThinkingProcesses((prev) => {
            const newMap = new Map(prev)
            newMap.set(message.id, completedProcess)
            newMap.set(currentThinkingMessageId, completedProcess)
            return newMap
          })

          setExpandedProcesses((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(currentThinkingMessageId)) {
              newSet.delete(currentThinkingMessageId)
              newSet.add(message.id)
            }
            return newSet
          })
        }
      }

      setIsStreaming(false)
      setBufferedMessages((prev) => [...prev, message])
      setIsThinking(false)
      setCurrentThinkingMessageId(null)
    },
    onError: (err) => {
      // Use setTimeout to avoid state updates during rendering
      setTimeout(() => {
        console.error("Erro no chat:", err)
        setDebugInfo((prev) => prev + `\nErro: ${err.message}`)
        setIsThinking(false)
        setCurrentThinkingMessageId(null)
        setIsStreaming(false)
      }, 0)
    },
  })

  const [isStreaming, setIsStreaming] = useState(false)
  const [bufferedMessages, setBufferedMessages] = useState<typeof originalMessages>([])

  const messages = useMemo(() => {
    if (isStreaming) {
      return originalMessages.filter((msg, index) => {
        if (msg.role === "assistant" && index === originalMessages.length - 1) {
          return false
        }
        return true
      })
    }
    return originalMessages
  }, [originalMessages, isStreaming])

  // Gerar resumo da mensagem para contexto
  const generateMessageSummary = (content: string): string => {
    const words = content.split(" ").slice(0, 8).join(" ")
    return words.length < content.length ? `${words}...` : words
  }

  // Atualizar contextos quando mensagens mudam
  useEffect(() => {
    const newContexts: MessageContext[] = []
    messages.forEach((message) => {
      if (message.id && !messageContexts.find((ctx) => ctx.id === message.id)) {
        const summary = generateMessageSummary(message.content)
        newContexts.push({
          id: message.id,
          summary,
          content: message.content,
          role: message.role as "user" | "assistant",
          timestamp: new Date(),
        })
      }
    })
    if (newContexts.length > 0) {
      setMessageContexts((prev) => [...prev, ...newContexts])
    }
  }, [messages])

  useEffect(() => {
    const checkMobileAndViewport = () => {
      const isMobileDevice = window.innerWidth < 768
      setIsMobile(isMobileDevice)
      const vh = window.innerHeight
      setViewportHeight(vh)
    }

    checkMobileAndViewport()
    window.addEventListener("resize", checkMobileAndViewport)

    return () => {
      window.removeEventListener("resize", checkMobileAndViewport)
    }
  }, [])

  const handleModelChange = useCallback(
    (newModel: string) => {
      if (newModel !== selectedModel) {
        setSelectedModel(newModel)
        console.log(`Modelo alterado para: ${newModel}`)
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
      }
      setActiveButton("none")
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 0)
    },
    [selectedModel],
  )

  // Modificar o handleChatChange para manter hasInteracted=true quando há mensagens
  const handleChatChange = useCallback(
    (chatId: string) => {
      // Salvar mensagens do chat atual antes de trocar
      if (currentChatId && messages.length > 0) {
        chatService.saveChatMessages(currentChatId, messages)
      }

      setCurrentChatId(chatId)
      chatService.selectChat(chatId)

      // Carregar mensagens do novo chat
      const chatMessages = chatService.getChatMessages(chatId)
      setMessages(chatMessages)

      // Limpar estados relacionados ao chat anterior
      setThinkingProcesses(new Map())
      setExpandedProcesses(new Set())
      setLastProcess(null)
      setIsThinking(false)
      setCurrentThinkingMessageId(null)
      setIsStreaming(false)
      setInput("")
      setHasTyped(false)
      setMessageContexts([])

      // Importante: Só voltar para welcome se não houver mensagens
      if (chatMessages.length === 0) {
        setHasInteracted(false)
      } else {
        // Se há mensagens, garantir que estamos na tela de chat
        setHasInteracted(true)
      }

      console.log(`Chat alterado para: ${chatId} com ${chatMessages.length} mensagens`)
    },
    [currentChatId, messages, setMessages],
  )

  const handleNewChat = useCallback(() => {
    // Salvar mensagens do chat atual antes de criar novo
    if (currentChatId && messages.length > 0) {
      chatService.saveChatMessages(currentChatId, messages)
    }

    const newChat = chatService.createChat()
    setCurrentChatId(newChat.id)

    // Limpar tudo para o novo chat
    setMessages([])
    setThinkingProcesses(new Map())
    setExpandedProcesses(new Set())
    setLastProcess(null)
    setIsThinking(false)
    setCurrentThinkingMessageId(null)
    setIsStreaming(false)
    setInput("")
    setHasTyped(false)
    setMessageContexts([])
    setHasInteracted(false)
  }, [currentChatId, messages, setMessages])

  // Adicione um useEffect para salvar mensagens automaticamente
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      chatService.saveChatMessages(currentChatId, messages)
    }
  }, [currentChatId, messages])

  const handleFileUpload = (files: FileList) => {
    // Implementar upload de arquivos
    console.log("Arquivos selecionados:", files)
    Array.from(files).forEach((file) => {
      console.log(`Arquivo: ${file.name}, Tipo: ${file.type}, Tamanho: ${file.size}`)
    })
    setAttachmentMenuOpen(false)
  }

  const handleMentionSelect = (context: MessageContext) => {
    const beforeCursor = input.substring(0, cursorPosition - mentionQuery.length - 1)
    const afterCursor = input.substring(cursorPosition)
    const newInput = `${beforeCursor}@${context.summary}${afterCursor}`
    setInput(newInput)
    setShowMentionSelector(false)
    setMentionQuery("")

    // Focar no textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newPosition = beforeCursor.length + context.summary.length + 1
        textareaRef.current.setSelectionRange(newPosition, newPosition)
      }
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!input.trim() || isLoading || isThinking) return

    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // Start transition if this is the first interaction
    if (!hasInteracted) {
      setIsTransitioning(true)
      setTimeout(() => {
        setHasInteracted(true)
        setIsTransitioning(false)
      }, 800) // Match the transition duration
    } else {
      setHasInteracted(true)
    }

    setHasTyped(false)
    setActiveButton("none")

    setIsThinking(true)
    const userMessage = input
    setInput("")

    // Adicionar contexto da mensagem do usuário
    const userSummary = generateMessageSummary(userMessage)
    const userContext: MessageContext = {
      id: `user-${Date.now()}`,
      summary: userSummary,
      content: userMessage,
      role: "user",
      timestamp: new Date(),
    }
    setMessageContexts((prev) => [...prev, userContext])

    if (onMessageSent) {
      onMessageSent(userMessage)
    }

    console.log(`Enviando mensagem: ${userMessage}`)
    setDebugInfo(`Enviando mensagem: ${userMessage}`)

    const tempMessageId = `thinking-${Date.now()}`
    setCurrentThinkingMessageId(tempMessageId)

    try {
      const process = await decisionService.decideTools(userMessage, userRoles)
      setThinkingProcesses((prev) => new Map(prev).set(tempMessageId, process))
      setExpandedProcesses((prev) => new Set(prev).add(tempMessageId))
      void append({ content: userMessage, role: "user" })
    } catch (error) {
      console.error("Erro ao processar mensagem:", error)
      setDebugInfo((prev) => prev + `\nErro ao processar: ${error}`)
      setIsThinking(false)
      setCurrentThinkingMessageId(null)
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    if (isMobile && textareaRef.current) {
      textareaRef.current.blur()
    } else if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleStopGeneration = () => {
    stop()
    setIsThinking(false)
    setCurrentThinkingMessageId(null)
    console.log("Geração interrompida pelo usuário")

    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault()
      if (formRef.current) {
        handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>)
      }
      return
    }

    if (!isMobile && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (formRef.current) {
        handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>)
      }
    }

    // Fechar mention selector com Escape
    if (e.key === "Escape" && showMentionSelector) {
      setShowMentionSelector(false)
      setMentionQuery("")
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)

    if (value.trim() !== "" && !hasTyped) {
      setHasTyped(true)
    } else if (value.trim() === "" && hasTyped) {
      setHasTyped(false)
    }

    // Detectar menções
    const textarea = textareaRef.current
    if (textarea) {
      const position = textarea.selectionStart
      setCursorPosition(position)

      const beforeCursor = value.substring(0, position)
      const mentionMatch = beforeCursor.match(/@(\w*)$/)

      if (mentionMatch) {
        setMentionQuery(mentionMatch[1])
        setShowMentionSelector(true)
      } else {
        setShowMentionSelector(false)
        setMentionQuery("")
      }
    }
  }

  const toggleButton = (button: ActiveButton) => {
    if (!isLoading && !isThinking) {
      setActiveButton((prev) => (prev === button ? "none" : button))

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
        }
      }, 0)
    }
  }

  const toggleProcessExpanded = useCallback((messageId: string) => {
    setExpandedProcesses((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(messageId)) {
        newSet.delete(messageId)
      } else {
        newSet.add(messageId)
      }
      return newSet
    })
  }, [])

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt)
    setHasTyped(true)
    setTimeout(() => {
      if (formRef.current) {
        handleSubmit(new Event("submit") as unknown as React.FormEvent<HTMLFormElement>)
      }
    }, 100)
  }

  useEffect(() => {
    if (messagesEndRef.current && !isLoading) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isLoading])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  const regenerateMessage = (messageIndex: number) => {
    if (isLoading || isThinking) return

    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    let userMessageContent = ""
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userMessageContent = messages[i].content
        break
      }
    }

    if (userMessageContent) {
      console.log("Regenerando mensagem")
      reload({
        messageId: messages[messageIndex].id,
        prompt: userMessageContent,
      })
    }
  }

  const getProcessForMessage = (message: any, index: number) => {
    const messageId = message.id || `${index}`

    if (message.id && thinkingProcesses.has(message.id)) {
      return thinkingProcesses.get(message.id)!
    }

    if (
      index === messages.length - 1 &&
      isLoading &&
      currentThinkingMessageId &&
      thinkingProcesses.has(currentThinkingMessageId)
    ) {
      return thinkingProcesses.get(currentThinkingMessageId)!
    }

    if (message.role === "assistant") {
      const availableProcesses = Array.from(thinkingProcesses.values())
      if (availableProcesses.length > 0) {
        return availableProcesses[availableProcesses.length - 1]
      }

      if (lastProcess) {
        return lastProcess
      }
    }

    return null
  }

  useEffect(() => {
    if (lastProcess && messages.length > 0) {
      setThinkingProcesses((prev) => {
        const newMap = new Map(prev)

        messages.forEach((message) => {
          if (message.role === "assistant" && message.id && !newMap.has(message.id)) {
            newMap.set(message.id, lastProcess)
          }
        })

        return newMap
      })
    }
  }, [messages, lastProcess])

  const renderSubmitButton = () => {
    const isLoadingOrThinking = isLoading || isThinking

    return (
      <Button
        type="submit"
        variant="outline"
        size="icon"
        onClick={isLoadingOrThinking ? handleStopGeneration : undefined}
        className={cn(
          "rounded-full h-7 w-7 border-0 flex-shrink-0 transition-all duration-300",
          isLoadingOrThinking
            ? "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 loading-button"
            : hasTyped
              ? "bg-primary dark:bg-primary loading-pulse"
              : "bg-secondary dark:bg-secondary",
        )}
        disabled={!isLoadingOrThinking && !input.trim()}
      >
        {isLoadingOrThinking ? (
          <Square className="h-3 w-3 text-white dark:text-white" />
        ) : (
          <ArrowUpIcon
            className={cn(
              "h-3.5 w-3.5 transition-all duration-300",
              hasTyped
                ? "text-primary-foreground dark:text-primary-foreground transform scale-110"
                : "text-muted-foreground dark:text-muted-foreground",
            )}
          />
        )}
        <span className="sr-only">{isLoadingOrThinking ? "Parar" : "Enviar"}</span>
      </Button>
    )
  }

  // Show error message if there's an error
  const errorMessage = error && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start gap-3">
        <div className="text-red-500">❌</div>
        <div>
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Erro na comunicação</h3>
          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
            Não foi possível conectar com o servidor. Verifique o status do sistema no canto superior direito.
          </p>
        </div>
      </div>
    </motion.div>
  )

  const welcomeScreen = (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center w-full h-full text-center px-4 sm:px-6 bg-background"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? -20 : 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <SystemStatus />
        <ThemeToggle />
      </div>

      <div className="max-w-2xl w-full mx-auto">
        <motion.h1
          className="text-4xl font-bold mb-2 text-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? -10 : 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        >
          {getGreeting()}.
        </motion.h1>

        <motion.h2
          className="text-3xl font-medium text-muted-foreground mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? -10 : 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          Como posso ajudar você hoje?
        </motion.h2>

        {errorMessage}

        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isTransitioning ? 0 : 1, y: isTransitioning ? -10 : 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <form ref={formRef} onSubmit={handleSubmit} className="relative w-full">
            <div className="relative bg-background/60 backdrop-blur-sm rounded-lg shadow-lg border border-border">
              {/* Área do textarea */}
              <div className="px-4 py-3">
                <AutoResizeTextarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="O que você quer saber?"
                  renderMentions={true}
                  className="min-h-[40px] max-h-[120px] w-full bg-transparent text-foreground placeholder:text-muted-foreground placeholder:text-sm focus-visible:outline-none text-sm resize-none overflow-hidden leading-relaxed px-4 py-2"
                />
              </div>

              {/* Footer com botões */}
              <div className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AttachmentMenu
                    isOpen={attachmentMenuOpen}
                    onToggle={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
                    onFileUpload={handleFileUpload}
                    disabled={isLoading || isThinking}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                      "rounded-full h-8 w-8 flex-shrink-0 border-border transition-colors",
                      activeButton === "add" && "bg-secondary border-border",
                    )}
                    onClick={() => toggleButton("add")}
                    disabled={isLoading || isThinking}
                  >
                    <Plus
                      className={cn("h-4 w-4 text-muted-foreground", activeButton === "add" && "text-foreground")}
                    />
                    <span className="sr-only">Add</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "rounded-full h-8 px-3 flex items-center border-border gap-1.5 transition-colors",
                      activeButton === "deepSearch" && "bg-secondary border-border",
                    )}
                    onClick={() => toggleButton("deepSearch")}
                    disabled={isLoading || isThinking}
                  >
                    <Search
                      className={cn(
                        "h-4 w-4 text-muted-foreground",
                        activeButton === "deepSearch" && "text-foreground",
                      )}
                    />
                    <span className={cn("text-foreground text-sm", activeButton === "deepSearch" && "font-medium")}>
                      DeepSearch
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "rounded-full h-8 px-3 flex items-center border-border gap-1.5 transition-colors",
                      activeButton === "think" && "bg-secondary border-border",
                    )}
                    onClick={() => toggleButton("think")}
                    disabled={isLoading || isThinking}
                  >
                    <Lightbulb
                      className={cn("h-4 w-4 text-muted-foreground", activeButton === "think" && "text-foreground")}
                    />
                    <span className={cn("text-foreground text-sm", activeButton === "think" && "font-medium")}>
                      Think
                    </span>
                  </Button>

                  {/* Model Selector */}
                  <ModelSelector
                    value={selectedModel}
                    onChange={handleModelChange}
                    buttonClassName="h-8 px-3 gap-1 text-xs font-normal text-muted-foreground rounded-full"
                    disabled={isLoading || isThinking}
                  />
                </div>

                {renderSubmitButton()}
              </div>
            </div>

            <SuggestedPrompts userRoles={userRoles} onSelectPrompt={handleSelectPrompt} />
          </form>
        </motion.div>
      </div>
    </motion.div>
  )

  const renderMessage = useCallback(
    (message: any, index: number) => {
      const process = getProcessForMessage(message, index)
      const messageId = message.id || `${index}`
      const isMessageComplete = !isLoading || message.id !== originalMessages[originalMessages.length - 1]?.id

      return (
        <motion.div
          key={messageId}
          data-role={message.role}
          className={cn("group relative message-container", message.role === "assistant" ? "self-start" : "self-end")}
        >
          {/* Conteúdo da mensagem */}
          <div className={cn("flex flex-col", message.role === "assistant" ? "items-start" : "items-end")}>
            {/* Título da mensagem */}
            <div className="message-title">
              {message.role === "assistant" ? (
                <>
                  <div className="message-title-icon message-title-assistant">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <span>Assistente</span>
                </>
              ) : (
                <>
                  <div className="message-title-icon message-title-user">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span>Você</span>
                </>
              )}
            </div>

            {/* Botões de ação */}
            {message.role === "assistant" && (
              <div className="mb-2 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleProcessExpanded(messageId)}
                  className="h-7 px-3 py-1 text-xs font-normal flex items-center gap-1.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border"
                >
                  {isLoading && index === messages.length - 1 ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Brain className="h-3.5 w-3.5 mr-1" />
                  )}
                  Processo de pensamento
                  {expandedProcesses.has(messageId) ? (
                    <ChevronUp className="h-3.5 w-3.5 ml-1" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  )}
                </Button>

                <MessageActions
                  message={message}
                  onRegenerate={() => regenerateMessage(index)}
                  isComplete={isMessageComplete}
                />
              </div>
            )}

            {message.role === "user" && (
              <div className="mb-2 flex items-center gap-2">
                <MessageActions
                  message={message}
                  onRegenerate={() => regenerateMessage(index)}
                  isComplete={isMessageComplete}
                  isUser={true}
                />
              </div>
            )}

            {message.role === "assistant" && process && expandedProcesses.has(messageId) && (
              <div className="mb-4">
                <ThinkingProcess process={process} isVisible={true} hideToggle={true} />
              </div>
            )}

            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all duration-300 message-bubble",
                message.role === "assistant"
                  ? "bg-secondary text-foreground rounded-bl-md border border-border"
                  : "bg-primary text-primary-foreground rounded-br-md",
              )}
            >
              {message.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2 prose-headings:my-2">
                  <TypingAnimation content={message.content} isComplete={isMessageComplete} />
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words leading-relaxed">
                  <MentionText text={message.content} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )
    },
    [isStreaming, expandedProcesses, isLoading, originalMessages, toggleProcessExpanded],
  )

  const chatScreen = (
    <motion.div
      className="fixed inset-0 flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Fixed header */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-20 border-b border-border py-3 px-6 header-blur"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <ChatDropdown currentChatId={currentChatId} onChatChange={handleChatChange} onNewChat={handleNewChat} />

          {/* Journey Map no centro */}
          <div className="flex-1 flex justify-center">
            <JourneyMap messages={messages} />
          </div>

          <div className="flex items-center gap-2">
            <SystemStatus />
            <ThemeToggle />
          </div>
        </div>
      </motion.div>

      {/* Fixed chat container */}
      <div className="fixed inset-0 pt-16 pb-32 flex items-center justify-center">
        <div className="w-full max-w-4xl h-full flex flex-col">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 chat-scroll">
            <motion.div
              className="max-w-3xl mx-auto py-6 flex flex-col gap-6"
              ref={chatContainerRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {errorMessage}

              {messages.map((message, index) => {
                return renderMessage(message, index)
              })}

              {isStreaming && (
                <div className="self-start max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm bg-secondary text-foreground rounded-bl-md border border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Gerando resposta...</span>
                  </div>
                </div>
              )}

              {process.env.NODE_ENV === "development" && debugInfo && (
                <div className="p-2 bg-muted rounded text-xs font-mono whitespace-pre-wrap">{debugInfo}</div>
              )}

              <div ref={messagesEndRef} />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fixed textarea at bottom - floating style */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <div className="max-w-4xl mx-auto p-6">
          <form ref={formRef} onSubmit={handleSubmit} className="relative w-full">
            <div className="relative bg-background/60 backdrop-blur-sm rounded-lg shadow-lg border border-border">
              {/* Mention Selector */}
              <MentionSelector
                isOpen={showMentionSelector}
                query={mentionQuery}
                contexts={messageContexts}
                onSelect={handleMentionSelect}
                onClose={() => setShowMentionSelector(false)}
              />

              {/* Área do textarea */}
              <div className="px-4 py-3">
                <AutoResizeTextarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={isLoading || isThinking ? "Aguardando resposta..." : "O que você quer saber?"}
                  renderMentions={true}
                  className="min-h-[40px] max-h-[120px] w-full bg-transparent text-foreground placeholder:text-muted-foreground placeholder:text-sm focus-visible:outline-none text-sm resize-none overflow-hidden leading-relaxed px-4 py-2"
                />
              </div>

              {/* Footer com botões */}
              <div className="px-4 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AttachmentMenu
                    isOpen={attachmentMenuOpen}
                    onToggle={() => setAttachmentMenuOpen(!attachmentMenuOpen)}
                    onFileUpload={handleFileUpload}
                    disabled={isLoading || isThinking}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn(
                      "rounded-full h-8 w-8 flex-shrink-0 border-border transition-colors",
                      activeButton === "add" && "bg-secondary border-border",
                    )}
                    onClick={() => toggleButton("add")}
                    disabled={isLoading || isThinking}
                  >
                    <Plus
                      className={cn("h-4 w-4 text-muted-foreground", activeButton === "add" && "text-foreground")}
                    />
                    <span className="sr-only">Add</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "rounded-full h-8 px-3 flex items-center border-border gap-1.5 transition-colors",
                      activeButton === "deepSearch" && "bg-secondary border-border",
                    )}
                    onClick={() => toggleButton("deepSearch")}
                    disabled={isLoading || isThinking}
                  >
                    <Search
                      className={cn(
                        "h-4 w-4 text-muted-foreground",
                        activeButton === "deepSearch" && "text-foreground",
                      )}
                    />
                    <span className={cn("text-foreground text-sm", activeButton === "deepSearch" && "font-medium")}>
                      DeepSearch
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "rounded-full h-8 px-3 flex items-center border-border gap-1.5 transition-colors",
                      activeButton === "think" && "bg-secondary border-border",
                    )}
                    onClick={() => toggleButton("think")}
                    disabled={isLoading || isThinking}
                  >
                    <Lightbulb
                      className={cn("h-4 w-4 text-muted-foreground", activeButton === "think" && "text-foreground")}
                    />
                    <span className={cn("text-foreground text-sm", activeButton === "think" && "font-medium")}>
                      Think
                    </span>
                  </Button>

                  {/* Model Selector */}
                  <ModelSelector
                    value={selectedModel}
                    onChange={handleModelChange}
                    buttonClassName="h-8 px-3 gap-1 text-xs font-normal text-muted-foreground rounded-full"
                    disabled={isLoading || isThinking}
                  />
                </div>

                {renderSubmitButton()}
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <TooltipProvider>
      <main
        className={cn(
          "ring-none mx-auto flex h-svh max-h-svh w-full flex-col items-stretch border-none",
          isStreaming && "streaming-mode",
          className,
        )}
        {...props}
      >
        <AnimatePresence mode="wait">
          {!hasInteracted || messages.length === 0 ? (
            <motion.div key="welcome">{welcomeScreen}</motion.div>
          ) : (
            <motion.div key="chat">{chatScreen}</motion.div>
          )}
        </AnimatePresence>
      </main>
    </TooltipProvider>
  )
}
