import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireAuthenticatedUser, requireEntityAccess } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { minute_id, format } = await req.json();
    if (!minute_id) throw new Error("minute_id is required");
    if (!format || !["pdf", "docx"].includes(format)) throw new Error("format must be 'pdf' or 'docx'");

    const { user, adminClient: supabase } = await requireAuthenticatedUser(req);
    await requireEntityAccess(supabase, user.id, "minutes", "id", minute_id);

    // Fetch minute with assembly info
    const { data: minute, error: minuteErr } = await supabase
      .from("minutes")
      .select("*, assemblies(title, scheduled_date, condominium_id, condominiums(name))")
      .eq("id", minute_id)
      .single();

    if (minuteErr || !minute) throw new Error("Ata não encontrada");

    const content = minute.content_longtext || "";
    const title = minute.title || "Ata";
    const condoName = (minute.assemblies as any)?.condominiums?.name || "";
    const assemblyTitle = (minute.assemblies as any)?.title || "";
    const scheduledDate = (minute.assemblies as any)?.scheduled_date || "";

    if (format === "pdf") {
      // Generate a clean HTML that will be converted to PDF via print-style rendering
      const html = buildPdfHtml(content, title, condoName, assemblyTitle, scheduledDate);
      // Return HTML with instructions for client-side PDF generation
      return new Response(JSON.stringify({ html, title, format: "pdf" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (format === "docx") {
      // Return structured data for client-side DOCX generation
      return new Response(JSON.stringify({ content, title, condoName, assemblyTitle, scheduledDate, format: "docx" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Formato não suportado");
  } catch (e) {
    console.error("export-minutes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function buildPdfHtml(content: string, title: string, condoName: string, assemblyTitle: string, scheduledDate: string): string {
  // Convert markdown-ish content to HTML paragraphs
  const htmlContent = content
    .split("\n")
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("# ")) return `<h1>${trimmed.slice(2)}</h1>`;
      if (trimmed.startsWith("## ")) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith("### ")) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith("---")) return `<hr/>`;
      return `<p>${trimmed}</p>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="pt">
<head>
<meta charset="UTF-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 2.5cm; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; max-width: 210mm; margin: 0 auto; padding: 2.5cm; }
  h1 { font-size: 16pt; text-align: center; font-weight: bold; margin-bottom: 1em; text-transform: uppercase; }
  h2 { font-size: 14pt; font-weight: bold; margin-top: 1.5em; margin-bottom: 0.5em; text-transform: uppercase; }
  h3 { font-size: 12pt; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; }
  p { margin: 0.4em 0; text-align: justify; }
  hr { border: none; border-top: 1px solid #000; margin: 1.5em 0; }
  .header-info { text-align: center; margin-bottom: 2em; }
  .header-info p { text-align: center; }
  .signatures { margin-top: 3em; }
  .signature-line { margin-top: 2em; border-bottom: 1px solid #000; width: 60%; }
  .signature-label { font-size: 10pt; margin-top: 0.3em; }
</style>
</head>
<body>
<div class="header-info">
  <p><strong>${condoName}</strong></p>
  <p>${assemblyTitle}</p>
</div>
${htmlContent}
</body>
</html>`;
}
