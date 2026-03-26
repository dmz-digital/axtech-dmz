import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DownloadRequest {
  name: string;
  email: string;
  ebook_id: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }

  try {
    const { name, email, ebook_id }: DownloadRequest = await req.json();

    if (!name || !email || !ebook_id) {
      return new Response(
        JSON.stringify({ error: "Name, email, and ebook_id are required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: ebook, error: ebookError } = await supabase
      .from("ebooks")
      .select("id, pdf_path, data")
      .eq("id", ebook_id)
      .eq("is_published", true)
      .maybeSingle();

    if (ebookError) {
      throw ebookError;
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

    const { error: leadError } = await supabase
      .from("ebook_leads")
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        ebook_id: ebook_id,
      });

    if (leadError) {
      throw leadError;
    }

    await supabase.rpc("increment_ebook_download_count", { ebook_uuid: ebook_id });

    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("ebook-pdfs")
      .createSignedUrl(ebook.pdf_path, 300);

    if (signedUrlError) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Lead registered successfully",
          download_url: null,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Lead registered successfully",
        download_url: signedUrlData.signedUrl,
        filename: `${ebook.data?.title_pt || "ebook"}.pdf`,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process download request" }),
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
