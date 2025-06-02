"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageSquare, Plus, ChevronDown, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { chatService } from "@/services/chat-service"

interface Chat {
  id: string
  title: string
  timestamp: Date
  selected: boolean
  lastMessage?: string
}

interface ChatDropdownProps {
  currentChatId: string
  onChatChange: (chatId: string) => void
  onNewChat: () => void
}

export function ChatDropdown({ currentChatId, onChatChange, onNewChat }: ChatDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  useEffect(() => {
    const unsubscribe = chatService.subscribe((updatedChats) => {
      setChats(updatedChats)
    })

    return unsubscribe
  }, [])

  const activeChat = chats.find((chat) => chat.id === currentChatId) || chats[0]

  const createNewChat = () => {
    setIsOpen(false)
    onNewChat()
  }

  const selectChat = (chatId: string) => {
    setIsOpen(false)
    onChatChange(chatId)
  }

  const deleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (chats.length <= 1) return // Não permitir deletar o último chat

    chatService.deleteChat(chatId)
  }

  const startEditing = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingChatId(chat.id)
    setEditTitle(chat.title)
  }

  const saveEdit = () => {
    if (editTitle.trim() && editingChatId) {
      chatService.updateChatTitle(editingChatId, editTitle.trim())
    }
    setEditingChatId(null)
    setEditTitle("")
  }

  const cancelEdit = () => {
    setEditingChatId(null)
    setEditTitle("")
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Agora"
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        className="h-9 px-3 rounded-lg flex items-center gap-2 hover:bg-secondary/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground max-w-[200px] truncate">
          {activeChat?.title || "Chat"}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              className="absolute top-full left-0 mt-2 w-80 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-foreground">Conversas</h3>
                  <Button variant="ghost" size="sm" className="h-7 px-2 rounded-md" onClick={createNewChat}>
                    <Plus className="h-4 w-4" />
                    <span className="ml-1 text-xs">Novo</span>
                  </Button>
                </div>
              </div>

              {/* Chat List */}
              <div className="max-h-64 overflow-y-auto">
                {chats.map((chat) => (
                  <motion.div
                    key={chat.id}
                    className={cn(
                      "group flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors cursor-pointer",
                      chat.id === currentChatId && "bg-secondary/50",
                    )}
                    onClick={() => !editingChatId && selectChat(chat.id)}
                    layout
                  >
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      {editingChatId === chat.id ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit()
                            if (e.key === "Escape") cancelEdit()
                          }}
                          onBlur={saveEdit}
                          className="h-6 px-2 py-1 text-xs"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div>
                          <div className="text-sm font-medium text-foreground truncate">{chat.title}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{formatTimestamp(chat.timestamp)}</span>
                            {chat.lastMessage && <span>• {chat.lastMessage}</span>}
                          </div>
                        </div>
                      )}
                    </div>

                    {editingChatId !== chat.id && (
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md"
                          onClick={(e) => startEditing(chat, e)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        {chats.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md text-red-500 hover:text-red-600"
                            onClick={(e) => deleteChat(chat.id, e)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border bg-secondary/20">
                <div className="text-xs text-muted-foreground text-center">
                  {chats.length} conversa{chats.length !== 1 ? "s" : ""}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
