import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { document_id, action } = await req.json();
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

    // Get the file from storage
    const { data: fileData, error: fileErr } = await supabase.storage
      .from("documents")
      .download(doc.file_path);

    if (fileErr || !fileData) throw new Error("Erro ao descarregar ficheiro");

    const mimeType = doc.mime_type || "application/octet-stream";
    const isImage = mimeType.startsWith("image/");
    const isPdf = mimeType === "application/pdf";
    const isText = mimeType === "text/plain";

    let extractedText = "";

    if (isText) {
      extractedText = await fileData.text();
    } else if (isImage || isPdf) {
      // Use Gemini vision to extract text from images and PDFs
      const base64 = btoa(
        new Uint8Array(await fileData.arrayBuffer()).reduce(
          (data, byte) => data + String.fromCharCode(byte), ""
        )
      );

      const contentParts: any[] = [
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64}`,
          },
        },
        {
          type: "text",
          text: `Analisa este documento e extrai TODO o texto visível de forma completa e fiel ao original.

REGRAS:
- Extrai o texto exatamente como aparece no documento
- Mantém a estrutura (parágrafos, listas, tabelas)
- Se for uma lista de presença, extrai todos os nomes, frações, permilagens e assinaturas
- Se for uma tabela, formata como tabela com separadores
- NÃO adiciones comentários, interpretações ou texto que não exista no documento
- Se não conseguires ler alguma parte, indica [ilegível]
- Responde APENAS com o texto extraído, sem introduções`,
        },
      ];

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: contentParts,
            },
          ],
        }),
      });

      if (!aiResponse.ok) {
        if (aiResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Limite de pedidos excedido. Tente novamente." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await aiResponse.text();
        console.error("AI extraction error:", aiResponse.status, errText);
        throw new Error("Erro no serviço de IA ao extrair texto");
      }

      const aiResult = await aiResponse.json();
      extractedText = aiResult.choices?.[0]?.message?.content || "";
    } else {
      extractedText = `[Formato ${mimeType} — extração automática não disponível]`;
    }

    // Save extracted text to document
    await supabase
      .from("documents")
      .update({ extracted_text: extractedText })
      .eq("id", document_id);

    // If action is parse_attendance, parse the extracted text into attendees
    let attendees: any[] = [];
    if (action === "parse_attendance" && doc.assembly_id) {
      const parseResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: `Analisa o seguinte texto extraído de uma lista de presença de assembleia de condomínio e devolve um JSON array com os participantes identificados.

Para cada participante, extrai:
- "attendee_name": nome completo
- "unit_code": fração/lote (ex: "A", "1ºDto", etc.) ou null
- "permillage": permilagem em número (ex: 45.5) ou null
- "attendance_type": "presencial", "representado" ou "ausente"
- "represented_by": nome do representante se aplicável, ou null

Responde APENAS com o JSON array, sem markdown, sem explicações.

TEXTO EXTRAÍDO:
${extractedText}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "register_attendees",
                description: "Register attendance list from extracted document",
                parameters: {
                  type: "object",
                  properties: {
                    attendees: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          attendee_name: { type: "string" },
                          unit_code: { type: "string", nullable: true },
                          permillage: { type: "number", nullable: true },
                          attendance_type: { type: "string", enum: ["presencial", "representado", "ausente"] },
                          represented_by: { type: "string", nullable: true },
                        },
                        required: ["attendee_name", "attendance_type"],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["attendees"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "register_attendees" } },
        }),
      });

      if (parseResponse.ok) {
        const parseResult = await parseResponse.json();
        const toolCall = parseResult.choices?.[0]?.message?.tool_calls?.[0];
        if (toolCall?.function?.arguments) {
          try {
            const parsed = JSON.parse(toolCall.function.arguments);
            attendees = parsed.attendees || [];

            // Insert attendees into the assembly
            if (attendees.length > 0) {
              const rows = attendees.map((a: any) => ({
                assembly_id: doc.assembly_id,
                attendee_name: a.attendee_name,
                unit_code: a.unit_code || null,
                permillage: a.permillage || null,
                attendance_type: a.attendance_type || "presencial",
                represented_by: a.represented_by || null,
              }));

              const { error: insertErr } = await supabase
                .from("assembly_attendees")
                .insert(rows);

              if (insertErr) {
                console.error("Error inserting attendees:", insertErr);
              }
            }
          } catch (e) {
            console.error("Error parsing attendees JSON:", e);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        extracted_text: extractedText,
        attendees_count: attendees.length,
        attendees,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("extract-document error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
