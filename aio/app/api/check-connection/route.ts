import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function GET() {
  try {
    console.log("=== CONNECTION CHECK DEBUG ===")
    console.log("Environment variables:")
    console.log("- NODE_ENV:", process.env.NODE_ENV)
    console.log("- GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY)
    console.log("- GROQ_API_KEY length:", process.env.GROQ_API_KEY?.length || 0)

    if (process.env.GROQ_API_KEY) {
      console.log("- GROQ_API_KEY starts with:", process.env.GROQ_API_KEY.substring(0, 10) + "...")
    }

    // Check if API key exists
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY not found")
      return Response.json(
        {
          success: false,
          error: "GROQ_API_KEY não encontrada nas variáveis de ambiente",
          hint: "Adicione a variável GROQ_API_KEY no seu projeto",
          debug: {
            env: process.env.NODE_ENV,
            availableEnvVars: Object.keys(process.env).filter((key) => key.includes("GROQ")),
          },
        },
        { status: 500 },
      )
    }

    console.log("✅ API key found, testing connection...")

    // Try to generate a simple text to verify the connection
    try {
      console.log("Creating Groq model instance...")
      const model = groq("llama-3.1-8b-instant")

      console.log("Calling generateText...")
      const result = await generateText({
        model: model,
        prompt: "Say hello",
        maxTokens: 10,
      })

      console.log("✅ API call successful, response:", result.text)

      return Response.json({
        success: true,
        message: "Conexão com a API Groq estabelecida com sucesso",
        modelInfo: {
          model: "llama-3.1-8b-instant",
          provider: "groq",
          response: result.text,
          usage: result.usage,
        },
        timestamp: new Date().toISOString(),
      })
    } catch (apiError) {
      console.error("❌ API call failed:", apiError)

      const errorMessage = apiError instanceof Error ? apiError.message : "Erro na chamada da API"
      console.error("Error details:", {
        message: errorMessage,
        name: apiError instanceof Error ? apiError.name : "Unknown",
        stack: apiError instanceof Error ? apiError.stack : undefined,
      })

      return Response.json(
        {
          success: false,
          error: errorMessage,
          hint: "A chave da API Groq pode estar inválida, expirada ou sem permissões adequadas",
          debug: {
            errorType: apiError instanceof Error ? apiError.name : "Unknown",
            hasApiKey: !!process.env.GROQ_API_KEY,
            keyLength: process.env.GROQ_API_KEY?.length,
          },
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Critical error in connection check:", error)

    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"

    return Response.json(
      {
        success: false,
        error: errorMessage,
        hint: "Erro interno do servidor ao verificar a conexão",
        debug: {
          errorType: error instanceof Error ? error.name : "Unknown",
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
