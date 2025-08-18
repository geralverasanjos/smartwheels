'use server';

/**
 * @fileOverview Empathetic support chatbot flow.
 *
 * - empatheticSupport - A function that handles the empathetic support process.
 * - EmpatheticSupportInput - The input type for the empatheticSupport function.
 * - EmpatheticSupportOutput - The return type for the empatheticSupport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmpatheticSupportInputSchema = z.object({
  language: z
    .string()
    .describe("The user's preferred language for support."),
  query: z.string().describe('The user query to the support chatbot.'),
});
export type EmpatheticSupportInput = z.infer<typeof EmpatheticSupportInputSchema>;

const EmpatheticSupportOutputSchema = z.object({
  response: z.string().describe('The response from the support chatbot.'),
});
export type EmpatheticSupportOutput = z.infer<typeof EmpatheticSupportOutputSchema>;

export async function empatheticSupport(
  input: EmpatheticSupportInput
): Promise<EmpatheticSupportOutput> {
  return empatheticSupportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'empatheticSupportPrompt',
  input: {schema: EmpatheticSupportInputSchema},
  output: {schema: EmpatheticSupportOutputSchema},
  prompt: `You are a support chatbot for SmartWheels, a global transportation platform. You will respond to user queries in their selected language, which is {{{language}}}. You will analyze the user query to determine the user's emotional state and make your responses more empathetic and comforting.

User Query: {{{query}}}`,
});

const empatheticSupportFlow = ai.defineFlow(
  {
    name: 'empatheticSupportFlow',
    inputSchema: EmpatheticSupportInputSchema,
    outputSchema: EmpatheticSupportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
