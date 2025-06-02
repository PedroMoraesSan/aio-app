import { type CoreMessage, streamText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    console.log("=== CHAT API DEBUG ===")
    console.log("Environment check:")
    console.log("- NODE_ENV:", process.env.NODE_ENV)
    console.log("- GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY)
    console.log("- GROQ_API_KEY length:", process.env.GROQ_API_KEY?.length || 0)

    const {
      messages,
      model,
      userRoles,
    }: {
      messages: CoreMessage[]
      model: string
      userRoles?: string[]
    } = await req.json()

    console.log("Request data:")
    console.log("- Model requested:", model)
    console.log("- Messages count:", messages.length)
    console.log("- User roles:", userRoles)

    // Validate that we have the API key
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY not found in environment variables")
      return new Response(
        JSON.stringify({
          error: "API key não configurada",
          details: "A chave da API Groq não foi encontrada nas variáveis de ambiente",
          hint: "Verifique se a variável GROQ_API_KEY está configurada corretamente",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Create a system prompt that includes the user roles if available
    let systemPrompt = "Você é um assistente útil e amigável."

    if (userRoles && userRoles.length > 0) {
      systemPrompt = `Você é um assistente especializado nas seguintes áreas: ${userRoles.join(", ")}. 
      Forneça respostas precisas e relevantes para estas áreas profissionais, utilizando terminologia apropriada 
      e considerando as necessidades específicas destes campos. Quando possível, ofereça exemplos práticos 
      e recomendações aplicáveis ao contexto brasileiro.`
    }

    console.log("System prompt configured")

    // Select the appropriate model based on the request
    let modelName = "llama-3.1-70b-versatile" // Default model

    if (model && model.startsWith("groq:")) {
      modelName = model.replace("groq:", "")
    }

    console.log(`Using Groq model: ${modelName}`)

    // Create the Groq model instance
    let selectedModel
    try {
      selectedModel = groq(modelName)
      console.log("✅ Groq model instance created successfully")
    } catch (modelError) {
      console.error("❌ Error creating Groq model:", modelError)
      // Fallback to a known working model
      modelName = "llama-3.1-8b-instant"
      selectedModel = groq(modelName)
      console.log(`🔄 Falling back to: ${modelName}`)
    }

    console.log("Starting text generation...")

    // Test the model with a simple call first
    try {
      const result = streamText({
        model: selectedModel,
        system: systemPrompt,
        messages,
        maxTokens: 4000,
        temperature: 0.7,
      })

      console.log("✅ Text generation started successfully")
      return result.toDataStreamResponse()
    } catch (streamError) {
      console.error("❌ Error in streamText:", streamError)

      // Try with a simpler configuration
      console.log("🔄 Trying with simpler configuration...")

      const fallbackResult = streamText({
        model: groq("llama-3.1-8b-instant"),
        messages: [{ role: "user", content: messages[messages.length - 1]?.content || "Hello" }],
        maxTokens: 1000,
        temperature: 0.5,
      })

      return fallbackResult.toDataStreamResponse()
    }
  } catch (error) {
    console.error("❌ Critical error in chat API:", error)

    // More detailed error information
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    const errorStack = error instanceof Error ? error.stack : undefined

    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      env: {
        hasGroqKey: !!process.env.GROQ_API_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
    })

    return new Response(
      JSON.stringify({
        error: "Ocorreu um erro ao processar sua solicitação",
        details: errorMessage,
        hint: "Verifique se a chave da API Groq está configurada corretamente e tente novamente",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
