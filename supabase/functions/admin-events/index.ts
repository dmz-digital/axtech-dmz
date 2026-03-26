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
    const eventId = pathParts[pathParts.length - 1];
    const isIdRoute = eventId && eventId !== "admin-events";

    if (req.method === "GET") {
      if (isIdRoute) {
        const { data: event, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", eventId)
          .maybeSingle();

        if (error) throw error;
        if (!event) {
          return new Response(
            JSON.stringify({ error: "Event not found" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(JSON.stringify({ event }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const limit = parseInt(url.searchParams.get("limit") || "50");
      const offset = parseInt(url.searchParams.get("offset") || "0");
      const upcoming = url.searchParams.get("upcoming");

      let query = supabase
        .from("events")
        .select("*", { count: "exact" })
        .order("event_date", { ascending: true })
        .range(offset, offset + limit - 1);

      if (upcoming === "true") {
        query = query.gte("event_date", new Date().toISOString().split("T")[0]);
      }

      const { data: events, error, count } = await query;

      if (error) throw error;

      return new Response(JSON.stringify({ events, total: count }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { slug, data, event_date, event_time, location, location_type, image_url, registration_url, is_published } = body;

      if (!slug || !event_date) {
        return new Response(
          JSON.stringify({ error: "slug and event_date are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: event, error } = await supabase
        .from("events")
        .insert({
          slug,
          data: data || {},
          event_date,
          event_time: event_time || null,
          location: location || null,
          location_type: location_type || "presencial",
          image_url: image_url || null,
          registration_url: registration_url || null,
          is_published: is_published ?? false,
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ event }), {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "PUT") {
      if (!isIdRoute) {
        return new Response(
          JSON.stringify({ error: "Event ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const body = await req.json();
      const { slug, data, event_date, event_time, location, location_type, image_url, registration_url, is_published } = body;

      const updateData: Record<string, unknown> = {};
      if (slug !== undefined) updateData.slug = slug;
      if (data !== undefined) updateData.data = data;
      if (event_date !== undefined) updateData.event_date = event_date;
      if (event_time !== undefined) updateData.event_time = event_time;
      if (location !== undefined) updateData.location = location;
      if (location_type !== undefined) updateData.location_type = location_type;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (registration_url !== undefined) updateData.registration_url = registration_url;
      if (is_published !== undefined) updateData.is_published = is_published;

      const { data: event, error } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", eventId)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ event }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "DELETE") {
      if (!isIdRoute) {
        return new Response(
          JSON.stringify({ error: "Event ID required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

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
