"use client"

import { useState, useEffect } from "react"
import { StatusIcon } from "@/components/status-icon"

interface SystemStatusProps {
  className?: string
}

export function SystemStatus({ className }: SystemStatusProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [logs, setLogs] = useState<string[]>([])
  const [apiStatus, setApiStatus] = useState<"checking" | "connected" | "error">("checking")

  // Add a log entry with timestamp
  const addLog = (message: string, type: "info" | "error" | "success" = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = type === "error" ? "❌ " : type === "success" ? "✅ " : "ℹ️ "
    setLogs((prev) => [`[${timestamp}] ${prefix}${message}`, ...prev.slice(0, 99)])
  }

  // Export logs as JSON
  const exportLogs = () => {
    const logData = {
      timestamp: new Date().toISOString(),
      status: status,
      apiStatus: apiStatus,
      logs: logs,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
      systemInfo: {
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
      },
    }

    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `system-logs-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addLog("Logs exportados com sucesso", "success")
  }

  // Check API connection
  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        setStatus("loading")
        addLog("Verificando conexão com a API Groq...")

        const response = await fetch("/api/check-connection")
        const data = await response.json()

        console.log("Connection check response:", data)

        if (data.success) {
          setApiStatus("connected")
          setStatus("success")
          addLog("Conexão com a API Groq estabelecida com sucesso", "success")
          if (data.modelInfo?.model) {
            addLog(`Modelo testado: ${data.modelInfo.model}`, "info")
          }
          if (data.modelInfo?.response) {
            addLog(`Resposta de teste: "${data.modelInfo.response}"`, "info")
          }
        } else {
          setApiStatus("error")
          setStatus("error")
          addLog(`Erro na conexão: ${data.error}`, "error")
          if (data.hint) {
            addLog(`Dica: ${data.hint}`, "info")
          }
          if (data.debug) {
            addLog(`Debug: ${JSON.stringify(data.debug)}`, "info")
          }
        }
      } catch (error) {
        setApiStatus("error")
        setStatus("error")
        const errorMessage = error instanceof Error ? error.message : String(error)
        addLog(`Erro ao verificar conexão: ${errorMessage}`, "error")
        addLog("Verifique sua conexão com a internet e as configurações da API", "info")
      }
    }

    // Check API connection immediately
    checkApiConnection()

    // Store original console methods
    const originalConsoleError = console.error
    const originalConsoleLog = console.log
    const originalConsoleWarn = console.warn

    // Override console methods after a delay to avoid render issues
    const timer = setTimeout(() => {
      // Override console.error to capture errors
      console.error = (...args) => {
        const errorMessage = args
          .map((arg) => {
            if (typeof arg === "object") {
              try {
                return JSON.stringify(arg, null, 2)
              } catch {
                return String(arg)
              }
            }
            return String(arg)
          })
          .join(" ")

        // Only add important errors to logs
        if (
          !errorMessage.includes("Warning:") &&
          !errorMessage.includes("React") &&
          (errorMessage.includes("API") ||
            errorMessage.includes("Groq") ||
            errorMessage.includes("chat") ||
            errorMessage.includes("Error"))
        ) {
          addLog(errorMessage, "error")
          setStatus("error")
        }

        // Call original console.error
        originalConsoleError(...args)
      }

      // Override console.log for important messages
      console.log = (...args) => {
        const logMessage = args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
          .join(" ")

        // Only log important messages
        if (
          logMessage.includes("API") ||
          logMessage.includes("Groq") ||
          logMessage.includes("Success") ||
          logMessage.includes("✅") ||
          logMessage.includes("❌") ||
          logMessage.includes("🔄")
        ) {
          if (logMessage.toLowerCase().includes("error") || logMessage.includes("❌")) {
            addLog(logMessage, "error")
          } else if (logMessage.toLowerCase().includes("success") || logMessage.includes("✅")) {
            addLog(logMessage, "success")
          } else {
            addLog(logMessage, "info")
          }
        }

        originalConsoleLog(...args)
      }
    }, 100)

    // Cleanup function
    return () => {
      clearTimeout(timer)
      console.error = originalConsoleError
      console.log = originalConsoleLog
      console.warn = originalConsoleWarn
    }
  }, [])

  return <StatusIcon status={status} logs={logs} onExportLogs={exportLogs} className={className} />
}
