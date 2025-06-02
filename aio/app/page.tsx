"use client"

import { useState } from "react"
import { ChatForm } from "@/components/chat-form"
import { RoleSelector } from "@/components/role-selector"

export default function Page() {
  const [selectedRoles, setSelectedRoles] = useState<string[] | null>(null)

  const handleRoleSelection = (roles: string[]) => {
    setSelectedRoles(roles)
  }

  if (!selectedRoles) {
    return <RoleSelector onComplete={handleRoleSelection} />
  }

  return (
    <div className="h-svh">
      <ChatForm userRoles={selectedRoles} />
    </div>
  )
}
