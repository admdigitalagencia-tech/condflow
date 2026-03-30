import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuthenticatedUser, requireEntityAccess } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { assembly_id } = await req.json();
    if (!assembly_id) throw new Error("assembly_id is required");

    const { user, adminClient: supabase } = await requireAuthenticatedUser(req);
    const organizationId = await requireEntityAccess(supabase, user.id, "assemblies", "id", assembly_id);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
- Use português europeu formal, estilo jurídico-administrativo
- Escreva em frases completas e narrativa cronológica
- NUNCA use bullet points no corpo da ata
- Use o pretérito (passado)
- Se não houver informação sobre um ponto, indique "Sem informação registada"

ESTRUTURA OBRIGATÓRIA DA ATA:

---

ACTA

ATA Nº [version_number]

"Aos [data por extenso], reuniu-se em [tipo de convocatória] e em sessão [tipo de assembleia — ordinária/extraordinária], pelas [hora], na [local da reunião], os proprietários das frações autónomas do prédio constituído em regime de propriedade horizontal, sito em [morada do condomínio]."

Em seguida indicar forma de convocatória, antecedência legal e ordem de trabalhos.

ORDEM DE TRABALHOS

Apresentar numerada:
1º [título]
2º [título]
...

PRESENÇAS

Descrever em texto corrido:
- frações presentes e representadas
- permilagem total representada
- verificação de quórum

Exemplo: "Estiveram presentes ou representados os condóminos das frações (...) conforme folha de presenças anexa, representando uma permilagem total de (...)‰."

DESENVOLVIMENTO DA ASSEMBLEIA

Para cada ponto da ordem de trabalhos, escrever em estilo narrativo formal:

"No Ponto [N] da Ordem de Trabalhos, [resumo da apresentação]. [Resumo da discussão e esclarecimentos prestados]. [Decisão final e resultado da votação]."

A linguagem deve ser narrativa e administrativa. Transformar notas e transcrições em texto formal completo.

DELIBERAÇÕES

Quando houver votação ou decisão, registar:
- "aprovado por unanimidade"
- "aprovado por maioria de X‰ contra Y‰"
- "rejeitado"
- abstenções

Se existirem quadros ou anexos, referenciar: "conforme quadro anexo" ou "Quadro I – [Título]".

ENCERRAMENTO

"Nada mais havendo a tratar, foi encerrada a reunião pelas [hora estimada], da qual se lavrou a presente ata que, depois de lida e aprovada, vai ser assinada pelos presentes."

[Local], [Data]

ASSINATURAS

O Presidente da Assembleia: _______________
A Administração: _______________

---`;

    const userPrompt = `Gera a ata formal desta assembleia seguindo RIGOROSAMENTE o modelo fornecido.

## INFORMAÇÕES DA ASSEMBLEIA
- Condomínio: ${condoInfo}
- Tipo: ${assembly.assembly_type === "ordinaria" ? "Ordinária" : "Extraordinária"}
- Data: ${formatDate(assembly.scheduled_date)}
- Hora: ${assembly.scheduled_time ? assembly.scheduled_time.slice(0, 5) : "N/A"}
- Local: ${assembly.location || "N/A"}
- Presidida por: ${assembly.chaired_by || "N/A"}
${assembly.quorum_info ? `- Quórum: ${assembly.quorum_info}` : ""}
- Número da versão: ${versionNumber}

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

Gera a ata completa seguindo o modelo oficial. Usa APENAS os dados acima. Escreve em português europeu formal, estilo jurídico-administrativo, sem bullet points, com narrativa cronológica.`;

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
        organization_id: organizationId,
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
      organization_id: organizationId,
      feature_name: "generate_minutes",
      related_entity_type: "assembly",
      related_entity_id: assembly_id,
      condominium_id: assembly.condominium_id,
      status: "completed",
      created_by: user.id,
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
