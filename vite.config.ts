import { defineConfig } from "vite"
import path from "path"

import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Plugin يضيف middleware لـ /api/embed أثناء التطوير
    {
      name: "cohere-embed-proxy",
      configureServer(server) {
        server.middlewares.use("/api/embed", async (req, res) => {
          if (req.method !== "POST") {
            res.writeHead(405, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ error: "Method not allowed" }))
            return
          }

          try {
            const apiKey = process.env.COHERE_API_KEY
            if (!apiKey) {
              res.writeHead(500, { "Content-Type": "application/json" })
              res.end(JSON.stringify({ error: "COHERE_API_KEY is not set" }))
              return
            }

            let body = ""
            req.on("data", (chunk) => {
              body += chunk.toString()
            })
            req.on("end", async () => {
              try {
                const parsedBody = JSON.parse(body || "{}")
                const input = parsedBody.input

                if (!input || typeof input !== "string") {
                  res.writeHead(400, { "Content-Type": "application/json" })
                  res.end(JSON.stringify({ error: "input (string) is required" }))
                  return
                }

                const cohereResponse = await fetch("https://api.cohere.ai/v1/embed", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                    Accept: "application/json",
                  },
                  body: JSON.stringify({
                    texts: [input],
                    model: "embed-multilingual-v3.0",
                    input_type: "search_document",
                  }),
                })

                if (!cohereResponse.ok) {
                  const errorText = await cohereResponse.text()
                  res.writeHead(cohereResponse.status, { "Content-Type": "application/json" })
                  res.end(JSON.stringify({ error: "Cohere API error", details: errorText }))
                  return
                }

                const data = (await cohereResponse.json()) as { embeddings?: number[][] }
                const embedding = data?.embeddings?.[0]

                if (!embedding || !Array.isArray(embedding)) {
                  res.writeHead(500, { "Content-Type": "application/json" })
                  res.end(JSON.stringify({ error: "Failed to get embedding from Cohere" }))
                  return
                }

                res.writeHead(200, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ embedding }))
              } catch (error: any) {
                res.writeHead(500, { "Content-Type": "application/json" })
                res.end(JSON.stringify({ error: "Internal server error", details: error?.message }))
              }
            })
          } catch (error: any) {
            res.writeHead(500, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ error: "Internal server error", details: error?.message }))
          }
        })
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5346, // البورت الذي تريده
    strictPort: false, // يرفض البدء إذا البورت مستخدم
  },
})
