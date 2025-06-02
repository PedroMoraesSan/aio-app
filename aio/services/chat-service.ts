import type { Chat } from "@/components/sidebar"

// Função para gerar um ID único
const generateId = () => Math.random().toString(36).substring(2, 10)

// Função para salvar chats no localStorage
const saveChats = (chats: Chat[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("chats", JSON.stringify(chats))
  }
}

// Função para carregar chats do localStorage
const loadChats = (): Chat[] => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("chats")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.map((chat: any) => ({
          ...chat,
          timestamp: new Date(chat.timestamp),
        }))
      } catch (e) {
        console.error("Erro ao carregar chats:", e)
      }
    }
  }
  return []
}

// Função para salvar mensagens de um chat específico
const saveChatMessages = (chatId: string, messages: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(`chat-messages-${chatId}`, JSON.stringify(messages))
  }
}

// Função para carregar mensagens de um chat específico
const loadChatMessages = (chatId: string): any[] => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(`chat-messages-${chatId}`)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error("Erro ao carregar mensagens do chat:", e)
      }
    }
  }
  return []
}

export class ChatService {
  private chats: Chat[] = []
  private selectedChatId: string | null = null
  private listeners: ((chats: Chat[]) => void)[] = []
  private messageListeners: ((messages: any[]) => void)[] = []

  constructor() {
    this.chats = loadChats()

    // Se não houver chats, criar um padrão
    if (this.chats.length === 0) {
      this.createChat()
    } else {
      // Selecionar o primeiro chat por padrão
      this.selectedChatId = this.chats[0].id
      this.updateSelectedState()
    }
  }

  getChats(): Chat[] {
    return this.chats
  }

  getSelectedChat(): Chat | null {
    return this.chats.find((chat) => chat.id === this.selectedChatId) || null
  }

  getSelectedChatId(): string | null {
    return this.selectedChatId
  }

  getChatMessages(chatId: string): any[] {
    return loadChatMessages(chatId)
  }

  saveChatMessages(chatId: string, messages: any[]): void {
    saveChatMessages(chatId, messages)

    // Atualizar última mensagem do chat
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      this.updateLastMessage(chatId, lastMessage.content)
    }
  }

  createChat(title?: string): Chat {
    const newChat: Chat = {
      id: generateId(),
      title: title || `Nova conversa ${this.chats.length + 1}`,
      timestamp: new Date(),
      selected: true,
    }

    // Desmarcar o chat selecionado anteriormente
    this.chats = this.chats.map((chat) => ({
      ...chat,
      selected: false,
    }))

    // Adicionar o novo chat
    this.chats = [newChat, ...this.chats]
    this.selectedChatId = newChat.id

    this.saveAndNotify()
    return newChat
  }

  selectChat(chatId: string): void {
    const previousChatId = this.selectedChatId

    // Salvar mensagens do chat anterior se houver
    if (previousChatId && this.messageListeners.length > 0) {
      // As mensagens serão salvas pelo componente que está escutando
    }

    this.selectedChatId = chatId
    this.updateSelectedState()
    this.saveAndNotify()

    // Notificar listeners sobre mudança de mensagens
    const messages = this.getChatMessages(chatId)
    this.notifyMessageListeners(messages)
  }

  updateChatTitle(chatId: string, newTitle: string): void {
    this.chats = this.chats.map((chat) => (chat.id === chatId ? { ...chat, title: newTitle } : chat))
    this.saveAndNotify()
  }

  updateLastMessage(chatId: string, message: string): void {
    this.chats = this.chats.map((chat) =>
      chat.id === chatId
        ? {
            ...chat,
            lastMessage: message.length > 30 ? message.substring(0, 30) + "..." : message,
            timestamp: new Date(),
          }
        : chat,
    )
    this.saveAndNotify()
  }

  deleteChat(chatId: string): void {
    // Verificar se estamos excluindo o chat selecionado
    const isSelectedChat = this.selectedChatId === chatId

    // Remover mensagens do chat
    if (typeof window !== "undefined") {
      localStorage.removeItem(`chat-messages-${chatId}`)
    }

    // Remover o chat
    this.chats = this.chats.filter((chat) => chat.id !== chatId)

    // Se excluímos o chat selecionado e ainda há outros chats, selecionar o primeiro
    if (isSelectedChat && this.chats.length > 0) {
      this.selectedChatId = this.chats[0].id
      this.updateSelectedState()

      // Carregar mensagens do novo chat selecionado
      const messages = this.getChatMessages(this.selectedChatId)
      this.notifyMessageListeners(messages)
    } else if (this.chats.length === 0) {
      // Se não há mais chats, criar um novo
      this.createChat()
      this.notifyMessageListeners([])
      return
    }

    this.saveAndNotify()
  }

  subscribe(listener: (chats: Chat[]) => void): () => void {
    this.listeners.push(listener)

    // Notificar imediatamente com o estado atual
    listener(this.chats)

    // Retornar função para cancelar a inscrição
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  subscribeToMessages(listener: (messages: any[]) => void): () => void {
    this.messageListeners.push(listener)

    // Notificar imediatamente com as mensagens do chat atual
    if (this.selectedChatId) {
      const messages = this.getChatMessages(this.selectedChatId)
      listener(messages)
    }

    // Retornar função para cancelar a inscrição
    return () => {
      this.messageListeners = this.messageListeners.filter((l) => l !== listener)
    }
  }

  private updateSelectedState(): void {
    this.chats = this.chats.map((chat) => ({
      ...chat,
      selected: chat.id === this.selectedChatId,
    }))
  }

  private saveAndNotify(): void {
    saveChats(this.chats)
    this.notifyListeners()
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.chats]))
  }

  private notifyMessageListeners(messages: any[]): void {
    this.messageListeners.forEach((listener) => listener([...messages]))
  }
}

// Exportar uma instância singleton
export const chatService = new ChatService()
