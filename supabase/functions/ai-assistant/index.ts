import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, feature, condominiumContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const basePrompts: Record<string, string> = {
      condominium_summary: `Você é um assistente de gestão de condomínios em Portugal (CondFlow). Analise os dados do condomínio fornecido e gere um resumo operacional completo:
1. **Visão Geral**: síntese da situação atual do prédio
2. **Problemas Prioritários**: ocorrências abertas mais urgentes
3. **Decisões Recentes**: últimas deliberações de assembleias
4. **Tarefas Pendentes**: ações que precisam de atenção
5. **Recomendações**: sugestões operacionais para o gestor

Responda APENAS com base nos dados fornecidos. Não invente informações. Use português de Portugal formal e profissional.`,

      ticket_summary: `Você é um assistente de gestão de condomínios em Portugal. Analise a ocorrência fornecida e gere:
1. **Resumo do Problema**: descrição concisa do problema
2. **Situação Atual**: estado atual baseado no histórico
3. **Próximos Passos Sugeridos**: 2-3 ações concretas recomendadas

Responda APENAS com base nos dados fornecidos. Use linguagem profissional em português de Portugal. Seja objetivo e prático.`,

      formal_response: `Você é um assistente de gestão de condomínios em Portugal. Gere uma resposta formal e profissional para comunicação com condóminos. A resposta deve:
- Ser redigida em português de Portugal formal
- Incluir saudação e despedida adequadas
- Ser empática mas objetiva
- Incluir informação sobre o estado atual e próximos passos
- Ter tom institucional e profissional
- Basear-se APENAS nos dados fornecidos`,

      assembly_summary: `Você é um assistente de gestão de condomínios em Portugal. Analise as informações da assembleia e gere:
1. **Resumo da Reunião**: síntese dos temas abordados
2. **Decisões Principais**: deliberações tomadas
3. **Pontos Pendentes**: assuntos por resolver
4. **Lista de Tarefas**: ações a executar após a assembleia, com responsáveis sugeridos

Responda APENAS com base nos dados fornecidos. Use linguagem formal em português de Portugal.`,

      assembly_tasks: `Você é um assistente de gestão de condomínios em Portugal. Com base na assembleia e seus pontos, gere:
1. **Lista de Deliberações**: decisões formais tomadas
2. **Tarefas Operacionais**: ações concretas a executar, cada uma com:
   - Descrição clara
   - Prioridade sugerida (baixa/média/alta/urgente)
   - Prazo sugerido
3. **Follow-ups**: acompanhamentos necessários

Responda APENAS com base nos dados fornecidos. Use português de Portugal.`,

      next_steps: `Você é um assistente de gestão de condomínios em Portugal. Com base no contexto fornecido (incluindo documentos armazenados), sugira os próximos passos operacionais que o gestor deve tomar. Seja concreto, prático e priorize por urgência. Use dados dos documentos quando disponíveis. Responda APENAS com base nos dados fornecidos. Use português de Portugal.`,

      history_query: `Você é um assistente de gestão de condomínios em Portugal (CondFlow). O utilizador vai fazer perguntas sobre o histórico de um condomínio específico. Use os documentos armazenados (atas, contratos, orçamentos, relatórios) como fonte primária de informação. Responda APENAS com base nos dados fornecidos. Se não houver informação suficiente nos dados, diga explicitamente que não encontrou dados sobre o tema. Nunca invente informações. Use português de Portugal formal.`,

      document_analysis: `Você é um assistente de gestão de condomínios em Portugal (CondFlow). Analise os documentos do condomínio (atas, contratos, orçamentos, relatórios técnicos, faturas) e responda perguntas com base no conteúdo real dos documentos. Quando citar informação, indique de qual documento provém. Extraia valores, datas, entidades e decisões dos documentos. Responda APENAS com base nos dados fornecidos. Use português de Portugal formal.`,

      general: `Você é um assistente inteligente para gestão de condomínios em Portugal (CondFlow). Ajude o gestor com análises, resumos, sugestões e redação de textos administrativos. Use os documentos armazenados como fonte primária de informação — atas, contratos, orçamentos, relatórios técnicos e faturas contêm dados reais que devem fundamentar as suas respostas. Responda APENAS com base nos dados do condomínio fornecidos — nunca invente informações. Use português de Portugal formal e profissional.`,
    };

    let systemPrompt = basePrompts[feature] || basePrompts.general;

    // Append condominium context if provided
    if (condominiumContext) {
      systemPrompt += `\n\n---\n\nDados do condomínio para análise:\n\n${condominiumContext}`;
    }

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
