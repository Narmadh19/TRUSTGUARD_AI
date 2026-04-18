'use server';
/**
 * @fileOverview This file implements a Genkit flow to provide AI-generated explanations,
 * threat vectors, and mitigation steps for flagged risky content.
 *
 * - genAIRiskExplanationAndMitigation - A function that handles the AI risk explanation process.
 * - GenAIRiskExplanationAndMitigationInput - The input type for the genAIRiskExplanationAndMitigation function.
 * - GenAIRiskExplanationAndMitigationOutput - The return type for the genAIRiskExplanationAndMitigation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenAIRiskExplanationAndMitigationInputSchema = z.object({
  flaggedText: z
    .string()
    .describe(
      'The input text (e.g., text, URL content, transcribed audio) that was flagged as risky.'
    ),
  riskScore: z
    .number()
    .min(0)
    .max(100)
    .describe('The calculated risk score for the flagged text (0-100).'),
  detectedWords: z
    .array(z.string())
    .describe('A list of suspicious words or phrases detected in the text.'),
});
export type GenAIRiskExplanationAndMitigationInput = z.infer<
  typeof GenAIRiskExplanationAndMitigationInputSchema
>;

const GenAIRiskExplanationAndMitigationOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A concise explanation of why the input was flagged as risky, referencing the risk score and detected elements.'
    ),
  threatVectors: z
    .array(z.string())
    .describe(
      'A list of specific threat vectors or categories identified (e.g., Phishing, Malware, Social Engineering, Financial Fraud).'
    ),
  mitigationSteps: z
    .array(z.string())
    .describe('A list of concrete, immediate steps to mitigate the identified risks.'),
});
export type GenAIRiskExplanationAndMitigationOutput = z.infer<
  typeof GenAIRiskExplanationAndMitigationOutputSchema
>;

export async function genAIRiskExplanationAndMitigation(
  input: GenAIRiskExplanationAndMitigationInput
): Promise<GenAIRiskExplanationAndMitigationOutput> {
  return genAIRiskExplanationAndMitigationFlow(input);
}

const riskExplanationPrompt = ai.definePrompt({
  name: 'riskExplanationPrompt',
  input: {schema: GenAIRiskExplanationAndMitigationInputSchema},
  output: {schema: GenAIRiskExplanationAndMitigationOutputSchema},
  prompt: `You are an expert cybersecurity analyst tasked with explaining potential risks in user-provided content.

Given the following flagged text, its risk score, and detected suspicious words, provide a clear explanation of the risk, identify specific threat vectors, and suggest immediate mitigation steps.

Flagged Text: """{{{flaggedText}}}"""
Risk Score: {{{riskScore}}}
Detected Suspicious Words: {{{detectedWords}}}

Consider the risk score:
- If score is 0-40: The content appears safe, but explain any potential minor concerns or best practices if any words were detected.
- If score is 41-70: The content has medium risk. Explain the potential dangers clearly.
- If score is 71-100: The content has high risk. Provide urgent warnings and strong mitigation advice.

Provide the output in the specified JSON format with:
1.  An 'explanation' describing why it was flagged, referencing the risk score and detected words.
2.  'threatVectors' as a list of specific threat types (e.g., Phishing, Malware, Data Theft, Social Engineering).
3.  'mitigationSteps' as a list of concrete, actionable steps the user should take immediately.

Example Output Format:
{
  "explanation": "This text is highly suspicious due to the presence of urgent requests and financial keywords, indicating a potential phishing attempt.",
  "threatVectors": [
    "Phishing",
    "Identity Theft"
  ],
  "mitigationSteps": [
    "Do not click any links or download attachments.",
    "Do not reply to the sender.",
    "Report the message to your IT security department.",
    "Verify the sender's identity through an alternative, trusted channel."
  ]
}`,
});

const genAIRiskExplanationAndMitigationFlow = ai.defineFlow(
  {
    name: 'genAIRiskExplanationAndMitigationFlow',
    inputSchema: GenAIRiskExplanationAndMitigationInputSchema,
    outputSchema: GenAIRiskExplanationAndMitigationOutputSchema,
  },
  async input => {
    const {output} = await riskExplanationPrompt(input);
    if (!output) {
      throw new Error('Failed to generate risk explanation.');
    }
    return output;
  }
);
