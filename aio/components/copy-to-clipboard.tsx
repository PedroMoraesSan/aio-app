"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

interface CopyToClipboardProps {
  text: string
  className?: string
}

export function CopyToClipboard({ text, className = "" }: CopyToClipboardProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)

      // Add vibration feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }

      setTimeout(() => setIsCopied(false), 2000) // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <button
      onClick={copyToClipboard}
      className={`
        group
        inline-flex items-center justify-center rounded-md 
        bg-transparent px-2 py-1 text-sm font-medium
        hover:bg-gray-100 dark:hover:bg-gray-700
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary 
        transition-all duration-300 ease-in-out
        ${isCopied ? "text-green-600 dark:text-green-400" : "text-gray-400 hover:text-gray-600 dark:text-gray-300"}
        ${className}
      `}
      aria-label="Copy to clipboard"
    >
      <span className="relative w-4 h-4">
        <Copy
          className={`
          absolute inset-0 w-4 h-4 
          transition-all duration-300 ease-in-out
          ${isCopied ? "opacity-0 scale-50" : "opacity-100 scale-100"}
        `}
        />
        <Check
          className={`
          absolute inset-0 w-4 h-4 
          transition-all duration-300 ease-in-out
          ${isCopied ? "opacity-100 scale-100" : "opacity-0 scale-50"}
        `}
        />
      </span>
    </button>
  )
}
