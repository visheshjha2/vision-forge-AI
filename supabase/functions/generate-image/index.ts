import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { prompt, size, style, model } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let imageBase64: string;
    const type = model === "model2" ? "model2" : "model1";

    if (model === "model2") {
      // Use Lovable AI (Gemini) for Model 2
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

      const enhancedPrompt = `Generate a ${style} style image with aspect ratio ${size}. ${prompt}`;
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: enhancedPrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!aiResponse.ok) {
        const status = aiResponse.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway error: ${status}`);
      }

      const aiData = await aiResponse.json();
      const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      if (!imageUrl) throw new Error("No image generated");

      imageBase64 = imageUrl.replace(/^data:image\/\w+;base64,/, "");
    } else {
      // Use Hugging Face for Model 1
      const HF_KEY = Deno.env.get("HUGGING_FACE_API_KEY");
      if (!HF_KEY) throw new Error("HUGGING_FACE_API_KEY is not configured");

      const enhancedPrompt = `${style} style, ${prompt}`;
      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HF_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: enhancedPrompt }),
        }
      );

      if (!hfResponse.ok) {
        const errText = await hfResponse.text();
        console.error("HF error:", hfResponse.status, errText);
        if (hfResponse.status === 503) {
          return new Response(JSON.stringify({ error: "Model is loading. Please try again in ~30 seconds." }), {
            status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`Hugging Face error: ${hfResponse.status}`);
      }

      const imageBlob = await hfResponse.arrayBuffer();
      const bytes = new Uint8Array(imageBlob);
      // Convert to base64
      let binary = "";
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      imageBase64 = btoa(binary);
    }

    // Decode base64 and upload to storage
    const rawBytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
    const fileName = `${user.id}/${Date.now()}-${type}.png`;

    const { error: uploadError } = await adminClient.storage
      .from("generated-images")
      .upload(fileName, rawBytes, { contentType: "image/png", upsert: false });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: publicUrlData } = adminClient.storage
      .from("generated-images")
      .getPublicUrl(fileName);

    const resultUrl = publicUrlData.publicUrl;

    // Save to projects table
    const { error: insertError } = await supabase.from("projects").insert({
      user_id: user.id,
      type: "image",
      prompt,
      size,
      status: "completed",
      result_url: resultUrl,
    });

    if (insertError) console.error("Failed to save project:", insertError);

    return new Response(JSON.stringify({ image_url: resultUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
