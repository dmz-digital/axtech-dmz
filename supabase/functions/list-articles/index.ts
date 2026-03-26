import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ListRequest {
  language?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

interface ArticleListItem {
  id: string;
  slug: string;
  category: string;
  image_url: string | null;
  title: string;
  summary: string;
  tags: string[];
  created_at: string;
}

interface ArticleData {
  image_url: string | null;
  translations: Record<string, { title: string; summary: string; content: string }>;
  tags: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Supabase configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let params: ListRequest;

    if (req.method === "GET") {
      const url = new URL(req.url);
      params = {
        language: url.searchParams.get("language") || "pt",
        category: url.searchParams.get("category") || undefined,
        limit: parseInt(url.searchParams.get("limit") || "10"),
        offset: parseInt(url.searchParams.get("offset") || "0"),
      };
    } else {
      params = await req.json();
    }

    const { language = "pt", category, limit = 10, offset = 0 } = params;

    let query = supabase
      .from("articles_jsonb")
      .select("id, slug, category, data, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    const { data: articles, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch articles", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: ArticleListItem[] = (articles || []).map((article: {
      id: string;
      slug: string;
      category: string;
      data: ArticleData;
      created_at: string;
    }) => {
      const translation = article.data.translations?.[language] || article.data.translations?.["pt"];
      return {
        id: article.id,
        slug: article.slug,
        category: article.category,
        image_url: article.data.image_url,
        title: translation?.title || "",
        summary: translation?.summary || "",
        tags: article.data.tags || [],
        created_at: article.created_at,
      };
    });

    return new Response(JSON.stringify({ results, count: results.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
