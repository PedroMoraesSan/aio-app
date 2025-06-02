"use client"

import { useState } from "react"
import { MoreHorizontal, RefreshCcw, Share2, ThumbsUp, ThumbsDown, Edit2, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface MessageActionsProps {
  message: any
  onRegenerate: () => void
  isComplete: boolean
  isUser?: boolean
}

export function MessageActions({ message, onRegenerate, isComplete, isUser = false }: MessageActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isComplete) return null

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      // Adicionar feedback visual aqui se necessário
    } catch (err) {
      console.error("Falha ao copiar:", err)
    }
  }

  const userActions = [
    {
      icon: Edit2,
      label: "Editar mensagem",
      action: () => console.log("Editar mensagem"),
      shortcut: "E",
    },
    {
      icon: Copy,
      label: "Copiar texto",
      action: copyToClipboard,
      shortcut: "⌘C",
    },
    {
      icon: Trash2,
      label: "Excluir mensagem",
      action: () => console.log("Excluir mensagem"),
      destructive: true,
      shortcut: "Del",
    },
  ]

  const assistantActions = [
    {
      icon: RefreshCcw,
      label: "Regenerar resposta",
      action: onRegenerate,
      shortcut: "R",
    },
    {
      icon: Copy,
      label: "Copiar texto",
      action: copyToClipboard,
      shortcut: "⌘C",
    },
    {
      icon: Share2,
      label: "Compartilhar",
      action: () => console.log("Compartilhar mensagem"),
      shortcut: "S",
    },
    {
      icon: ThumbsUp,
      label: "Útil",
      action: () => console.log("Gostei da mensagem"),
      shortcut: "↑",
    },
    {
      icon: ThumbsDown,
      label: "Não útil",
      action: () => console.log("Não gostei da mensagem"),
      destructive: true,
      shortcut: "↓",
    },
  ]

  const actions = isUser ? userActions : assistantActions

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200",
            "hover:bg-secondary/80 hover:scale-105",
            "border border-transparent hover:border-border/50",
          )}
        >
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg"
        sideOffset={5}
      >
        {actions.map((action, index) => (
          <div key={index}>
            <DropdownMenuItem
              onClick={action.action}
              className={cn(
                "flex items-center justify-between px-3 py-2 cursor-pointer transition-colors",
                "hover:bg-secondary/80 focus:bg-secondary/80",
                action.destructive && "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
              )}
            >
              <div className="flex items-center gap-3">
                <action.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{action.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{action.shortcut}</span>
            </DropdownMenuItem>
            {index === 1 && !isUser && <DropdownMenuSeparator />}
            {index === 2 && isUser && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
