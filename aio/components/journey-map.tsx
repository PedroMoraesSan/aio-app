"use client"

import { motion } from "framer-motion"
import { User, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface JourneyMapProps {
  messages: any[]
  className?: string
}

export function JourneyMap({ messages, className }: JourneyMapProps) {
  if (messages.length === 0) return null

  return (
    <motion.div
      className={cn("bg-background/80 backdrop-blur-sm border border-border/30 rounded-lg px-4 py-2", className)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">Jornada:</span>
        <div className="flex items-center gap-1">
          {messages.slice(-6).map((message, index) => (
            <motion.div
              key={message.id || index}
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                message.role === "user" ? "bg-blue-100 dark:bg-blue-900/30" : "bg-green-100 dark:bg-green-900/30",
                index === messages.slice(-6).length - 1 && "ring-2 ring-primary/30",
              )}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {message.role === "user" ? (
                <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              ) : (
                <Bot className="h-3 w-3 text-green-600 dark:text-green-400" />
              )}
            </motion.div>
          ))}
          {messages.length > 6 && <span className="text-xs text-muted-foreground ml-1">+{messages.length - 6}</span>}
        </div>
      </div>
    </motion.div>
  )
}
