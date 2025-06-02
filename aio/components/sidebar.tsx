"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Plus, MessageSquare, MoreVertical, Edit2, Trash2, Settings } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export interface Chat {
  id: string
  title: string
  lastMessage?: string
  timestamp: Date
  selected?: boolean
}

interface SidebarProps {
  chats: Chat[]
  onSelectChat: (chatId: string) => void
  onCreateChat: () => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, newTitle: string) => void
  className?: string
}

export function Sidebar({ chats, onSelectChat, onCreateChat, onDeleteChat, onRenameChat, className }: SidebarProps) {
  // Mudança: iniciar com sidebar fechada por padrão
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const { theme } = useTheme()

  const handleRenameStart = (chat: Chat) => {
    setEditingChatId(chat.id)
    setEditTitle(chat.title)
  }

  const handleRenameSubmit = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim())
    }
    setEditingChatId(null)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoje"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem"
    } else {
      return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col border-r border-border/10 dark:border-gray-700/50 bg-background dark:bg-gray-900/95 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[50px]" : "w-[280px]",
        className,
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-border/10 dark:border-gray-700/50">
        {!isCollapsed && <h2 className="text-lg font-semibold text-foreground dark:text-white">Conversas</h2>}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", isCollapsed ? "mx-auto" : "ml-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="p-2">
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 bg-secondary/30 hover:bg-secondary/50 dark:bg-gray-800/50 dark:hover:bg-gray-800/80",
            isCollapsed && "justify-center px-2",
          )}
          onClick={onCreateChat}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span>Nova conversa</span>}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <AnimatePresence initial={false}>
            {chats.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className={cn(
                    "group flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                    chat.selected
                      ? "bg-secondary/80 dark:bg-gray-800/90 text-foreground dark:text-white"
                      : "hover:bg-secondary/50 dark:hover:bg-gray-800/50 text-muted-foreground dark:text-gray-300",
                    isCollapsed && "justify-center",
                  )}
                >
                  <Button
                    variant="ghost"
                    className={cn("h-full w-full justify-start p-0 font-normal", isCollapsed && "justify-center")}
                    onClick={() => onSelectChat(chat.id)}
                  >
                    <MessageSquare className={cn("h-4 w-4 mr-2 flex-shrink-0", isCollapsed && "mr-0")} />
                    {!isCollapsed && (
                      <>
                        {editingChatId === chat.id ? (
                          <form
                            className="flex-1"
                            onSubmit={(e) => {
                              e.preventDefault()
                              handleRenameSubmit(chat.id)
                            }}
                          >
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="h-7 px-2 py-1 text-xs"
                              autoFocus
                              onBlur={() => handleRenameSubmit(chat.id)}
                            />
                          </form>
                        ) : (
                          <div className="flex flex-col items-start overflow-hidden">
                            <span className="truncate w-full">{chat.title}</span>
                            {chat.lastMessage && (
                              <span className="text-xs text-muted-foreground dark:text-gray-400 truncate w-full">
                                {chat.lastMessage}
                              </span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </Button>

                  {!isCollapsed && !editingChatId && (
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleRenameStart(chat)}>
                            <Edit2 className="h-3.5 w-3.5 mr-2" />
                            Renomear
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300"
                            onClick={() => onDeleteChat(chat.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="p-2 border-t border-border/10 dark:border-gray-700/50">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2 text-muted-foreground dark:text-gray-300",
            isCollapsed && "justify-center px-2",
          )}
        >
          <Settings className="h-4 w-4" />
          {!isCollapsed && <span>Configurações</span>}
        </Button>
      </div>
    </div>
  )
}
