import { config } from 'dotenv';
config();

import '@/ai/flows/gen-ai-risk-explanation-and-mitigation-flow.ts';
import '@/ai/flows/gen-ai-coded-threat-detection.ts';
import '@/ai/flows/gen-ai-audio-threat-analysis-flow.ts';
import '@/ai/flows/gen-ai-qr-threat-analysis-flow.ts';
import '@/ai/flows/gen-ai-url-threat-analysis-flow.ts';
