import { Document, Packer, Paragraph, TextRun, AlignmentType, PageBreak } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Parse markdown-ish minutes content into structured paragraphs for DOCX
 */
function parseContentToParagraphs(content: string): Paragraph[] {
  const lines = content.split('\n');
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paragraphs.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      continue;
    }

    if (trimmed.startsWith('# ')) {
      paragraphs.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240 },
        children: [new TextRun({ text: trimmed.slice(2), bold: true, size: 32, font: 'Times New Roman' })],
      }));
    } else if (trimmed.startsWith('## ')) {
      paragraphs.push(new Paragraph({
        spacing: { before: 360, after: 200 },
        children: [new TextRun({ text: trimmed.slice(3), bold: true, size: 28, font: 'Times New Roman', allCaps: true })],
      }));
    } else if (trimmed.startsWith('### ')) {
      paragraphs.push(new Paragraph({
        spacing: { before: 240, after: 120 },
        children: [new TextRun({ text: trimmed.slice(4), bold: true, size: 24, font: 'Times New Roman' })],
      }));
    } else if (trimmed === '---') {
      paragraphs.push(new Paragraph({
        spacing: { before: 200, after: 200 },
        border: { bottom: { style: 'single' as any, size: 6, color: '000000', space: 1 } },
        children: [],
      }));
    } else {
      // Process bold markers (**text**)
      const runs: TextRun[] = [];
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/);
      for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**')) {
          runs.push(new TextRun({ text: part.slice(2, -2), bold: true, size: 24, font: 'Times New Roman' }));
        } else if (part) {
          runs.push(new TextRun({ text: part, size: 24, font: 'Times New Roman' }));
        }
      }
      paragraphs.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 100 },
        children: runs,
      }));
    }
  }

  return paragraphs;
}

export async function exportToDocx(content: string, title: string, condoName?: string) {
  const headerParagraphs: Paragraph[] = [];

  if (condoName) {
    headerParagraphs.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: condoName, bold: true, size: 28, font: 'Times New Roman' })],
    }));
  }

  headerParagraphs.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 360 },
    children: [new TextRun({ text: title, bold: true, size: 24, font: 'Times New Roman' })],
  }));

  const contentParagraphs = parseContentToParagraphs(content);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24 },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1418, right: 1134, bottom: 1418, left: 1134 }, // ~2.5cm
        },
      },
      children: [...headerParagraphs, ...contentParagraphs],
    }],
  });

  const buffer = await Packer.toBlob(doc);
  const filename = `${title.replace(/[^a-zA-Z0-9À-ÿ\s-]/g, '').trim()}.docx`;
  saveAs(buffer, filename);
}

export function exportToPdf(content: string, title: string, condoName?: string, assemblyTitle?: string) {
  // Build HTML for print
  const htmlContent = content
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '<br/>';
      if (trimmed.startsWith('# ')) return `<h1>${trimmed.slice(2)}</h1>`;
      if (trimmed.startsWith('## ')) return `<h2>${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith('### ')) return `<h3>${trimmed.slice(4)}</h3>`;
      if (trimmed === '---') return '<hr/>';
      // Handle **bold**
      const processed = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      return `<p>${processed}</p>`;
    })
    .join('\n');

  const fullHtml = `<!DOCTYPE html>
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
  @media print { body { padding: 0; } }
</style>
</head>
<body>
<div class="header-info">
  ${condoName ? `<p><strong>${condoName}</strong></p>` : ''}
  ${assemblyTitle ? `<p>${assemblyTitle}</p>` : ''}
</div>
${htmlContent}
</body>
</html>`;

  // Open print dialog in new window
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Popup bloqueado. Permita popups para exportar PDF.');
  }
  printWindow.document.write(fullHtml);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };
}
