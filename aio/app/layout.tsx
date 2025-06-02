import { cn } from "@/lib/utils"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import type { ReactNode } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Assistente Profissional",
  description: "Um assistente de IA personalizado para diferentes áreas profissionais.",
    generator: 'v0.dev'
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={cn("flex min-h-svh antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="light" disableSystemTheme>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'