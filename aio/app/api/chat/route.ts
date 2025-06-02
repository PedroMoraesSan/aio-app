import { type CoreMessage, streamText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(req: Request) {
  try {
    const {
      messages,
      model,
      userRoles,
    }: {
      messages: CoreMessage[]
      model: string
      userRoles?: string[]
    } = await req.json()

    // Validate API key
    if (!process.env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "API key não configurada",
          details: "A chave da API Groq não foi encontrada nas variáveis de ambiente",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Create system prompt
    let systemPrompt = "Você é um assistente útil e amigável."
    if (userRoles && userRoles.length > 0) {
      systemPrompt = `Você é um assistente especializado nas seguintes áreas: ${userRoles.join(", ")}. 
      Forneça respostas precisas e relevantes para estas áreas profissionais.`
    }

    // Select model
    const modelName = model?.startsWith("groq:") 
      ? model.replace("groq:", "") 
      : "llama-3.1-70b-versatile"

    // Generate response
    const result = streamText({
      model: groq(modelName),
      system: systemPrompt,
      messages,
      maxTokens: 4000,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Ocorreu um erro ao processar sua solicitação",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
