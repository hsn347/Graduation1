import { supabase } from "@/CliantSupa"

export interface DocumentMetadata {
  source?: string
  table_name?: string
  record_id?: string | number
  [key: string]: any
}

export interface RagDocumentInput {
  content: string
  metadata?: DocumentMetadata
}

// استدعاء API لإنشاء embedding للنص
async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch("/api/embed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: text }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Embedding API error: ${response.status} - ${errorText}`)
  }

  const data = await response.json()
  if (!data.embedding || !Array.isArray(data.embedding)) {
    throw new Error("Invalid embedding response from API")
  }

  return data.embedding as number[]
}

// حفظ مستند في جدول documents مع embedding
export async function saveRagDocument(input: RagDocumentInput) {
  const { content, metadata } = input

  if (!content.trim()) {
    throw new Error("المحتوى لا يمكن أن يكون فارغاً")
  }

  // 1) إنشاء embedding للنص
  const embedding = await createEmbedding(content)

  // 2) حفظ في جدول documents في Supabase
  const { error } = await supabase.from("documents").insert([
    {
      content,
      metadata: metadata ?? {},
      // embedding بطول 1536 (مثلاً text-embedding-3-small) ومتوافق مع vector(1536)
      embedding,
    },
  ])

  if (error) {
    throw error
  }
}


