import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function verifyAdmin(supabase: ReturnType<typeof createClient>, authHeader: string | null) {
  if (!authHeader) {
    return { error: "Missing authorization header", status: 401 };
  }

  const token = authHeader.replace("Bearer ", "");

  if (!token || token === "undefined" || token === "null") {
    return { error: "Invalid or missing token", status: 401 };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError) {
    return { error: `Auth error: ${authError.message}`, status: 401 };
  }

  if (!user) {
    return { error: "User not found", status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { error: `Profile error: ${profileError.message}`, status: 500 };
  }

  if (!profile) {
    return { error: "Profile not found for user", status: 403 };
  }

  if (profile.role !== "admin") {
    return { error: "Access denied. Admin role required.", status: 403 };
  }

  return { user };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const authResult = await verifyAdmin(supabase, req.headers.get("Authorization"));
    if ("error" in authResult) {
      return new Response(
        JSON.stringify({ error: authResult.error }),
        { status: authResult.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const ebookId = pathParts[pathParts.length - 1];
    const isIdRoute = ebookId && ebookId !== "admin-ebooks";

    if (req.method === "GET") {
      if (isIdRoute) {
        const { data: ebook, error } = await supabase
          .from("ebooks")
          .select("*")
          .eq("id", ebookId)
          .maybeSingle();

        if (error) throw error;
        if (!ebook) {
          return new Response(
            JSON.stringify({ error: "Ebook not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(JSON.stringify({ ebook }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      const category = url.searchParams.get("category");

      let query = supabase
        .from("ebooks")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (category) {
        query = query.eq("category", category);
      }

      const { data: ebooks, error, count } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({ ebooks, total: count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { slug, category, cover_image_path, pdf_path, data, tags, is_published, edicao_especial } = body;

      if (!slug || !cover_image_path || !pdf_path) {
        return new Response(
          JSON.stringify({ error: "slug, cover_image_path, and pdf_path are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (edicao_especial) {
        await supabase.from("ebooks").update({ edicao_especial: false }).eq("edicao_especial", true);
      }

      const { data: ebook, error } = await supabase
        .from("ebooks")
        .insert({
          slug,
          category: category || "general",
          cover_image_path,
          pdf_path,
          data: data || {},
          tags: tags || [],
          is_published: is_published ?? false,
          edicao_especial: edicao_especial ?? false,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ ebook }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT") {
      if (!isIdRoute) {
        return new Response(
          JSON.stringify({ error: "Ebook ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const { slug, category, cover_image_path, pdf_path, data, tags, is_published, edicao_especial } = body;

      if (edicao_especial) {
        await supabase.from("ebooks").update({ edicao_especial: false }).neq("id", ebookId).eq("edicao_especial", true);
      }

      const updateData: Record<string, unknown> = {};
      if (slug !== undefined) updateData.slug = slug;
      if (category !== undefined) updateData.category = category;
      if (cover_image_path !== undefined) updateData.cover_image_path = cover_image_path;
      if (pdf_path !== undefined) updateData.pdf_path = pdf_path;
      if (data !== undefined) updateData.data = data;
      if (tags !== undefined) updateData.tags = tags;
      if (is_published !== undefined) updateData.is_published = is_published;
      if (edicao_especial !== undefined) updateData.edicao_especial = edicao_especial;

      const { data: ebook, error } = await supabase
        .from("ebooks")
        .update(updateData)
        .eq("id", ebookId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ ebook }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      if (!isIdRoute) {
        return new Response(
          JSON.stringify({ error: "Ebook ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("ebooks")
        .delete()
        .eq("id", ebookId);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
