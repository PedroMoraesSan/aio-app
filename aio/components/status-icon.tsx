"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, AlertCircle, CheckCircle, X, ChevronDown, ChevronUp, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface StatusIconProps {
  status: "idle" | "loading" | "success" | "error"
  logs: string[]
  onExportLogs?: () => void
  className?: string
}

export function StatusIcon({ status, logs, onExportLogs, className }: StatusIconProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusIcon = () => {
    switch (status) {
      case "idle":
        return <Activity className="h-4 w-4 text-gray-500" />
      case "loading":
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case "idle":
        return "bg-gray-100 dark:bg-gray-800"
      case "loading":
        return "bg-blue-100 dark:bg-blue-900/30"
      case "success":
        return "bg-green-100 dark:bg-green-900/30"
      case "error":
        return "bg-red-100 dark:bg-red-900/30"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "idle":
        return "Sistema pronto"
      case "loading":
        return "Processando..."
      case "success":
        return "Operação concluída"
      case "error":
        return "Erro detectado"
    }
  }

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "h-8 px-3 rounded-full flex items-center gap-2 border-border transition-colors",
          getStatusColor(),
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        {getStatusIcon()}
        <span className="text-xs font-medium">{getStatusText()}</span>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="text-sm font-medium">Status do Sistema</h3>
              <div className="flex items-center gap-2">
                {onExportLogs && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onExportLogs} title="Exportar logs">
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsExpanded(!isExpanded)}>
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-2 h-2 rounded-full", status === "error" ? "bg-red-500" : "bg-green-500")} />
                <span className="text-xs font-medium">
                  API Groq: {status === "error" ? "Erro de conexão" : "Conectado"}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-2 h-2 rounded-full", "bg-green-500")} />
                <span className="text-xs font-medium">Ambiente: {process.env.NODE_ENV || "development"}</span>
              </div>

              {isExpanded && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-medium">Logs do Sistema:</h4>
                    <span className="text-xs text-muted-foreground">{logs.length} entradas</span>
                  </div>
                  <ScrollArea className="h-40 w-full rounded border border-border bg-muted/20 p-2">
                    <div className="space-y-1">
                      {logs.length > 0 ? (
                        logs.map((log, index) => (
                          <div key={index} className="text-xs font-mono whitespace-pre-wrap break-words">
                            {log}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-muted-foreground italic">Nenhum log disponível</div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted/20">
              <div className="text-xs text-muted-foreground">
                {status === "error" ? (
                  <span className="text-red-500">Erro detectado. Verifique os logs para mais informações.</span>
                ) : (
                  <span>Sistema funcionando normalmente.</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
