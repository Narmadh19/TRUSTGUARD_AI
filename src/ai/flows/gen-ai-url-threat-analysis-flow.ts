'use server';
/**
 * @fileOverview AI flow for URL safety analysis using suspicious word heuristics.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SUSPICIOUS_WORDS = [
  "urgent", "verify", "account", "password", "otp", "credit card",
  "bank", "transfer", "click the link", "prize", "lottery",
  "free", "confirm", "login", "reward", "pay now"
];

const AnalyzeUrlThreatInputSchema = z.object({
  url: z.string().url().describe('The URL to analyze for security risks.'),
});
export type AnalyzeUrlThreatInput = z.infer<typeof AnalyzeUrlThreatInputSchema>;

const AnalyzeUrlThreatOutputSchema = z.object({
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(['Safe', 'Medium', 'High']),
  threats: z.array(z.string()),
  explanation: z.string(),
  mitigations: z.array(z.string()),
});
export type AnalyzeUrlThreatOutput = z.infer<typeof AnalyzeUrlThreatOutputSchema>;

const urlThreatPrompt = ai.definePrompt({
  name: 'urlThreatPrompt',
  input: { 
    schema: z.object({
      url: z.string(),
      score: z.number(),
      detected: z.array(z.string())
    }) 
  },
  output: { 
    schema: z.object({ 
      explanation: z.string(),
      mitigations: z.array(z.string())
    }) 
  },
  prompt: `Analyze this URL for security risks. 
Heuristic scan score: {{score}}%. 
Detected suspicious keywords in URL string: {{#each detected}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

URL: {{{url}}}

Provide a detailed security analysis and specific mitigation steps.`,
});

export async function analyzeUrlThreat(input: AnalyzeUrlThreatInput): Promise<AnalyzeUrlThreatOutput> {
  const urlLower = input.url.toLowerCase();
  const detected = SUSPICIOUS_WORDS.filter(w => urlLower.includes(w));
  
  let score = 0;
  if (detected.length > 0) {
    score = 50 + (detected.length * 10);
    if (detected.length >= 2) score = Math.max(score, 90);
    score = Math.min(score, 100);
  } else {
    // Basic URL safety check score if no keywords
    score = input.url.includes('https') ? 15 : 35;
  }

  let level: 'Safe' | 'Medium' | 'High' = 'Safe';
  if (score > 70) level = 'High';
  else if (score > 40) level = 'Medium';

  const { output } = await urlThreatPrompt({
    url: input.url,
    score,
    detected
  });

  return {
    riskScore: score,
    riskLevel: level,
    threats: detected.length > 0 ? detected : ["General URL risk"],
    explanation: output?.explanation || "Analysis complete.",
    mitigations: output?.mitigations || ["Verify link before clicking"]
  };
}
