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
    const slug = url.searchParams.get("slug");
    const lang = url.searchParams.get("lang") || "pt";

    if (!slug) {
      return new Response(
        JSON.stringify({ error: "Slug parameter is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: ebook, error } = await supabase
      .from("ebooks")
      .select("id, slug, category, cover_image_path, data, tags, download_count, created_at")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!ebook) {
      return new Response(
        JSON.stringify({ error: "Ebook not found" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const formattedEbook = {
      id: ebook.id,
      slug: ebook.slug,
      category: ebook.category,
      cover_image_url: ebook.cover_image_path,
      title: lang === "pt" ? ebook.data?.title_pt : ebook.data?.title_en,
      summary: lang === "pt" ? ebook.data?.summary_pt : ebook.data?.summary_en,
      tags: ebook.tags,
      download_count: ebook.download_count,
      created_at: ebook.created_at,
    };

    return new Response(JSON.stringify({ ebook: formattedEbook }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to fetch ebook" }),
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
