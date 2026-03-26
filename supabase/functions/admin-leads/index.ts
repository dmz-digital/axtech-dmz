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
    const type = url.searchParams.get("type") || "all";
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const search = url.searchParams.get("search");

    if (req.method === "GET") {
      const results: {
        ebookLeads?: unknown[];
        ebookLeadsTotal?: number;
        subscribers?: unknown[];
        subscribersTotal?: number;
      } = {};

      if (type === "all" || type === "ebook_leads") {
        let query = supabase
          .from("ebook_leads")
          .select(`
            id,
            name,
            email,
            ebook_id,
            created_at,
            ebooks (
              id,
              slug,
              data
            )
          `, { count: "exact" })
          .order("created_at", { ascending: false });

        if (type === "ebook_leads") {
          query = query.range(offset, offset + limit - 1);
        } else {
          query = query.limit(limit);
        }

        const { data: leads, count, error } = await query;

        if (error) throw error;

        results.ebookLeads = (leads || []).map((lead) => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          ebook_id: lead.ebook_id,
          ebook_title: lead.ebooks?.data?.title_pt || lead.ebooks?.data?.title_en || "Unknown",
          ebook_slug: lead.ebooks?.slug,
          created_at: lead.created_at,
        }));
        results.ebookLeadsTotal = count || 0;
      }

      if (type === "all" || type === "subscribers") {
        let query = supabase
          .from("newsletter_subscribers")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });

        if (type === "subscribers") {
          query = query.range(offset, offset + limit - 1);
        } else {
          query = query.limit(limit);
        }

        const { data: subscribers, count, error } = await query;

        if (error) throw error;

        results.subscribers = subscribers || [];
        results.subscribersTotal = count || 0;
      }

      if (search) {
        const searchLower = search.toLowerCase();
        if (results.ebookLeads) {
          results.ebookLeads = results.ebookLeads.filter((lead: { name?: string; email?: string }) =>
            lead.name?.toLowerCase().includes(searchLower) ||
            lead.email?.toLowerCase().includes(searchLower)
          );
        }
        if (results.subscribers) {
          results.subscribers = results.subscribers.filter((sub: { email?: string }) =>
            sub.email?.toLowerCase().includes(searchLower)
          );
        }
      }

      return new Response(JSON.stringify(results), {
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
