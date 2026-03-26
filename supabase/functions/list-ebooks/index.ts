import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const lang = url.searchParams.get("lang") || "pt";
    const category = url.searchParams.get("category");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    let query = supabase
      .from("ebooks")
      .select("id, slug, category, cover_image_path, data, tags, download_count, created_at")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    const { data: ebooks, error } = await query;

    if (error) {
      throw error;
    }

    const formattedEbooks = ebooks.map((ebook) => ({
      id: ebook.id,
      slug: ebook.slug,
      category: ebook.category,
      cover_image_url: ebook.cover_image_path,
      title: lang === "pt" ? ebook.data?.title_pt : ebook.data?.title_en,
      summary: lang === "pt" ? ebook.data?.summary_pt : ebook.data?.summary_en,
      tags: ebook.tags,
      download_count: ebook.download_count,
      created_at: ebook.created_at,
    }));

    return new Response(JSON.stringify({ ebooks: formattedEbooks }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch ebooks" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
