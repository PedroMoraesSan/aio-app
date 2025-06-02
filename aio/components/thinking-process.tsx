"use client"

import { motion } from "framer-motion"
import { Check, Loader2, Search, Globe, Brain, Terminal, ChevronDown } from "lucide-react"
import type { DecisionProcess } from "@/services/decision-service"

interface ThinkingProcessProps {
  process: DecisionProcess | null
  isVisible: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
  hideToggle?: boolean
}

export function ThinkingProcess({
  process,
  isVisible,
  isExpanded = true,
  onToggleExpand,
  hideToggle = false,
}: ThinkingProcessProps) {
  if (!process || !isVisible) return null

  const getToolIcon = (tool: string) => {
    switch (tool) {
      case "sequencial-thinking":
        return <Brain className="h-3 w-3" />
      case "browser-tools":
        return <Globe className="h-3 w-3" />
      case "fetch-content-tool":
        return <Search className="h-3 w-3" />
      case "Magic":
        return <Terminal className="h-3 w-3" />
      default:
        return <Check className="h-3 w-3" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-accent/30 text-foreground rounded-xl p-4 mb-4 max-w-[90%] self-start border border-border shadow-sm"
    >
      {!hideToggle && (
        <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={onToggleExpand}>
          <div className="bg-primary rounded-full p-2 shadow-sm">
            {process.completed ? (
              <Check className="h-4 w-4 text-primary-foreground" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">Processamento Inteligente</h3>
            <p className="text-xs text-muted-foreground">
              {process.completed ? "Análise concluída" : `Etapa ${process.currentStep + 1} de ${process.steps.length}`}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-muted-foreground"
          >
            <ChevronDown className="h-4 w-4" />
          </motion.div>
        </div>
      )}

      {hideToggle && (
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-primary rounded-full p-2 shadow-sm">
            {process.completed ? (
              <Check className="h-4 w-4 text-primary-foreground" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm text-foreground">Processamento Inteligente</h3>
            <p className="text-xs text-muted-foreground">
              {process.completed ? "Análise concluída" : `Etapa ${process.currentStep + 1} de ${process.steps.length}`}
            </p>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-3 overflow-hidden">
          {process.steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{
                opacity: index <= process.currentStep ? 1 : 0.5,
              }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className="mt-1">
                {step.completed ? (
                  <div className="bg-green-500 rounded-full p-1 shadow-sm">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                ) : index === process.currentStep ? (
                  <div className="bg-primary rounded-full p-1 shadow-sm">
                    <Loader2 className="h-3 w-3 animate-spin text-primary-foreground" />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-border bg-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{step.content}</p>
                {step.details && (
                  <ul className="mt-1 space-y-1">
                    {step.details.map((detail, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          ))}

          {process.selectedMCPs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 pt-3 border-t border-border"
            >
              <p className="text-xs font-medium text-muted-foreground mb-2">Ferramentas Ativadas:</p>
              <div className="flex flex-wrap gap-2">
                {process.selectedMCPs.map((mcp) => (
                  <motion.span
                    key={mcp}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="px-2 py-1 bg-secondary rounded-md text-xs font-medium flex items-center gap-1.5 border border-border"
                  >
                    <span className="bg-primary rounded-full p-0.5 flex items-center justify-center">
                      {getToolIcon(mcp)}
                    </span>
                    <span className="text-foreground">{mcp}</span>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}

          {process.results && process.results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 pt-3 border-t border-border"
            >
              <p className="text-xs font-medium text-muted-foreground mb-2">Resultados Obtidos:</p>
              <div className="space-y-2">
                {process.results.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="text-xs bg-secondary p-2.5 rounded-lg border border-border"
                  >
                    <p className="font-medium text-foreground">{result.source}</p>
                    <p className="mt-1 text-muted-foreground leading-relaxed">{result.content}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  )
}
