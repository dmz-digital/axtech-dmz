import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SearchRequest {
  query?: string;
  language?: string;
  category?: string;
  tag?: string;
  content_type?: string;
  limit?: number;
  offset?: number;
}

interface SearchResult {
  id: string;
  slug: string;
  content_type: string;
  category: string;
  image_url: string | null;
  title: string;
  summary: string;
  tags: string[];
  rank: number;
  created_at: string;
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

    let body: SearchRequest;

    if (req.method === "GET") {
      const url = new URL(req.url);
      body = {
        query: url.searchParams.get("query") || undefined,
        language: url.searchParams.get("language") || "pt",
        category: url.searchParams.get("category") || undefined,
        tag: url.searchParams.get("tag") || undefined,
        content_type: url.searchParams.get("content_type") || undefined,
        limit: parseInt(url.searchParams.get("limit") || "20"),
        offset: parseInt(url.searchParams.get("offset") || "0"),
      };
    } else {
      body = await req.json();
    }

    const { query, language = "pt", category, tag, content_type, limit = 20, offset = 0 } = body;

    const isBrowseMode = !query || query.trim().length === 0;

    if (isBrowseMode && !category && !tag) {
      return new Response(
        JSON.stringify({ error: "query, category, or tag is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase.rpc("search_all_content", {
      query_text: query || "",
      lang: language,
      content_type_filter: content_type || null,
      category_filter: category || null,
      tag_filter: tag || null,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      return new Response(
        JSON.stringify({ error: "Search failed", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: SearchResult[] = data || [];

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
