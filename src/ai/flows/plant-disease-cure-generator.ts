'use server';
/**
 * @fileOverview A plant disease detection and cure recommendation AI agent.
 *
 * - generatePlantDiseaseCure - A function that handles the plant disease diagnosis and cure generation process.
 * - GeneratePlantDiseaseCureInput - The input type for the generatePlantDiseaseCure function.
 * - GeneratePlantDiseaseCureOutput - The return type for the generatePlantDiseaseCure function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePlantDiseaseCureInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a diseased plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GeneratePlantDiseaseCureInput = z.infer<typeof GeneratePlantDiseaseCureInputSchema>;

const GeneratePlantDiseaseCureOutputSchema = z.object({
  disease: z.string().describe('The name of the identified plant disease.'),
  confidence: z.string().describe('The confidence level of the disease diagnosis (e.g., "92%").'),
  cureInstructions: z.string().describe('Step-by-step instructions for curing the identified disease.'),
  preventionTips: z.string().describe('Tips and best practices for preventing future occurrences of the disease.'),
});
export type GeneratePlantDiseaseCureOutput = z.infer<typeof GeneratePlantDiseaseCureOutputSchema>;

export async function generatePlantDiseaseCure(
  input: GeneratePlantDiseaseCureInput
): Promise<GeneratePlantDiseaseCureOutput> {
  return plantDiseaseCureGeneratorFlow(input);
}

const plantDiseaseCurePrompt = ai.definePrompt({
  name: 'plantDiseaseCurePrompt',
  input: {schema: GeneratePlantDiseaseCureInputSchema},
  output: {schema: GeneratePlantDiseaseCureOutputSchema},
  prompt: `You are an expert botanist and plant pathologist. Your task is to analyze the provided image of a plant,
identify any diseases present, determine a confidence level for your diagnosis, and then provide clear,
step-by-step instructions for curing the disease, as well as practical tips for preventing its recurrence.

Analyze the following image:
Photo: {{media url=photoDataUri}}

Provide the disease name, confidence level, detailed cure instructions, and prevention tips in the specified JSON format.`,
});

const plantDiseaseCureGeneratorFlow = ai.defineFlow(
  {
    name: 'plantDiseaseCureGeneratorFlow',
    inputSchema: GeneratePlantDiseaseCureInputSchema,
    outputSchema: GeneratePlantDiseaseCureOutputSchema,
  },
  async input => {
    const {output} = await plantDiseaseCurePrompt(input);
    return output!;
  }
);
