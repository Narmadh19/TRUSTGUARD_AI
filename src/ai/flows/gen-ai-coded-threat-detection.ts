'use server';
/**
 * @fileOverview A Genkit flow for text risk analysis using specific heuristics and AI explanation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SUSPICIOUS_WORDS = [
  "urgent", "verify", "account", "password", "otp", "credit card",
  "bank", "transfer", "click the link", "prize", "lottery",
  "free", "confirm", "login", "reward", "pay now"
];

const AnalyzeTextRiskInputSchema = z.object({
  text: z.string().describe('The text content to analyze for security risks.'),
});
export type AnalyzeTextRiskInput = z.infer<typeof AnalyzeTextRiskInputSchema>;

const AnalyzeTextRiskOutputSchema = z.object({
  riskScore: z.number().int().min(0).max(100),
  riskLevel: z.enum(['Safe', 'Medium', 'High']),
  detectedThreats: z.array(z.string()),
  aiExplanation: z.string(),
});
export type AnalyzeTextRiskOutput = z.infer<typeof AnalyzeTextRiskOutputSchema>;

const analyzeTextRiskPrompt = ai.definePrompt({
  name: 'analyzeTextRiskPrompt',
  input: {
    schema: z.object({
      text: z.string(),
      score: z.number(),
      detected: z.array(z.string())
    })
  },
  output: {schema: z.object({ explanation: z.string() })},
  prompt: `You are an expert cybersecurity analyst. A heuristic scanner flagged this text with a Risk Score of {{score}}% because it detected these suspicious patterns: {{#each detected}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

Text to analyze: """{{{text}}}"""

Provide a professional, concise explanation of the risk and why these specific words are dangerous in this context.`,
});

export async function analyzeTextRisk(input: AnalyzeTextRiskInput): Promise<AnalyzeTextRiskOutput> {
  const textLower = input.text.toLowerCase();
  const detected = SUSPICIOUS_WORDS.filter(w => textLower.includes(w));
  
  let score = 0;
  if (detected.length > 0) {
    score = 50 + (detected.length * 10);
    if (detected.length >= 2) score = Math.max(score, 90);
    score = Math.min(score, 100);
  }

  let level: 'Safe' | 'Medium' | 'High' = 'Safe';
  if (score > 70) level = 'High';
  else if (score > 40) level = 'Medium';

  const {output} = await analyzeTextRiskPrompt({
    text: input.text,
    score: score,
    detected: detected
  });

  return {
    riskScore: score,
    riskLevel: level,
    detectedThreats: detected.length > 0 ? detected : ["None"],
    aiExplanation: output?.explanation || (detected.length > 0 ? "Suspicious patterns detected." : "No immediate threats found.")
  };
}
