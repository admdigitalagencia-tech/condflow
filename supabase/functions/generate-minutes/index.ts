import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { assembly_id } = await req.json();
    if (!assembly_id) throw new Error("assembly_id is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all assembly data in parallel
    const [assemblyRes, pointsRes, attendeesRes, transcriptsRes, docsRes, existingMinutesRes] = await Promise.all([
      supabase.from("assemblies").select("*, condominiums(name, address_line, nif)").eq("id", assembly_id).single(),
      supabase.from("assembly_points").select("*").eq("assembly_id", assembly_id).order("point_order"),
      supabase.from("assembly_attendees").select("*").eq("assembly_id", assembly_id).order("attendee_name"),
      supabase.from("transcripts").select("*").eq("assembly_id", assembly_id).eq("processing_status", "concluida"),
      supabase.from("documents").select("title, document_type, extracted_text").eq("assembly_id", assembly_id),
      supabase.from("minutes").select("id").eq("assembly_id", assembly_id),
    ]);

    if (assemblyRes.error) throw new Error("Assembleia não encontrada");
    const assembly = assemblyRes.data;
    const points = pointsRes.data || [];
    const attendees = attendeesRes.data || [];
    const transcripts = transcriptsRes.data || [];
    const docs = docsRes.data || [];
    const versionNumber = (existingMinutesRes.data?.length || 0) + 1;

    // Build context for AI
    const condo = assembly.condominiums;
    const condoInfo = condo ? `${condo.name}${condo.address_line ? `, ${condo.address_line}` : ""}${condo.nif ? ` (NIF: ${condo.nif})` : ""}` : "N/A";

    const formatDate = (d: string) => {
      const date = new Date(d);
      return date.toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" });
    };

    const attendeesList = attendees.map((a: any) => {
      let entry = `- ${a.attendee_name}`;
      if (a.unit_code) entry += ` (Fração: ${a.unit_code})`;
      if (a.permillage) entry += ` — ${a.permillage}‰`;
      entry += ` — ${a.attendance_type}`;
      if (a.represented_by) entry += ` (representado por: ${a.represented_by})`;
      return entry;
    }).join("\n");

    const pointsText = points.map((p: any) => {
      let text = `### Ponto ${p.point_order}: ${p.title}`;
      if (p.description) text += `\nDescrição: ${p.description}`;
      if (p.discussion_summary) text += `\nResumo da Discussão: ${p.discussion_summary}`;
      if (p.proposal_text) text += `\nProposta: ${p.proposal_text}`;
      if (p.voting_result_text) text += `\nResultado da Votação: ${p.voting_result_text}`;
      if (p.deliberation_text) text += `\nDeliberação: ${p.deliberation_text}`;
      return text;
    }).join("\n\n");

    const transcriptionText = transcripts.length > 0
      ? transcripts.map((t: any) => t.raw_text).filter(Boolean).join("\n\n")
      : null;

    const docsText = docs.length > 0
      ? docs.filter((d: any) => d.extracted_text).map((d: any) => `[${d.title}]: ${d.extracted_text}`).join("\n\n")
      : null;

    const systemPrompt = `Você é um redator profissional de atas de assembleia de condomínios em Portugal. A sua função é gerar uma ata formal, clara e administrativa com base EXCLUSIVAMENTE nos dados fornecidos.

REGRAS FUNDAMENTAIS:
- NÃO invente informações que não constem dos dados
- Use linguagem formal, clara e administrativa em português de Portugal
- Siga RIGOROSAMENTE o modelo de ata abaixo
- Se não houver informação sobre um ponto, indique "Sem informação registada"
- Utilize o tempo verbal no pretérito (passado)

MODELO DA ATA:

---

ATA DA ASSEMBLEIA [TIPO] DE CONDÓMINOS

[Nome do Condomínio]

Aos [data por extenso], pelas [hora], reuniram-se em [local] os condóminos do edifício sito em [morada], para a realização da Assembleia [Tipo] de Condóminos, com a seguinte ordem de trabalhos:

[Lista numerada da ordem de trabalhos]

PRESENÇAS:
[Lista de participantes com frações e tipo de presença]

Verificado o quórum, [informação sobre quórum], deu-se início aos trabalhos, tendo presidido [nome do presidente da mesa].

---

Para cada ponto da ordem de trabalhos:

PONTO [N] — [Título]

[Resumo da discussão baseado nos dados disponíveis]

Deliberação: [Decisão tomada ou "Não foi tomada deliberação formal"]

---

DELIBERAÇÕES APROVADAS:
[Lista resumida de todas as decisões aprovadas]

ENCERRAMENTO:
Nada mais havendo a tratar, foi encerrada a sessão pelas [hora estimada], da qual se lavrou a presente ata que, depois de lida e aprovada, vai ser assinada pelos presentes.

[Local], [Data]

O Presidente da Mesa: _______________
O Secretário: _______________

---`;

    const userPrompt = `Gera a ata formal desta assembleia com base nos seguintes dados:

## INFORMAÇÕES DA ASSEMBLEIA
- Condomínio: ${condoInfo}
- Tipo: ${assembly.assembly_type === "ordinaria" ? "Ordinária" : "Extraordinária"}
- Data: ${formatDate(assembly.scheduled_date)}
- Hora: ${assembly.scheduled_time ? assembly.scheduled_time.slice(0, 5) : "N/A"}
- Local: ${assembly.location || "N/A"}
- Presidida por: ${assembly.chaired_by || "N/A"}
${assembly.quorum_info ? `- Quórum: ${assembly.quorum_info}` : ""}

## ORDEM DE TRABALHOS (texto da convocatória)
${assembly.agenda_text || "Sem ordem de trabalhos em texto"}

## PONTOS DA ORDEM DE TRABALHOS (detalhados)
${pointsText || "Sem pontos registados"}

## LISTA DE PRESENÇA
${attendeesList || "Sem participantes registados"}
Total de participantes: ${attendees.length}

## NOTAS DO GESTOR
${assembly.notes || "Sem notas"}

${transcriptionText ? `## TRANSCRIÇÃO DA REUNIÃO\n${transcriptionText}` : ""}

${docsText ? `## CONTEÚDO DE DOCUMENTOS ANEXOS\n${docsText}` : ""}

Gera a ata completa seguindo o modelo fornecido. Usa APENAS os dados acima.`;

    // Call AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de pedidos excedido. Tente novamente em alguns instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error("Erro no serviço de IA");
    }

    const aiResult = await aiResponse.json();
    const generatedContent = aiResult.choices?.[0]?.message?.content || "";

    if (!generatedContent) throw new Error("A IA não gerou conteúdo");

    // Save minute
    const { data: minute, error: minuteError } = await supabase
      .from("minutes")
      .insert({
        assembly_id,
        title: `Ata v${versionNumber} — ${assembly.title}`,
        version_number: versionNumber,
        content_longtext: generatedContent,
        status: "rascunho",
        generation_source: "ai",
      })
      .select()
      .single();

    if (minuteError) throw minuteError;

    // Update assembly minutes status
    await supabase
      .from("assemblies")
      .update({ minutes_status: "rascunho" })
      .eq("id", assembly_id);

    // Log AI run
    await supabase.from("ai_runs").insert({
      feature_name: "generate_minutes",
      related_entity_type: "assembly",
      related_entity_id: assembly_id,
      condominium_id: assembly.condominium_id,
      status: "completed",
      input_snapshot_json: {
        points_count: points.length,
        attendees_count: attendees.length,
        has_transcription: transcripts.length > 0,
        has_notes: !!assembly.notes,
        docs_count: docs.length,
      },
      output_snapshot_json: {
        minute_id: minute.id,
        version_number: versionNumber,
        content_length: generatedContent.length,
      },
    });

    return new Response(JSON.stringify({ minute, success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-minutes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
