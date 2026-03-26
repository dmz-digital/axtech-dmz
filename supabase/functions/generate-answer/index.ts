import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

interface ArticleSource {
  title: string;
  slug: string;
  summary: string;
}

interface RequestPayload {
  query: string;
  sources: ArticleSource[];
  model?: string;
  promptTemplate?: string;
  language?: string;
}

interface AnswerParagraph {
  text: string;
  sources: { title: string; slug: string }[];
}

interface AnswerResponse {
  paragraphs: AnswerParagraph[];
}

const DEFAULT_MODEL = "google/gemini-2.0-flash-001";

const DEFAULT_PROMPT_TEMPLATE = `Você é um assistente especializado em tecnologia financeira, integrações B2B e banking.

Com base na consulta do usuário e nos resumos dos artigos abaixo, forneça uma resposta completa, clara e bem fundamentada em português.

IMPORTANTE: Responda SOMENTE com um JSON válido no formato exato abaixo, sem nenhum texto adicional, sem blocos de código markdown:
{
  "paragraphs": [
    {
      "text": "texto do parágrafo aqui",
      "sources": [
        { "title": "título do artigo", "slug": "slug-do-artigo" }
      ]
    }
  ]
}

Regras:
- Gere entre 2 e 4 parágrafos informativos
- Cada parágrafo deve referenciar apenas os artigos mais relevantes para aquele trecho
- O texto deve ser fluido, profissional e direto ao ponto
- Use linguagem técnica adequada para profissionais do setor financeiro
- Baseie-se somente nas informações fornecidas pelos artigos

Consulta do usuário: {query}

Artigos disponíveis:
{articles}`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RequestPayload = await req.json();
    const { query, sources, model, promptTemplate } = body;

    if (!query || !sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ error: "query and sources are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const articlesContext = sources
      .map((s, i) => `[${i + 1}] Título: ${s.title}\nSlug: ${s.slug}\nResumo: ${s.summary}`)
      .join("\n\n");

    const template = promptTemplate || DEFAULT_PROMPT_TEMPLATE;
    const finalPrompt = template
      .replace("{query}", query)
      .replace("{articles}", articlesContext);

    const selectedModel = model || DEFAULT_MODEL;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://mft-search.app",
        "X-Title": "MFT Search",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: "user", content: finalPrompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenRouter error: ${response.status}`, details: errorText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openRouterData = await response.json();
    const rawContent = openRouterData.choices?.[0]?.message?.content;

    if (!rawContent) {
      return new Response(
        JSON.stringify({ error: "No content in OpenRouter response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsedAnswer: AnswerResponse;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedAnswer = JSON.parse(cleaned);
    } catch {
      parsedAnswer = {
        paragraphs: [
          { text: rawContent, sources: sources.map(s => ({ title: s.title, slug: s.slug })) },
        ],
      };
    }

    return new Response(JSON.stringify(parsedAnswer), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
