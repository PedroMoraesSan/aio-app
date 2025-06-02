"use client"

interface MentionTextProps {
  text: string
  className?: string
}

export function MentionText({ text, className }: MentionTextProps) {
  // Regex para encontrar menções (@palavra ou @frase com espaços)
  const mentionRegex = /@([^@\n]+?)(?=\s|$|@)/g

  // Dividir o texto preservando as menções
  const parts = []
  let lastIndex = 0
  let match

  while ((match = mentionRegex.exec(text)) !== null) {
    // Adicionar texto antes da menção
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      })
    }

    // Adicionar a menção
    parts.push({
      type: "mention",
      content: match[1].trim(),
    })

    lastIndex = match.index + match[0].length
  }

  // Adicionar texto restante
  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      content: text.slice(lastIndex),
    })
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "mention") {
          return (
            <span key={index} className="mention">
              @{part.content}
            </span>
          )
        }
        return <span key={index}>{part.content}</span>
      })}
    </span>
  )
}
