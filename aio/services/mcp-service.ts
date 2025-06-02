import { spawn } from "child_process"
import mcpConfig from "../config/mcp-servers.json"

type MCPServer = {
  command: string
  args: string[]
  process?: any
  url?: string
}

type MCPServers = {
  [key: string]: MCPServer
}

class MCPService {
  private servers: MCPServers
  private activeServers: Set<string> = new Set()

  constructor() {
    this.servers = mcpConfig.mcpServers as MCPServers
  }

  async startServer(serverName: string): Promise<string> {
    if (!this.servers[serverName]) {
      throw new Error(`MCP server ${serverName} not found`)
    }

    if (this.activeServers.has(serverName)) {
      return this.servers[serverName].url || ""
    }

    return new Promise((resolve, reject) => {
      const server = this.servers[serverName]
      const process = spawn(server.command, server.args)

      let url = ""

      process.stdout.on("data", (data: Buffer) => {
        const output = data.toString()
        console.log(`[${serverName}] ${output}`)

        // Extract MCP server URL from output
        const match = output.match(/MCP server running at (http:\/\/localhost:\d+)/)
        if (match && match[1]) {
          url = match[1]
          server.url = url
          this.activeServers.add(serverName)
          resolve(url)
        }
      })

      process.stderr.on("data", (data: Buffer) => {
        console.error(`[${serverName}] Error: ${data.toString()}`)
      })

      process.on("close", (code: number) => {
        console.log(`[${serverName}] Process exited with code ${code}`)
        this.activeServers.delete(serverName)
        if (!url) {
          reject(new Error(`Failed to start MCP server ${serverName}`))
        }
      })

      server.process = process
    })
  }

  async stopServer(serverName: string): Promise<void> {
    if (!this.servers[serverName] || !this.activeServers.has(serverName)) {
      return
    }

    const server = this.servers[serverName]
    if (server.process) {
      server.process.kill()
      this.activeServers.delete(serverName)
    }
  }

  async stopAllServers(): Promise<void> {
    const promises = Array.from(this.activeServers).map((serverName) => this.stopServer(serverName))
    await Promise.all(promises)
  }

  getActiveServers(): string[] {
    return Array.from(this.activeServers)
  }

  getAllServers(): string[] {
    return Object.keys(this.servers)
  }
}

// Singleton instance
export const mcpService = new MCPService()
