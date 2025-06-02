"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { ModelSelector } from "@/components/model-selector"

interface ChatHeaderProps {
  selectedModel: string
  onModelChange: (model: string) => void
}

export function ChatHeader({ selectedModel, onModelChange }: ChatHeaderProps) {
  return (
    <motion.div
      className="sticky top-0 z-10 border-b border-border/10 dark:border-gray-700/50 py-3 px-4 flex items-center justify-between"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <ModelSelector
          value={selectedModel}
          onChange={onModelChange}
          buttonClassName="h-8 gap-1 text-xs font-normal dark:text-gray-300"
        />
      </div>

      <ThemeToggle />
    </motion.div>
  )
}
