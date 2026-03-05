const encoder = new TextEncoder();

function byteLength(text: string) {
  return encoder.encode(text).length;
}

function sanitizePdfText(text: string) {
  return text
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function chunkLines(lines: string[], size: number) {
  const chunks: string[][] = [];
  for (let i = 0; i < lines.length; i += size) {
    chunks.push(lines.slice(i, i + size));
  }
  return chunks.length ? chunks : [[""]];
}

function createPdfBlobFromText(content: string) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const linesPerPage = 44;
  const pageChunks = chunkLines(lines, linesPerPage);

  const totalPages = pageChunks.length;
  const firstPageObj = 3;
  const firstContentObj = firstPageObj + totalPages;
  const fontObj = firstContentObj + totalPages;
  const totalObjects = fontObj;

  const objects: string[] = new Array(totalObjects + 1).fill("");
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";

  const pageKids: string[] = [];
  for (let i = 0; i < totalPages; i++) {
    pageKids.push(`${firstPageObj + i} 0 R`);
  }
  objects[2] = `<< /Type /Pages /Kids [${pageKids.join(" ")}] /Count ${totalPages} >>`;

  for (let i = 0; i < totalPages; i++) {
    const pageObj = firstPageObj + i;
    const contentObj = firstContentObj + i;

    const pageLines = pageChunks[i];
    const firstLine = sanitizePdfText(pageLines[0] ?? "");
    const nextLines = pageLines
      .slice(1)
      .map((line) => `T* (${sanitizePdfText(line)}) Tj`)
      .join("\n");
    const streamText =
      `BT\n/F1 11 Tf\n14 TL\n50 750 Td\n(${firstLine}) Tj` +
      (nextLines ? `\n${nextLines}` : "") +
      "\nET";

    objects[contentObj] =
      `<< /Length ${byteLength(streamText)} >>\nstream\n` +
      `${streamText}\n` +
      "endstream";

    objects[pageObj] =
      "<< /Type /Page /Parent 2 0 R " +
      `/MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObj} 0 R >> >> ` +
      `/Contents ${contentObj} 0 R >>`;
  }

  objects[fontObj] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = new Array(totalObjects + 1).fill(0);

  for (let i = 1; i <= totalObjects; i++) {
    offsets[i] = byteLength(pdf);
    pdf += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefStart = byteLength(pdf);
  pdf += `xref\n0 ${totalObjects + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= totalObjects; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${totalObjects + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function generateReportText(result: any, formData: any, _pdfText: string) {
  const lines: string[] = [];

  lines.push("=======================================");
  lines.push("         PROOFPULSE RISK REPORT");
  lines.push("=======================================");
  lines.push("");
  lines.push(
    `Date: ${new Date().toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`
  );
  lines.push(`Time: ${new Date().toLocaleTimeString()}`);
  lines.push("");

  lines.push("---------------------------------------");
  lines.push("RISK ASSESSMENT SUMMARY");
  lines.push("---------------------------------------");
  lines.push(`Overall Risk Score: ${result.score} / 100`);
  lines.push(`Risk Level: ${result.level}`);
  lines.push(`Total Red Flags: ${result.redFlags.length}`);
  lines.push("");

  lines.push("---------------------------------------");
  lines.push("4-LAYER BREAKDOWN");
  lines.push("---------------------------------------");
  if (result.layers) {
    for (const layer of result.layers) {
      lines.push(`${layer.name} (${Math.round(layer.weight * 100)}% weight)`);
      lines.push(`  Score: ${layer.score}/100 -> Weighted: ${layer.weightedScore} pts`);
      lines.push(`  Status: ${layer.level}`);
      if (layer.flags.length > 0) {
        layer.flags.forEach((f: any) => {
          lines.push(
            `  - [${f.severity.toUpperCase()}] ${f.label} - ${f.detail}`
          );
        });
      } else {
        lines.push("  - No issues detected");
      }
      lines.push("");
    }
  }

  lines.push("---------------------------------------");
  lines.push("INPUT DETAILS");
  lines.push("---------------------------------------");
  lines.push(`HR Email: ${formData?.hrEmail || "Not provided"}`);
  lines.push(`Company Website: ${formData?.companyWebsite || "Not provided"}`);
  lines.push(`Interview Conducted: ${formData?.hadInterview ? "Yes" : "No"}`);
  lines.push(`Interview Rounds: ${formData?.interviewRounds}`);
  lines.push(`Payment Requested: ${formData?.paymentRequested ? "Yes" : "No"}`);
  lines.push("");

  lines.push("---------------------------------------");
  lines.push("DISCLAIMER");
  lines.push("---------------------------------------");
  lines.push("ProofPulse provides risk indicators only.");
  lines.push("It does not declare any offer as fake or real.");
  lines.push("Always verify through official company channels.");
  lines.push("");
  lines.push("=======================================");

  return lines.join("\n");
}

export function downloadReport(content: string, filename = "proofpulse-report.pdf") {
  const blob = createPdfBlobFromText(content);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
