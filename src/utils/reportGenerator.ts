export function generateReportText(result: any, formData: any, pdfText: string) {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════');
  lines.push('         PROOFPULSE RISK REPORT        ');
  lines.push('═══════════════════════════════════════');
  lines.push('');
  lines.push(`Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`);
  lines.push(`Time: ${new Date().toLocaleTimeString()}`);
  lines.push('');

  lines.push('───────────────────────────────────────');
  lines.push('  RISK ASSESSMENT SUMMARY');
  lines.push('───────────────────────────────────────');
  lines.push(`Overall Risk Score: ${result.score} / 100`);
  lines.push(`Risk Level: ${result.level}`);
  lines.push(`Total Red Flags: ${result.redFlags.length}`);
  lines.push('');

  lines.push('───────────────────────────────────────');
  lines.push('  4-LAYER BREAKDOWN');
  lines.push('───────────────────────────────────────');
  if (result.layers) {
    for (const layer of result.layers) {
      lines.push(`${layer.name} (${Math.round(layer.weight * 100)}% weight)`);
      lines.push(`  Score: ${layer.score}/100 → Weighted: ${layer.weightedScore} pts`);
      lines.push(`  Status: ${layer.level}`);
      if (layer.flags.length > 0) {
        layer.flags.forEach((f: any) => {
          lines.push(`  • [${f.severity.toUpperCase()}] ${f.label} — ${f.detail}`);
        });
      } else {
        lines.push('  ✓ No issues detected');
      }
      lines.push('');
    }
  }

  lines.push('───────────────────────────────────────');
  lines.push('  INPUT DETAILS');
  lines.push('───────────────────────────────────────');
  lines.push(`HR Email: ${formData?.hrEmail || 'Not provided'}`);
  lines.push(`Company Website: ${formData?.companyWebsite || 'Not provided'}`);
  lines.push(`Interview Conducted: ${formData?.hadInterview ? 'Yes' : 'No'}`);
  lines.push(`Interview Rounds: ${formData?.interviewRounds}`);
  lines.push(`Payment Requested: ${formData?.paymentRequested ? 'Yes' : 'No'}`);
  lines.push('');

  lines.push('───────────────────────────────────────');
  lines.push('  DISCLAIMER');
  lines.push('───────────────────────────────────────');
  lines.push('ProofPulse provides risk indicators only. It does NOT');
  lines.push('declare any offer as fake or real. Always verify through');
  lines.push('official company channels and independent research.');
  lines.push('');
  lines.push('═══════════════════════════════════════');

  return lines.join('\n');
}

export function downloadReport(content: string, filename = 'proofpulse-report.txt') {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
