// API بسيط لإنشاء embedding لنص معين باستخدام OpenAI
// ملاحظة: هذا الملف يفترض بيئة Node (مثلاً عند النشر على Vercel / Netlify Functions)

export async function POST(request: Request): Promise<Response> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY is not set" }),
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

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input,
        // 1536 dimensions - متوافق مع تعريف العمود vector(1536)
        model: "text-embedding-3-small",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(
        JSON.stringify({ error: "OpenAI error", details: text }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const embedding = data?.data?.[0]?.embedding as number[] | undefined;

    if (!embedding) {
      return new Response(
        JSON.stringify({ error: "Failed to get embedding from OpenAI" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

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


