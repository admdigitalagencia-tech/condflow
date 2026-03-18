import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { document_id } = await req.json();
    if (!document_id) throw new Error("document_id is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch document
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("*")
      .eq("id", document_id)
      .single();

    if (docErr || !doc) throw new Error("Documento não encontrado");

    // Step 1: Extract text if not already done
    let extractedText = doc.extracted_text || "";

    if (!extractedText) {
      const { data: fileData, error: fileErr } = await supabase.storage
        .from("documents")
        .download(doc.file_path);

      if (fileErr || !fileData) throw new Error("Erro ao descarregar ficheiro");

      const mimeType = doc.mime_type || "application/octet-stream";
      const isImage = mimeType.startsWith("image/");
      const isPdf = mimeType === "application/pdf";
      const isText = mimeType === "text/plain";

      if (isText) {
        extractedText = await fileData.text();
      } else if (isImage || isPdf) {
        const base64 = btoa(
          new Uint8Array(await fileData.arrayBuffer()).reduce(
            (data, byte) => data + String.fromCharCode(byte), ""
          )
        );

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [{
              role: "user",
              content: [
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
                { type: "text", text: `Analisa este documento e extrai TODO o texto visível de forma completa e fiel ao original. Mantém a estrutura (parágrafos, listas, tabelas). Responde APENAS com o texto extraído, sem introduções.` },
              ],
            }],
          }),
        });

        if (!aiResponse.ok) {
          if (aiResponse.status === 429) {
            return new Response(JSON.stringify({ error: "Limite de pedidos excedido." }), {
              status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (aiResponse.status === 402) {
            return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
              status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          throw new Error("Erro no serviço de IA ao extrair texto");
        }

        const aiResult = await aiResponse.json();
        extractedText = aiResult.choices?.[0]?.message?.content || "";
      } else {
        extractedText = `[Formato ${mimeType} — extração automática não disponível]`;
      }

      // Save extracted text
      await supabase.from("documents").update({ extracted_text: extractedText }).eq("id", document_id);
    }

    // Step 2: Generate AI summary and extract metadata
    const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: `Analisa o seguinte documento e gera um resumo conciso em português de Portugal (máximo 3 parágrafos).

TIPO DO DOCUMENTO: ${doc.document_type}
TÍTULO: ${doc.title}

CONTEÚDO:
${extractedText.slice(0, 8000)}

Responde APENAS com o resumo, sem introduções.`,
        }],
      }),
    });

    let aiSummary = "";
    if (summaryResponse.ok) {
      const summaryResult = await summaryResponse.json();
      aiSummary = summaryResult.choices?.[0]?.message?.content || "";
    }

    // Step 3: Extract structured metadata
    const metadataResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{
          role: "user",
          content: `Analisa o seguinte documento e extrai informações estruturadas.

TIPO: ${doc.document_type}
TÍTULO: ${doc.title}

CONTEÚDO:
${extractedText.slice(0, 8000)}

Extrai as informações relevantes encontradas no documento.`,
        }],
        tools: [{
          type: "function",
          function: {
            name: "extract_metadata",
            description: "Extrai metadados estruturados de um documento",
            parameters: {
              type: "object",
              properties: {
                tipo_documento: { type: "string", description: "Tipo de documento identificado" },
                data_documento: { type: "string", description: "Data do documento (formato YYYY-MM-DD) ou null" },
                entidades: { type: "array", items: { type: "string" }, description: "Entidades (pessoas, empresas) mencionadas" },
                valores_financeiros: { type: "array", items: { type: "object", properties: { descricao: { type: "string" }, valor: { type: "number" } }, required: ["descricao", "valor"] }, description: "Valores monetários encontrados" },
                temas: { type: "array", items: { type: "string" }, description: "Temas/assuntos principais" },
                palavras_chave: { type: "array", items: { type: "string" }, description: "Palavras-chave relevantes" },
              },
              required: ["tipo_documento", "temas", "palavras_chave"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "extract_metadata" } },
      }),
    });

    let metadataJson: Record<string, any> = {};
    if (metadataResponse.ok) {
      const metadataResult = await metadataResponse.json();
      const toolCall = metadataResult.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        try {
          metadataJson = JSON.parse(toolCall.function.arguments);
        } catch { /* ignore parse errors */ }
      }
    }

    // Save summary and metadata
    await supabase.from("documents").update({
      ai_summary: aiSummary,
      metadata_json: metadataJson,
    }).eq("id", document_id);

    return new Response(
      JSON.stringify({
        success: true,
        ai_summary: aiSummary,
        metadata: metadataJson,
        has_extracted_text: !!extractedText,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("process-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
