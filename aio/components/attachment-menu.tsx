"use client"

import type React from "react"

import { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Paperclip, ImageIcon, FileText, Mic, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AttachmentMenuProps {
  isOpen: boolean
  onToggle: () => void
  onFileUpload: (files: FileList) => void
  disabled?: boolean
}

export function AttachmentMenu({ isOpen, onToggle, onFileUpload, disabled = false }: AttachmentMenuProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (type: "file" | "image") => {
    if (type === "image" && imageInputRef.current) {
      imageInputRef.current.click()
    } else if (type === "file" && fileInputRef.current) {
      fileInputRef.current.click()
    }
    onToggle()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileUpload(files)
    }
    // Reset input
    e.target.value = ""
  }

  const attachmentOptions = [
    {
      id: "image",
      label: "Imagem",
      icon: ImageIcon,
      accept: "image/*",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      id: "file",
      label: "Arquivo",
      icon: FileText,
      accept: ".pdf,.doc,.docx,.txt,.csv,.xlsx",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      id: "audio",
      label: "Áudio",
      icon: Mic,
      accept: "audio/*",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      id: "camera",
      label: "Câmera",
      icon: Camera,
      accept: "image/*",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ]

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "rounded-full h-8 w-8 flex-shrink-0 border-border transition-colors",
          isOpen && "bg-secondary border-border",
        )}
        onClick={onToggle}
        disabled={disabled}
      >
        <Paperclip className={cn("h-4 w-4 text-muted-foreground", isOpen && "text-foreground")} />
        <span className="sr-only">Anexar arquivo</span>
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
              onClick={onToggle}
            />

            {/* Menu */}
            <motion.div
              className="absolute bottom-full left-0 mb-2 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border z-50 p-2"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-2 w-48">
                {attachmentOptions.map((option) => (
                  <motion.button
                    key={option.id}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-lg transition-colors hover:bg-secondary/50",
                      option.bgColor,
                    )}
                    onClick={() => handleFileSelect(option.id as "file" | "image")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <option.icon className={cn("h-5 w-5", option.color)} />
                    <span className="text-xs font-medium text-foreground">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
        multiple
        onChange={handleFileChange}
      />
      <input ref={imageInputRef} type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
    </div>
  )
}
