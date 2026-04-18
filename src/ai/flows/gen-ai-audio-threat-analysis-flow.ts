'use server';
/**
 * @fileOverview AI flow for transcribing audio and analyzing threats using suspicious word heuristics.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SUSPICIOUS_WORDS = [
  "urgent", "verify", "account", "password", "otp", "credit card",
  "bank", "transfer", "click the link", "prize", "lottery",
  "free", "confirm", "login", "reward", "pay now"
];

const AnalyzeAudioThreatInputSchema = z.object({
  audioDataUri: z.string().describe("A data URI of the audio file to transcribe and analyze. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeAudioThreatInput = z.infer<typeof AnalyzeAudioThreatInputSchema>;

const AnalyzeAudioThreatOutputSchema = z.object({
  transcribedText: z.string(),
  riskScore: z.number().min(0).max(100),
  riskLevel: z.enum(['Safe', 'Medium', 'High']),
  detectedKeywords: z.array(z.string()),
  threatSummary: z.string(),
  mitigations: z.array(z.string()),
});
export type AnalyzeAudioThreatOutput = z.infer<typeof AnalyzeAudioThreatOutputSchema>;

const transcriptionPrompt = ai.definePrompt({
  name: 'transcriptionPrompt',
  input: { schema: AnalyzeAudioThreatInputSchema },
  output: { schema: z.object({ transcript: z.string() }) },
  prompt: `Transcribe the speech in this audio file accurately.
  Audio: {{media url=audioDataUri}}`,
});

const audioRiskExplanationPrompt = ai.definePrompt({
  name: 'audioRiskExplanationPrompt',
  input: { 
    schema: z.object({
      transcript: z.string(),
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
  prompt: `You are an expert cybersecurity analyst. A heuristic scanner flagged this audio transcript with a Risk Score of {{score}}% because it detected these suspicious words: {{#each detected}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.

Transcript: """{{{transcript}}}"""

Provide a professional explanation of the risk (e.g., social engineering, vishing, or financial fraud) and specific mitigation steps.`,
});

export async function analyzeAudioThreat(input: AnalyzeAudioThreatInput): Promise<AnalyzeAudioThreatOutput> {
  // 1. Transcribe the audio
  const { output: transOutput } = await transcriptionPrompt(input);
  const transcript = transOutput?.transcript || "";

  // 2. Apply your Python-style heuristic logic
  const textLower = transcript.toLowerCase();
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

  // 3. Generate the AI explanation based on the heuristic result
  const { output: explanationOutput } = await audioRiskExplanationPrompt({
    transcript,
    score,
    detected
  });

  return {
    transcribedText: transcript,
    riskScore: score,
    riskLevel: level,
    detectedKeywords: detected.length > 0 ? detected : ["None"],
    threatSummary: explanationOutput?.explanation || "No immediate verbal threats identified.",
    mitigations: explanationOutput?.mitigations || ["Do not share personal info over calls", "Verify caller identity"],
  };
}
