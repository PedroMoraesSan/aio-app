"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface SuggestedPromptsProps {
  userRoles: string[]
  onSelectPrompt: (prompt: string) => void
}

export function SuggestedPrompts({ userRoles, onSelectPrompt }: SuggestedPromptsProps) {
  const [prompts, setPrompts] = useState<string[]>([])

  useEffect(() => {
    // Generate prompts based on user roles
    const generatedPrompts: string[] = []

    if (userRoles.includes("Tecnologia da Informação")) {
      generatedPrompts.push("Quais são as melhores práticas para segurança de dados em aplicações web?")
      generatedPrompts.push("Como implementar uma arquitetura de microserviços eficiente?")
    }

    if (userRoles.includes("Marketing")) {
      generatedPrompts.push("Quais estratégias de marketing digital são mais eficazes para pequenas empresas?")
      generatedPrompts.push("Como criar uma campanha de email marketing com alta taxa de conversão?")
    }

    if (userRoles.includes("Advocacia") || userRoles.includes("Direito")) {
      generatedPrompts.push("Quais são as principais mudanças na LGPD que afetam empresas brasileiras?")
      generatedPrompts.push("Como estruturar um contrato de prestação de serviços para minimizar riscos?")
    }

    if (userRoles.includes("Finanças")) {
      generatedPrompts.push("Quais são as melhores estratégias de investimento para o cenário econômico atual?")
      generatedPrompts.push("Como otimizar o fluxo de caixa de uma empresa de médio porte?")
    }

    // Add some general prompts if we don't have enough
    if (generatedPrompts.length < 4) {
      const generalPrompts = [
        "Como melhorar a produtividade da minha equipe?",
        "Quais são as tendências de mercado para os próximos anos?",
        "Como implementar uma cultura de inovação na minha empresa?",
        "Quais são as melhores ferramentas para gestão de projetos?",
      ]

      for (const prompt of generalPrompts) {
        if (generatedPrompts.length < 4) {
          generatedPrompts.push(prompt)
        }
      }
    }

    setPrompts(generatedPrompts.slice(0, 4))
  }, [userRoles])

  if (prompts.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-[90%] mx-auto space-y-2 mt-4"
    >
      {prompts.map((prompt, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
          onClick={() => onSelectPrompt(prompt)}
          className="w-full text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 dark:bg-secondary/30 dark:hover:bg-secondary/50 text-sm transition-colors"
        >
          {prompt}
        </motion.button>
      ))}
    </motion.div>
  )
}
