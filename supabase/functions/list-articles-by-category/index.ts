import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const lang = url.searchParams.get("lang") || "pt";
    const limit = parseInt(url.searchParams.get("limit") || "6");

    if (!category) {
      return new Response(
        JSON.stringify({ error: "category is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: articles, error } = await supabase
      .from("articles_jsonb")
      .select("id, slug, category, data, created_at")
      .eq("is_published", true)
      .eq("category", category)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    const formatted = (articles || []).map((article) => {
      const translations = article.data?.translations || {};
      const t = translations[lang] || translations["pt"] || {};
      return {
        id: article.id,
        slug: article.slug,
        category: article.category,
        title: t.title || "",
        summary: t.summary || "",
        image_url: article.data?.image_url || null,
        tags: article.data?.tags || [],
        created_at: article.created_at,
      };
    });

    return new Response(JSON.stringify({ articles: formatted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
