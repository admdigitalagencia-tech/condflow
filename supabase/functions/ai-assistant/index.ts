import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, feature } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompts: Record<string, string> = {
      ticket_summary: `Você é um assistente de gestão de condomínios em Portugal. Analise a ocorrência fornecida e gere:
1. **Resumo do Problema**: descrição concisa do problema
2. **Situação Atual**: estado atual baseado no histórico
3. **Próximos Passos Sugeridos**: 2-3 ações concretas recomendadas

Use linguagem profissional em português de Portugal. Seja objetivo e prático.`,

      formal_response: `Você é um assistente de gestão de condomínios em Portugal. Gere uma resposta formal e profissional para comunicação com condóminos. A resposta deve:
- Ser redigida em português de Portugal formal
- Incluir saudação e despedida adequadas
- Ser empática mas objetiva
- Incluir informação sobre o estado atual e próximos passos
- Ter tom institucional e profissional`,

      assembly_summary: `Você é um assistente de gestão de condomínios em Portugal. Analise as informações da assembleia e gere:
1. **Resumo da Reunião**: síntese dos temas abordados
2. **Decisões Principais**: deliberações tomadas
3. **Lista de Tarefas**: ações a executar após a assembleia, com responsáveis sugeridos

Use linguagem formal em português de Portugal.`,

      next_steps: `Você é um assistente de gestão de condomínios em Portugal. Com base no contexto fornecido, sugira os próximos passos operacionais que o gestor deve tomar. Seja concreto, prático e priorize por urgência. Use português de Portugal.`,

      general: `Você é um assistente inteligente para gestão de condomínios em Portugal (CondoFlow). Ajude o gestor com análises, resumos, sugestões e redação de textos administrativos. Use português de Portugal formal e profissional.`,
    };

    const systemPrompt = systemPrompts[feature] || systemPrompts.general;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de pedidos excedido. Tente novamente em alguns instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos na área de configurações." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
