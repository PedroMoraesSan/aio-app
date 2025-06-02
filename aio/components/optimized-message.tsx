"use client"

import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkEmoji from 'remark-emoji'
import { User, Bot } from 'lucide-react'
import { MentionText } from './mention-text'
import { MessageActions } from './message-actions'
import { ThinkingProcess } from './thinking-process'

interface OptimizedMessageProps {
  message: any
  index: number
  isLast: boolean
  onRegenerate?: (index: number) => void
  thinkingProcess?: any
  expandedProcesses?: Set<string>
  onToggleProcess?: (messageId: string) => void
}

export const OptimizedMessage = memo(function OptimizedMessage({
  message,
  index,
  isLast,
  onRegenerate,
  thinkingProcess,
  expandedProcesses,
  onToggleProcess
}: OptimizedMessageProps) {
  // Memoizar conteúdo da mensagem
  const messageContent = useMemo(() => {
    if (message.role === 'user') {
      return <MentionText text={message.content} />
    }
    
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkEmoji]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="mb-2 last:mb-0">{children}</ul>,
            ol: ({ children }) => <ol className="mb-2 last:mb-0">{children}</ol>,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    )
  }, [message.content, message.role])

  // Memoizar variantes de animação
  const motionVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }), [])

  // Memoizar ícone do usuário
  const userIcon = useMemo(() => (
    <div className="message-title-icon message-title-user">
      <User size={12} />
    </div>
  ), [])

  // Memoizar ícone do assistente
  const assistantIcon = useMemo(() => (
    <div className="message-title-icon message-title-assistant">
      <Bot size={12} />
    </div>
  ), [])

  // Handler para regenerar mensagem
  const handleRegenerate = useMemo(() => {
    return onRegenerate ? () => onRegenerate(index) : () => {}
  }, [onRegenerate, index])

  return (
    <motion.div
      variants={motionVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="message-bubble optimize-gpu group"
    >
      <div className="flex gap-3 p-4">
        {message.role === 'user' ? userIcon : assistantIcon}
        
        <div className="flex-1 min-w-0">
          <div className="message-title">
            {message.role === 'user' ? 'Você' : 'Assistente'}
          </div>
          
          {messageContent}
          
          {/* Thinking Process */}
          {thinkingProcess && (
            <div className="mt-2">
              <ThinkingProcess
                process={thinkingProcess}
                isVisible={true}
                isExpanded={expandedProcesses?.has(message.id) || false}
              />
            </div>
          )}
        </div>
        
        {/* Message Actions */}
        <div className="flex-shrink-0">
          <MessageActions
            message={message}
            onRegenerate={handleRegenerate}
            isComplete={true}
            isUser={message.role === 'user'}
          />
        </div>
      </div>
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renders desnecessários
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.index === nextProps.index &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.thinkingProcess === nextProps.thinkingProcess &&
    prevProps.expandedProcesses === nextProps.expandedProcesses
  )
}) 