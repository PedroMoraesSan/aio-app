import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.GROQ_API_KEY) {
      return Response.json(
        {
          success: false,
          error: "GROQ_API_KEY não encontrada nas variáveis de ambiente",
          hint: "Adicione a variável GROQ_API_KEY no seu projeto",
        },
        { status: 500 }
      )
    }

    // Test API connection
    const model = groq("llama-3.1-8b-instant")
    const result = await generateText({
      model: model,
      prompt: "Say hello",
      maxTokens: 10,
    })

    return Response.json({
      success: true,
      message: "Conexão com a API Groq estabelecida com sucesso",
      modelInfo: {
        model: "llama-3.1-8b-instant",
        provider: "groq",
        response: result.text,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro na chamada da API"
    
    return Response.json(
      {
        success: false,
        error: errorMessage,
        hint: "A chave da API Groq pode estar inválida, expirada ou sem permissões adequadas",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
