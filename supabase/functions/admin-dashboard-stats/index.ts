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

    const today = new Date().toISOString().split("T")[0];

    const [
      articlesResult,
      ebooksResult,
      eventsResult,
      leadsResult,
      subscribersResult,
      recentArticlesResult,
      recentLeadsResult,
    ] = await Promise.all([
      supabase.from("articles_jsonb").select("is_published", { count: "exact" }),
      supabase.from("ebooks").select("is_published, download_count", { count: "exact" }),
      supabase.from("events").select("is_published, event_date", { count: "exact" }),
      supabase.from("ebook_leads").select("*", { count: "exact" }),
      supabase.from("newsletter_subscribers").select("*", { count: "exact" }).eq("active", true),
      supabase
        .from("articles_jsonb")
        .select("id, slug, category, data, is_published, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .limit(5),
      supabase
        .from("ebook_leads")
        .select("id, name, email, ebook_id, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const articles = articlesResult.data || [];
    const articlesPublished = articles.filter((a) => a.is_published).length;
    const articlesDraft = articles.filter((a) => !a.is_published).length;

    const ebooks = ebooksResult.data || [];
    const ebooksPublished = ebooks.filter((e) => e.is_published).length;
    const ebooksDraft = ebooks.filter((e) => !e.is_published).length;
    const totalDownloads = ebooks.reduce((sum, e) => sum + (e.download_count || 0), 0);

    const events = eventsResult.data || [];
    const upcomingEvents = events.filter((e) => e.event_date >= today && e.is_published).length;
    const pastEvents = events.filter((e) => e.event_date < today).length;
    const eventsPublished = events.filter((e) => e.is_published).length;
    const eventsDraft = events.filter((e) => !e.is_published).length;

    const totalLeads = leadsResult.count || 0;
    const totalSubscribers = subscribersResult.count || 0;

    const recentArticles = (recentArticlesResult.data || []).map((a) => ({
      id: a.id,
      slug: a.slug,
      category: a.category,
      title: a.data?.translations?.pt?.title || a.data?.translations?.en?.title || "Sem título",
      is_published: a.is_published,
      updated_at: a.updated_at,
    }));

    const recentLeads = recentLeadsResult.data || [];

    return new Response(
      JSON.stringify({
        stats: {
          articles: {
            total: articles.length,
            published: articlesPublished,
            draft: articlesDraft,
          },
          ebooks: {
            total: ebooks.length,
            published: ebooksPublished,
            draft: ebooksDraft,
            totalDownloads,
          },
          events: {
            total: events.length,
            published: eventsPublished,
            draft: eventsDraft,
            upcoming: upcomingEvents,
            past: pastEvents,
          },
          leads: {
            total: totalLeads,
          },
          subscribers: {
            total: totalSubscribers,
          },
        },
        recentArticles,
        recentLeads,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
