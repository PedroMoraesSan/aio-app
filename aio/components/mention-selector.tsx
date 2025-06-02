"use client"

import { motion, AnimatePresence } from "framer-motion"
import { User, Bot } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface MessageContext {
  id: string
  summary: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface MentionSelectorProps {
  isOpen: boolean
  query: string
  contexts: MessageContext[]
  onSelect: (context: MessageContext) => void
  onClose: () => void
}

export function MentionSelector({ isOpen, query, contexts, onSelect, onClose }: MentionSelectorProps) {
  // Filtrar contextos baseado na query
  const filteredContexts = contexts.filter((context) => context.summary.toLowerCase().includes(query.toLowerCase()))

  if (!isOpen || filteredContexts.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        className="absolute bottom-full left-4 right-4 mb-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border z-50 max-h-48"
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-2 border-b border-border">
          <h3 className="text-xs font-medium text-muted-foreground">Mencionar mensagem</h3>
        </div>
        <ScrollArea className="max-h-32">
          <div className="p-1">
            {filteredContexts.slice(0, 5).map((context, index) => (
              <motion.button
                key={context.id}
                className="w-full flex items-start gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors text-left"
                onClick={() => onSelect(context)}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {context.role === "user" ? (
                    <User className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Bot className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{context.summary}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {context.role === "user" ? "Você" : "Assistente"} •{" "}
                    {context.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </ScrollArea>
      </motion.div>
    </AnimatePresence>
  )
}
