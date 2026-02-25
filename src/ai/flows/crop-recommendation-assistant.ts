'use server';
/**
 * @fileOverview A crop recommendation AI assistant.
 *
 * - recommendCrop - A function that handles the crop recommendation process.
 * - CropRecommendationInput - The input type for the recommendCrop function.
 * - CropRecommendationOutput - The return type for the recommendCrop function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropRecommendationInputSchema = z.object({
  nitrogen: z.number().describe('The level of Nitrogen (N) in the soil.'),
  phosphorus: z.number().describe('The level of Phosphorus (P) in the soil.'),
  potassium: z.number().describe('The level of Potassium (K) in the soil.'),
  temperature: z.number().describe('The ambient temperature in Celsius.'),
  humidity: z.number().describe('The relative humidity as a percentage.'),
  ph: z.number().describe('The pH level of the soil.'),
  rainfall: z.number().describe('The amount of rainfall in millimeters.'),
});
export type CropRecommendationInput = z.infer<typeof CropRecommendationInputSchema>;

const CropRecommendationOutputSchema = z.object({
  recommended_crop: z.string().describe('The most suitable crop for the given conditions.'),
  fertilizer: z.string().describe('The appropriate fertilizer to use for the recommended crop.'),
  tips: z.string().describe('Actionable cultivation tips for the recommended crop, with each tip starting with a bullet point and on a new line.'),
});
export type CropRecommendationOutput = z.infer<typeof CropRecommendationOutputSchema>;

export async function recommendCrop(
  input: CropRecommendationInput
): Promise<CropRecommendationOutput> {
  return cropRecommendationFlow(input);
}

const cropRecommendationPrompt = ai.definePrompt({
  name: 'cropRecommendationPrompt',
  input: {schema: CropRecommendationInputSchema},
  output: {schema: CropRecommendationOutputSchema},
  prompt: `You are an expert agricultural assistant specializing in crop recommendation and cultivation. Your task is to analyze the provided environmental parameters and recommend the most suitable crop, suggest an appropriate fertilizer, and offer actionable cultivation tips tailored to these specific conditions. Each tip in the 'tips' field should start with a bullet point (e.g., '*') and be on a new line.

Environmental Parameters:
- Nitrogen (N): {{{nitrogen}}}
- Phosphorus (P): {{{phosphorus}}}
- Potassium (K): {{{potassium}}}
- Temperature: {{{temperature}}} °C
- Humidity: {{{humidity}}}%
- pH: {{{ph}}}
- Rainfall: {{{rainfall}}} mm

Based on these parameters, provide a recommendation in the exact JSON format specified by the output schema, ensuring all fields are accurately filled.`,
});

const cropRecommendationFlow = ai.defineFlow(
  {
    name: 'cropRecommendationFlow',
    inputSchema: CropRecommendationInputSchema,
    outputSchema: CropRecommendationOutputSchema,
  },
  async input => {
    const {output} = await cropRecommendationPrompt(input);
    return output!;
  }
);
