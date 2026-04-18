'use server';
/**
 * @fileOverview AI flow for analyzing QR code content with heuristic scoring.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SUSPICIOUS_WORDS = [
  "urgent", "verify", "account", "password", "otp", "credit card",
  "bank", "transfer", "click the link", "prize", "lottery",
  "free", "confirm", "login", "reward", "pay now"
];

const AnalyzeQrThreatInputSchema = z.object({
  qrImageDataUri: z.string().describe("A data URI of the QR code image."),
});
export type AnalyzeQrThreatInput = z.infer<typeof AnalyzeQrThreatInputSchema>;

const AnalyzeQrThreatOutputSchema = z.object({
  extractedContent: z.string(),
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(['Safe', 'Medium', 'High']),
  threats: z.array(z.string()),
  explanation: z.string(),
  mitigations: z.array(z.string()),
});
export type AnalyzeQrThreatOutput = z.infer<typeof AnalyzeQrThreatOutputSchema>;

const qrThreatPrompt = ai.definePrompt({
  name: 'qrThreatPrompt',
  input: { schema: AnalyzeQrThreatInputSchema },
  output: { 
    schema: z.object({
      content: z.string(),
      explanation: z.string(),
      mitigations: z.array(z.string())
    })
  },
  prompt: `Extract the content from this QR code and analyze its safety. 
QR Code Image: {{media url=qrImageDataUri}}

Provide the extracted content, a security explanation, and mitigation steps.`,
});

export async function analyzeQrThreat(input: AnalyzeQrThreatInput): Promise<AnalyzeQrThreatOutput> {
  const { output } = await qrThreatPrompt(input);
  
  if (!output) throw new Error("Failed to scan QR code");

  const contentLower = output.content.toLowerCase();
  const detected = SUSPICIOUS_WORDS.filter(w => contentLower.includes(w));
  
  // Use heuristic score but default to high risk as per requirements if anything suspicious is found
  let score = 0;
  if (detected.length > 0) {
    score = 50 + (detected.length * 10);
    if (detected.length >= 2) score = Math.max(score, 90);
    score = Math.min(score, 100);
  } else {
    // QR codes are inherently risky in this app's context
    score = 45; 
  }

  // Force high risk for safety as requested in Streamlit logic mock
  // score = 93.3; // Uncomment if strictly mimicking the Streamlit "mock" behavior

  let level: 'Safe' | 'Medium' | 'High' = 'Safe';
  if (score > 70) level = 'High';
  else if (score > 40) level = 'Medium';

  return {
    extractedContent: output.content,
    riskScore: score,
    riskLevel: level,
    threats: detected.length > 0 ? detected : ["QR Obfuscation"],
    explanation: output.explanation,
    mitigations: output.mitigations
  };
}
