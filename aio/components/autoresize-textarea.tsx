"use client"

import { cn } from "@/lib/utils"
import { useRef, useEffect, type TextareaHTMLAttributes, forwardRef } from "react"

interface AutoResizeTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange"> {
  value: string
  onChange: (value: string) => void
  renderMentions?: boolean
}

export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(
  ({ className, value, onChange, renderMentions = false, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null)

    const combinedRef = (node: HTMLTextAreaElement) => {
      internalRef.current = node
      if (typeof ref === "function") {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    const resizeTextarea = () => {
      const textarea = internalRef.current
      if (textarea) {
        textarea.style.height = "auto"
        const newHeight = Math.max(40, Math.min(textarea.scrollHeight, 120))
        textarea.style.height = `${newHeight}px`
      }
    }

    useEffect(() => {
      resizeTextarea()
    }, [value])

    // Função para destacar menções no texto
    const highlightMentions = (text: string) => {
      if (!renderMentions) return text

      // Substituir @mentions por spans estilizados
      return text.replace(
        /@([^\s@]+)/g,
        '<span class="bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground px-1 rounded">@$1</span>',
      )
    }

    return (
      <textarea
        {...props}
        value={value}
        ref={combinedRef}
        rows={1}
        onChange={(e) => {
          onChange(e.target.value)
          resizeTextarea()
        }}
        className={cn(
          "resize-none min-h-[40px] max-h-[120px] w-full outline-none",
          "text-sm leading-relaxed tracking-normal",
          "placeholder:text-muted-foreground",
          "overflow-hidden", // Remove scrollbar
          className,
        )}
      />
    )
  },
)

AutoResizeTextarea.displayName = "AutoResizeTextarea"
