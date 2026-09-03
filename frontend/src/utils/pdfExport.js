import { jsPDF } from 'jspdf';

export const generatePDF = async (report) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new jsPDF();
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - 2 * margin;
      let y = margin;
      
      const addNewPageIfNeeded = (heightNeeded) => {
        if (y + heightNeeded > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      const addWrappedText = (text, fontSize = 12, isBold = false, textColor = [0, 0, 0]) => {
        if (!text) return;
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        doc.setTextColor(...textColor);
        
        const safeText = String(text);
        const lines = doc.splitTextToSize(safeText, contentWidth);
        const lineHeight = fontSize * 0.352778 * 1.5;
        
        for (let i = 0; i < lines.length; i++) {
          addNewPageIfNeeded(lineHeight);
          doc.text(lines[i], margin, y);
          y += lineHeight;
        }
        y += 2; // small padding after paragraph
      };

      const addSectionHeader = (title) => {
        y += 5;
        addNewPageIfNeeded(15);
        addWrappedText(title, 14, true, [34, 211, 238]);
        y += 2;
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;
      };

      // --- HEADER ---
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(10, 10, 10);
      doc.text("PRISM", margin, y);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text("Intelligence Report", margin + 30, y);
      
      const date = new Date(report.createdAt).toLocaleDateString();
      doc.text(`Generated: ${date}`, pageWidth - margin - 40, y);
      
      y += 15;
      
      // --- TITLE & SUMMARY ---
      const reportTitle = report.metadata?.title || report.metadata?.urlMetadata?.title || report.metadata?.file?.originalname || report.originalInput;
      addWrappedText(reportTitle, 16, true, [20, 20, 20]);
      
      if (report.sourceUrl || (report.originalInput && reportTitle !== report.originalInput)) {
        addWrappedText(report.sourceUrl || report.originalInput, 10, false, [100, 100, 100]);
      }
      
      y += 5;
      if (report.analysis?.articleContext?.oneSentenceSummary) {
        addWrappedText(report.analysis.articleContext.oneSentenceSummary, 11, false, [60, 60, 60]);
      }
      
      y += 10;
      
      // --- SCORE & VERDICT ---
      const score = report.analysis?.credibility?.score || 0;
      const verdict = report.analysis?.overallVerdict?.label || 'UNKNOWN';
      
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      if (score >= 80) doc.setTextColor(34, 211, 238);
      else if (score >= 50) doc.setTextColor(250, 204, 21);
      else doc.setTextColor(239, 68, 68);
      
      doc.text(`${score}/100`, margin, y);
      
      doc.setFontSize(14);
      doc.text(verdict.toUpperCase(), margin + 35, y - 2);
      
      y += 15;
      
      // --- DIMENSION SCORES ---
      if (report.analysis?.dimensionScores) {
        const { evidenceQuality, sourceReliability, logicalConsistency, scientificConsensus } = report.analysis.dimensionScores;
        addSectionHeader("Dimension Breakdown");
        if (evidenceQuality?.score) addWrappedText(`Evidence Quality: ${evidenceQuality.score}/100 - ${evidenceQuality.explanation}`, 11, false);
        if (sourceReliability?.score) addWrappedText(`Source Reliability: ${sourceReliability.score}/100 - ${sourceReliability.explanation}`, 11, false);
        if (logicalConsistency?.score) addWrappedText(`Logical Consistency: ${logicalConsistency.score}/100 - ${logicalConsistency.explanation}`, 11, false);
        if (scientificConsensus?.score) addWrappedText(`Scientific Consensus: ${scientificConsensus.score}/100 - ${scientificConsensus.explanation}`, 11, false);
      }

      // --- RISK INTELLIGENCE ---
      if (report.analysis?.riskSummary?.status === "has_risks" && report.analysis?.riskIndicators?.length > 0) {
        addSectionHeader("Risk Intelligence");
        addWrappedText(`Status: ${report.analysis.riskSummary.message}`, 12, true, [239, 68, 68]);
        y += 2;
        report.analysis.riskIndicators.forEach(risk => {
          addWrappedText(`[${risk.severity}] ${risk.riskType}: ${risk.shortExplanation}`, 11, false);
          if (risk.evidenceQuote) {
            addWrappedText(`Quote: "${risk.evidenceQuote}"`, 10, false, [100, 100, 100]);
          }
          y += 2;
        });
      }

      // --- FACT CHECK & CLAIMS ---
      const claims = report.analysis?.claimInvestigations || report.analysis?.claims || report.analysis?.analyticalFindings || [];
      if (claims.length > 0) {
        addSectionHeader("Fact Check & Claims");
        claims.forEach((claim, idx) => {
          y += 3;
          addNewPageIfNeeded(25);
          const statement = claim.claimText || claim.statement || claim.text || 'Unknown Claim';
          addWrappedText(`${idx + 1}. ${statement}`, 12, true);
          
          const claimVerdict = claim.verdict || claim.verificationStatus || claim.status || claim.importance || 'Unknown';
          const isTrue = claimVerdict.toLowerCase().includes('true') || claimVerdict.toLowerCase().includes('accurate') || claimVerdict.toLowerCase().includes('corroborated') || claimVerdict.toLowerCase().includes('verified');
          const isFalse = claimVerdict.toLowerCase().includes('false') || claimVerdict.toLowerCase().includes('contradict');
          const vColor = isTrue ? [34, 211, 238] : (isFalse ? [239, 68, 68] : [250, 204, 21]);
          
          addWrappedText(`Verdict: ${claimVerdict}`, 11, true, vColor);
          
          if (claim.shortAssessment || claim.explanation) {
            addWrappedText(claim.shortAssessment || claim.explanation, 11, false);
          }
          
          const evidenceFrom = claim.evidenceFromArticle || claim.evidence || claim.supportingEvidence || [];
          if (evidenceFrom.length > 0) {
            y += 2;
            addWrappedText("Evidence:", 10, true);
            evidenceFrom.forEach(ev => {
              const evText = typeof ev === 'string' ? ev : (ev.text || ev.quote || ev.subject || '');
              if (evText) addWrappedText(`- ${evText}`, 10, false);
            });
          }
          
          const evidenceAgainst = claim.evidenceAgainstClaim || claim.contradictingEvidence || [];
          if (evidenceAgainst.length > 0) {
            y += 2;
            addWrappedText("Contradicting Evidence:", 10, true, [239, 68, 68]);
            evidenceAgainst.forEach(ev => {
              const evText = typeof ev === 'string' ? ev : (ev.text || ev.quote || ev.subject || '');
              if (evText) addWrappedText(`- ${evText}`, 10, false);
            });
          }
          y += 5;
        });
      }
      
      // --- BIAS & FRAMING ---
      const bf = report.analysis?.biasAndFraming || report.analysis?.bias;
      if (bf) {
        addSectionHeader("Bias & Framing");
        
        if (bf.biasLevel !== undefined) {
          addWrappedText(`Bias Level: ${bf.biasLevel}/100`, 11, true);
        }
        if (bf.emotionalManipulationLevel !== undefined) {
          addWrappedText(`Emotional Manipulation Level: ${bf.emotionalManipulationLevel}/100`, 11, true);
        }

        const biasIndicators = bf.biasIndicators || bf.detectedBias || bf.detectedBiases || [];
        if (biasIndicators.length > 0) {
          y += 2;
          addWrappedText("Bias Indicators:", 11, true);
          biasIndicators.forEach(b => {
            const desc = typeof b === 'string' ? b : (b.shortDescription || b.explanation || b.type || '');
            if (desc) addWrappedText(`- ${b.type ? `[${b.type}] ` : ''}${desc}`, 11, false);
          });
        }
        
        const framingIndicators = bf.framingIndicators || [];
        if (framingIndicators.length > 0) {
          y += 2;
          addWrappedText("Framing Indicators:", 11, true);
          framingIndicators.forEach(f => {
            addWrappedText(`- [${f.type}] ${f.shortDescription || f.description}`, 11, false);
          });
        }
      }
      
      // --- SOURCE CONTEXT ---
      const srcInt = report.analysis?.sourceIntelligence || report.analysis?.sourceContext;
      if (srcInt) {
        addSectionHeader("Source Intelligence");
        if (srcInt.publisher) addWrappedText(`Publisher: ${srcInt.publisher}`, 11, false);
        if (srcInt.author) addWrappedText(`Author: ${srcInt.author}`, 11, false);
        if (srcInt.sourceType) addWrappedText(`Source Type: ${srcInt.sourceType}`, 11, false);
        if (srcInt.evidenceProvenance) addWrappedText(`Evidence Provenance: ${srcInt.evidenceProvenance}`, 11, false);
      }

      // Save the PDF
      const sanitizedTitle = (reportTitle || 'Report').replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
      doc.save(`prism_report_${sanitizedTitle}.pdf`);
      
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
