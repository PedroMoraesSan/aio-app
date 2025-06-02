"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkEmoji from "remark-emoji"

interface TypingAnimationProps {
  content: string
  isComplete: boolean
  className?: string
}

export function TypingAnimation({ content, isComplete, className = "" }: TypingAnimationProps) {
  const [displayedContent, setDisplayedContent] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)

  // Quando o conteúdo muda ou está completo, inicia a animação
  useEffect(() => {
    if (content && isComplete && !animationComplete) {
      setIsAnimating(true)

      // Velocidade otimizada - menos frames por segundo
      const typingSpeed = 20 // Aumentado para mostrar mais caracteres por vez
      const frameDelay = 50 // Aumentado o delay entre frames

      let currentIndex = 0
      const totalLength = content.length

      const animateTyping = () => {
        if (currentIndex < totalLength) {
          const charsToAdd = Math.min(typingSpeed, totalLength - currentIndex)
          const nextContent = content.substring(0, currentIndex + charsToAdd)
          setDisplayedContent(nextContent)
          currentIndex += charsToAdd

          setTimeout(animateTyping, frameDelay)
        } else {
          setIsAnimating(false)
          setAnimationComplete(true)
        }
      }

      // Usar requestAnimationFrame para melhor performance
      requestAnimationFrame(animateTyping)
    } else if (!isComplete) {
      setDisplayedContent("")
      setAnimationComplete(false)
    }
  }, [content, isComplete, animationComplete])

  // Se a animação estiver completa ou não for necessária, mostra o conteúdo completo
  if (animationComplete || (!isAnimating && isComplete)) {
    return (
      <motion.div
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkEmoji]}
          components={{
            // Melhor formatação para títulos
            h1: ({ children }) => (
              <h1 className="text-xl font-bold mt-6 mb-4 text-foreground border-b border-border pb-2">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg font-semibold mt-5 mb-3 text-foreground border-b border-border/50 pb-1">
                {children}
              </h2>
            ),
            h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
            h4: ({ children }) => <h4 className="text-sm font-semibold mt-3 mb-2 text-foreground">{children}</h4>,
            // Melhor formatação para tabelas
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="min-w-full border-collapse border border-border rounded-lg overflow-hidden">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-secondary/50 dark:bg-secondary/30">{children}</thead>,
            th: ({ children }) => (
              <th className="border border-border px-4 py-2 text-left font-semibold text-foreground bg-secondary/30">
                {children}
              </th>
            ),
            td: ({ children }) => <td className="border border-border px-4 py-2 text-foreground">{children}</td>,
            // Melhor formatação para código
            code: ({ inline, children, ...props }) => {
              if (inline) {
                return (
                  <code
                    className="bg-secondary/60 dark:bg-secondary/40 text-foreground px-1.5 py-0.5 rounded text-sm font-mono border border-border/50"
                    {...props}
                  >
                    {children}
                  </code>
                )
              }
              return (
                <code
                  className="block bg-secondary/60 dark:bg-secondary/40 text-foreground p-4 rounded-lg font-mono text-sm border border-border overflow-x-auto"
                  {...props}
                >
                  {children}
                </code>
              )
            },
            // Melhor formatação para blockquotes
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-primary/50 pl-4 py-2 my-4 bg-secondary/20 dark:bg-secondary/10 rounded-r-lg italic text-muted-foreground">
                {children}
              </blockquote>
            ),
            // Melhor formatação para listas
            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-3 text-foreground">{children}</ul>,
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 my-3 text-foreground">{children}</ol>
            ),
            li: ({ children }) => <li className="text-foreground leading-relaxed">{children}</li>,
            // Melhor formatação para parágrafos
            p: ({ children }) => <p className="text-foreground leading-relaxed my-2">{children}</p>,
            // Melhor formatação para links
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            // Melhor formatação para texto em negrito e itálico
            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
            em: ({ children }) => <em className="italic text-foreground">{children}</em>,
            // Melhor formatação para separadores
            hr: () => <hr className="border-border my-6" />,
          }}
        >
          {content}
        </ReactMarkdown>
      </motion.div>
    )
  }

  // Durante a animação, mostra o conteúdo parcial
  return (
    <motion.div
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkEmoji]}
        components={{
          // Mesmos componentes customizados para a animação
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-6 mb-4 text-foreground border-b border-border pb-2">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mt-5 mb-3 text-foreground border-b border-border/50 pb-1">
              {children}
            </h2>
          ),
          h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-semibold mt-3 mb-2 text-foreground">{children}</h4>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-border rounded-lg overflow-hidden">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-secondary/50 dark:bg-secondary/30">{children}</thead>,
          th: ({ children }) => (
            <th className="border border-border px-4 py-2 text-left font-semibold text-foreground bg-secondary/30">
              {children}
            </th>
          ),
          td: ({ children }) => <td className="border border-border px-4 py-2 text-foreground">{children}</td>,
          code: ({ inline, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="bg-secondary/60 dark:bg-secondary/40 text-foreground px-1.5 py-0.5 rounded text-sm font-mono border border-border/50"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code
                className="block bg-secondary/60 dark:bg-secondary/40 text-foreground p-4 rounded-lg font-mono text-sm border border-border overflow-x-auto"
                {...props}
              >
                {children}
              </code>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/50 pl-4 py-2 my-4 bg-secondary/20 dark:bg-secondary/10 rounded-r-lg italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-3 text-foreground">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-3 text-foreground">{children}</ol>,
          li: ({ children }) => <li className="text-foreground leading-relaxed">{children}</li>,
          p: ({ children }) => <p className="text-foreground leading-relaxed my-2">{children}</p>,
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground">{children}</em>,
          hr: () => <hr className="border-border my-6" />,
        }}
      >
        {displayedContent}
      </ReactMarkdown>
      {isAnimating && (
        <span
          className="inline-block w-0.5 h-4 ml-1 bg-current opacity-75"
          style={{ animation: "blink 1s infinite" }}
        />
      )}
    </motion.div>
  )
}
