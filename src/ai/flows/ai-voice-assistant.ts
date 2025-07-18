'use server';

/**
 * @fileOverview Implements the AI Voice Assistant flow for providing financial insights, tips, and alerts.
 *
 * - aiVoiceAssistant - A function that generates AI-powered voice messages.
 * - AiVoiceAssistantInput - The input type for the aiVoiceassistant function.
 * - AiVoiceAssistantOutput - The return type for the aiVoiceassistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const AiVoiceAssistantInputSchema = z.object({
  query: z.string().describe('The financial query or context for the AI voice assistant.'),
  financialData: z.string().optional().describe('Optional financial data for the assistant to analyze.'),
});
export type AiVoiceAssistantInput = z.infer<typeof AiVoiceAssistantInputSchema>;

const AiVoiceAssistantOutputSchema = z.object({
  media: z.string().describe('The audio data URI in WAV format.'),
});
export type AiVoiceAssistantOutput = z.infer<typeof AiVoiceAssistantOutputSchema>;

export async function aiVoiceAssistant(input: AiVoiceAssistantInput): Promise<AiVoiceAssistantOutput> {
  return aiVoiceAssistantFlow(input);
}

const prompt = ai.definePrompt({
    name: 'aiVoiceAssistantPrompt',
    input: { schema: AiVoiceAssistantInputSchema },
    prompt: `You are a helpful AI financial assistant. 
    Your responses should be concise and conversational.
    
    {{#if financialData}}
    A user has provided their financial data and is asking for a summary.
    Analyze the following data and provide a brief, friendly audio summary of their financial health.
    Start with a greeting, like "Hello," or "Here is your financial summary".
    
    Financial Data:
    {{{financialData}}}
    
    Keep your summary to 2-3 short sentences.
    {{else}}
    Respond to the following user query: {{{query}}}
    {{/if}}
    `,
});


const aiVoiceAssistantFlow = ai.defineFlow(
  {
    name: 'aiVoiceAssistantFlow',
    inputSchema: AiVoiceAssistantInputSchema,
    outputSchema: AiVoiceAssistantOutputSchema,
  },
  async (input) => {
    
    const llmResponse = await prompt(input);
    const textResponse = llmResponse.output as string;
    
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: textResponse,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
