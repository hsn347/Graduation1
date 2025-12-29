// API بسيط لإنشاء embedding لنص معين باستخدام Cohere
// ملاحظة: هذا الملف يفترض بيئة Node (مثلاً عند النشر على Vercel / Netlify Functions)

export async function POST(request: Request): Promise<Response> {
  try {
    const apiKey = process.env.COHERE_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "COHERE_API_KEY is not set" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = (await request.json()) as { input?: string };
    const input = body.input;

    if (!input || typeof input !== "string") {
      return new Response(
        JSON.stringify({ error: "input (string) is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // استدعاء Cohere API للـ embeddings
    const response = await fetch("https://api.cohere.ai/v1/embed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Accept": "application/json",
      },
      body: JSON.stringify({
        texts: [input],
        model: "embed-multilingual-v3.0", // يدعم العربية والإنجليزية
        input_type: "search_document", // أو "search_query" حسب الاستخدام
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(
        JSON.stringify({ error: "Cohere API error", details: text }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    // Cohere يعيد embeddings كمصفوفة من المصفوفات، نأخذ الأول
    const embedding = data?.embeddings?.[0] as number[] | undefined;

    if (!embedding || !Array.isArray(embedding)) {
      return new Response(
        JSON.stringify({ error: "Failed to get embedding from Cohere" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // ملاحظة: Cohere embed-multilingual-v3.0 يعيد 1024 بعد
    // إذا كان جدولك vector(1536)، قد تحتاج لتعديل حجم الـ vector في Supabase
    // أو استخدام padding لملء الفرق

    return new Response(JSON.stringify({ embedding }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Embedding API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error?.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


