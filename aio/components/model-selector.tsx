"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Apenas modelos Groq que estão conectados na API
const models = [
  {
    value: "groq:llama-3.1-70b-versatile",
    label: "Llama 3.1 70B Versatile",
    provider: "groq",
    description: "Modelo principal - equilibrio entre velocidade e qualidade",
  },
  {
    value: "groq:llama-3.1-8b-instant",
    label: "Llama 3.1 8B Instant",
    provider: "groq",
    description: "Modelo rápido - respostas instantâneas",
  },
  {
    value: "groq:llama-3.3-70b-versatile",
    label: "Llama 3.3 70B Versatile",
    provider: "groq",
    description: "Modelo mais recente - melhor qualidade",
  },
  {
    value: "groq:mixtral-8x7b-32768",
    label: "Mixtral 8x7B",
    provider: "groq",
    description: "Modelo especializado - contexto longo",
  },
]

export type ModelSelectorProps = {
  value: string
  onChange: (value: string) => void
  className?: string
  buttonClassName?: string
  disabled?: boolean
}

export function ModelSelector({ value, onChange, className, buttonClassName, disabled = false }: ModelSelectorProps) {
  const [open, setOpen] = React.useState(false)

  const selectedModel = models.find((model) => model.value === value) || models[0]

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between rounded-full h-8 px-3 border-border/20 gap-1.5 transition-colors",
            buttonClassName,
          )}
          disabled={disabled}
          onClick={(e) => {
            // Prevent the event from propagating to parent elements
            e.stopPropagation()
          }}
        >
          <span className="truncate text-sm">{selectedModel.label}</span>
          <ChevronsUpDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[320px] p-0", className)}>
        <Command>
          <CommandInput placeholder="Buscar modelos..." />
          <CommandList>
            <CommandEmpty>Nenhum modelo encontrado.</CommandEmpty>
            <CommandGroup>
              {models.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={(currentValue) => {
                    onChange(currentValue)
                    setOpen(false)
                  }}
                  className="flex flex-col items-start p-3"
                >
                  <div className="flex items-center w-full">
                    <Check className={cn("mr-2 h-4 w-4", value === model.value ? "opacity-100" : "opacity-0")} />
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium">{model.label}</span>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                          {model.provider}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">{model.description}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
