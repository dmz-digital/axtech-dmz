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
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const upcoming = url.searchParams.get("upcoming") !== "false";

    let query = supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .order("event_date", { ascending: true })
      .limit(limit);

    if (upcoming) {
      query = query.gte("event_date", new Date().toISOString().split("T")[0]);
    }

    const { data: events, error } = await query;

    if (error) throw error;

    const formattedEvents = (events || []).map((event) => ({
      id: event.id,
      slug: event.slug,
      event_date: event.event_date,
      event_time: event.event_time,
      location: event.location,
      location_type: event.location_type,
      image_url: event.image_url,
      registration_url: event.registration_url,
      data: event.data,
    }));

    return new Response(JSON.stringify({ events: formattedEvents }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
