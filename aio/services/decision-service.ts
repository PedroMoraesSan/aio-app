type ThoughtStep = {
  type: string
  content: string
  completed: boolean
  details?: string[]
}

type ResultItem = {
  source: string
  content: string
}

export type DecisionProcess = {
  steps: ThoughtStep[]
  selectedMCPs: string[]
  currentStep: number
  completed: boolean
  results?: ResultItem[]
}

export class DecisionService {
  private static readonly CATEGORIES = {
    RESEARCH: ["sequencial-thinking", "fetch-content-tool"],
    BROWSING: ["browser-tools", "fetch-content-tool"],
    COMPLEX_REASONING: ["sequencial-thinking", "Magic"],
    GENERAL: ["sequencial-thinking"],
  }

  async decideTools(userInput: string, userRoles: string[]): Promise<DecisionProcess> {
    const process: DecisionProcess = {
      steps: [
        { type: "thinking", content: "Analisando solicitação do usuário...", completed: false },
        { type: "category", content: "Determinando categoria da solicitação...", completed: false },
        { type: "tools", content: "Selecionando ferramentas apropriadas...", completed: false },
      ],
      selectedMCPs: [],
      currentStep: 0,
      completed: false,
    }

    // Step 1: Analyze user input
    await this.simulateThinking(500)
    process.steps[0].completed = true
    process.steps[0].details = [
      `Entrada: "${userInput.substring(0, 50)}${userInput.length > 50 ? "..." : ""}"`,
      `Comprimento: ${userInput.length} caracteres`,
      `Áreas profissionais: ${userRoles.join(", ")}`,
    ]
    process.currentStep = 1

    // Step 2: Determine category
    const category = this.categorizeInput(userInput)
    process.steps[1].content = `Categoria determinada: ${this.getCategoryName(category)}`
    await this.simulateThinking(700)
    process.steps[1].completed = true
    process.steps[1].details = [
      `Palavras-chave identificadas: ${this.getKeywordsForCategory(category).join(", ")}`,
      `Confiança: ${this.getConfidenceLevel()}%`,
    ]
    process.currentStep = 2

    // Step 3: Select tools
    const selectedMCPs = this.selectToolsForCategory(category)

    // Add role-specific tools if applicable
    if (
      userRoles.some((role) => ["Advocacia", "Direito"].includes(role)) &&
      (userInput.toLowerCase().includes("legal") ||
        userInput.toLowerCase().includes("lei") ||
        userInput.toLowerCase().includes("jurídico"))
    ) {
      selectedMCPs.push("fetch-content-tool")
    }

    process.selectedMCPs = selectedMCPs
    process.steps[2].content = `Ferramentas selecionadas: ${selectedMCPs.join(", ")}`
    await this.simulateThinking(600)
    process.steps[2].completed = true
    process.steps[2].details = selectedMCPs.map((mcp) => `${mcp}: ${this.getToolDescription(mcp)}`)

    // Add a step for executing tools
    process.steps.push({
      type: "execution",
      content: "Executando ferramentas...",
      completed: false,
    })
    process.currentStep = 3

    // Simulate tool execution
    await this.simulateThinking(1500)
    process.steps[3].completed = true

    // Add results based on the tools used
    process.results = await this.generateResults(selectedMCPs, userInput)

    // Add a final step with the conclusion
    process.steps.push({
      type: "conclusion",
      content: `Processamento concluído com ${selectedMCPs.length} ferramentas.`,
      completed: true,
    })
    process.currentStep = 4
    process.completed = true

    return process
  }

  private categorizeInput(input: string): keyof typeof DecisionService.CATEGORIES {
    const lowerInput = input.toLowerCase()

    if (
      lowerInput.includes("pesquis") ||
      lowerInput.includes("encontr") ||
      lowerInput.includes("busc") ||
      lowerInput.includes("informaç")
    ) {
      return "RESEARCH"
    }

    if (
      lowerInput.includes("naveg") ||
      lowerInput.includes("site") ||
      lowerInput.includes("página") ||
      lowerInput.includes("web")
    ) {
      return "BROWSING"
    }

    if (
      lowerInput.includes("analis") ||
      lowerInput.includes("compar") ||
      lowerInput.includes("avaliar") ||
      lowerInput.includes("complex")
    ) {
      return "COMPLEX_REASONING"
    }

    return "GENERAL"
  }

  private getCategoryName(category: keyof typeof DecisionService.CATEGORIES): string {
    const categoryNames = {
      RESEARCH: "Pesquisa de Informações",
      BROWSING: "Navegação Web",
      COMPLEX_REASONING: "Raciocínio Complexo",
      GENERAL: "Consulta Geral",
    }

    return categoryNames[category]
  }

  private getKeywordsForCategory(category: keyof typeof DecisionService.CATEGORIES): string[] {
    const keywords = {
      RESEARCH: ["pesquisar", "encontrar", "buscar", "informações"],
      BROWSING: ["navegar", "site", "página", "web"],
      COMPLEX_REASONING: ["analisar", "comparar", "avaliar", "complexo"],
      GENERAL: ["ajuda", "como", "o que", "quando"],
    }

    return keywords[category]
  }

  private getConfidenceLevel(): number {
    return Math.floor(Math.random() * 20) + 80 // Random number between 80-99
  }

  private selectToolsForCategory(category: keyof typeof DecisionService.CATEGORIES): string[] {
    return DecisionService.CATEGORIES[category]
  }

  private getToolDescription(tool: string): string {
    const descriptions = {
      "sequencial-thinking": "Raciocínio passo a passo para problemas complexos",
      "browser-tools": "Navegação e extração de conteúdo da web",
      "fetch-content-tool": "Busca e recuperação de informações específicas",
      Magic: "Processamento avançado para tarefas especializadas",
    }

    return descriptions[tool as keyof typeof descriptions] || "Ferramenta auxiliar"
  }

  private async generateResults(tools: string[], query: string): Promise<ResultItem[]> {
    // Simulate results based on tools used
    const results: ResultItem[] = []

    if (tools.includes("fetch-content-tool")) {
      results.push({
        source: "Fetch Content Tool",
        content: `Recuperados ${Math.floor(Math.random() * 10) + 1} resultados relevantes para "${query.substring(0, 30)}..."`,
      })
    }

    if (tools.includes("browser-tools")) {
      results.push({
        source: "Browser Tools",
        content: `Navegação concluída em ${Math.floor(Math.random() * 5) + 1} páginas web relacionadas ao tema.`,
      })
    }

    if (tools.includes("sequencial-thinking")) {
      results.push({
        source: "Sequential Thinking",
        content: `Análise estruturada em ${Math.floor(Math.random() * 3) + 3} etapas de raciocínio.`,
      })
    }

    if (tools.includes("Magic")) {
      results.push({
        source: "Magic",
        content: "Processamento especializado concluído com sucesso.",
      })
    }

    return results
  }

  private simulateThinking(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const decisionService = new DecisionService()
