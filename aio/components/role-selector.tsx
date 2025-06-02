"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const roles = [
  "Advocacia",
  "Administração",
  "Contabilidade",
  "Marketing",
  "Recursos Humanos",
  "Tecnologia da Informação",
  "Engenharia",
  "Medicina",
  "Enfermagem",
  "Psicologia",
  "Educação",
  "Arquitetura",
  "Design",
  "Jornalismo",
  "Economia",
  "Finanças",
  "Vendas",
  "Logística",
  "Gastronomia",
  "Turismo",
  "Direito",
  "Consultoria",
  "Pesquisa",
  "Farmácia",
]

const transitionProps = {
  type: "spring",
  stiffness: 500,
  damping: 30,
  mass: 0.5,
}

export interface RoleSelectorProps {
  onComplete: (selectedRoles: string[]) => void
}

export function RoleSelector({ onComplete }: RoleSelectorProps) {
  const [selected, setSelected] = useState<string[]>([])

  const toggleRole = (role: string) => {
    setSelected((prev) => (prev.includes(role) ? prev.filter((c) => c !== role) : [...prev, role]))
  }

  const handleContinue = () => {
    if (selected.length > 0) {
      onComplete(selected)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8 mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-3">Quais são suas áreas de atuação?</h1>
          <p className="text-gray-600">Selecione uma ou mais áreas para personalizar sua experiência</p>
        </div>

        <motion.div className="flex flex-wrap justify-center gap-2 mb-10" layout transition={transitionProps}>
          {roles.map((role) => {
            const isSelected = selected.includes(role)
            return (
              <motion.button
                key={role}
                onClick={() => toggleRole(role)}
                layout
                initial={false}
                animate={{
                  backgroundColor: isSelected ? "#f0f9ff" : "white",
                }}
                whileHover={{
                  backgroundColor: isSelected ? "#e0f2fe" : "#f9fafb",
                }}
                whileTap={{
                  backgroundColor: isSelected ? "#bae6fd" : "#f3f4f6",
                }}
                transition={{
                  ...transitionProps,
                  backgroundColor: { duration: 0.1 },
                }}
                className={`
                  inline-flex items-center px-4 py-2 rounded-full text-base font-medium
                  whitespace-nowrap overflow-hidden ring-1 ring-inset shadow-sm
                  ${isSelected ? "text-blue-700 ring-blue-200" : "text-gray-700 ring-gray-200"}
                `}
              >
                <motion.div
                  className="relative flex items-center"
                  animate={{
                    width: isSelected ? "auto" : "100%",
                    paddingRight: isSelected ? "1.5rem" : "0",
                  }}
                  transition={{
                    ease: [0.175, 0.885, 0.32, 1.275],
                    duration: 0.3,
                  }}
                >
                  <span>{role}</span>
                  <AnimatePresence>
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={transitionProps}
                        className="absolute right-0"
                      >
                        <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={1.5} />
                        </div>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            )
          })}
        </motion.div>

        <div className="flex justify-center">
          <Button onClick={handleContinue} disabled={selected.length === 0} className="px-6 py-2 text-base" size="lg">
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
