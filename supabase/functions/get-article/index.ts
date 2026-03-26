import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ArticleResponse {
  id: string;
  slug: string;
  category: string;
  image_url: string | null;
  title: string;
  summary: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  related: RelatedArticle[];
}

interface RelatedArticle {
  slug: string;
  title: string;
  summary: string;
  category: string;
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

    const url = new URL(req.url);
    let slug: string | null = null;
    let language = "pt";

    if (req.method === "GET") {
      slug = url.searchParams.get("slug");
      language = url.searchParams.get("language") || "pt";
    } else {
      const body = await req.json();
      slug = body.slug;
      language = body.language || "pt";
    }

    if (!slug) {
      return new Response(
        JSON.stringify({ error: "slug is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: article, error: articleError } = await supabase
      .from("articles_jsonb")
      .select("id, slug, category, data, created_at, updated_at")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (articleError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch article", details: articleError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!article) {
      return new Response(
        JSON.stringify({ error: "Article not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const articleData = article.data as ArticleData;
    const translation = articleData.translations?.[language] || articleData.translations?.["pt"];

    if (!translation) {
      return new Response(
        JSON.stringify({ error: "Translation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: relatedArticles } = await supabase
      .from("articles_jsonb")
      .select("slug, category, data")
      .eq("category", article.category)
      .neq("slug", slug)
      .limit(3);

    const related: RelatedArticle[] = (relatedArticles || []).map((r: {
      slug: string;
      category: string;
      data: ArticleData;
    }) => {
      const relTranslation = r.data.translations?.[language] || r.data.translations?.["pt"];
      return {
        slug: r.slug,
        title: relTranslation?.title || "",
        summary: relTranslation?.summary || "",
        category: r.category,
      };
    });

    const response: ArticleResponse = {
      id: article.id,
      slug: article.slug,
      category: article.category,
      image_url: articleData.image_url,
      title: translation.title,
      summary: translation.summary,
      content: translation.content,
      tags: articleData.tags || [],
      created_at: article.created_at,
      updated_at: article.updated_at,
      related,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
