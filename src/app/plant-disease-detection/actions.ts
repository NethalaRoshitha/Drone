'use server';

import { generatePlantDiseaseCure, type GeneratePlantDiseaseCureInput, type GeneratePlantDiseaseCureOutput } from "@/ai/flows/plant-disease-cure-generator";

type ActionResult = {
  data?: GeneratePlantDiseaseCureOutput;
  error?: string;
};

export async function getDiseaseCure(input: GeneratePlantDiseaseCureInput): Promise<ActionResult> {
  try {
    const result = await generatePlantDiseaseCure(input);
    return { data: result };
  } catch (e) {
    console.error(e);
    let errorMessage = "An unexpected error occurred. Please try again.";
    if (e instanceof Error) {
      if (e.message.includes('RESOURCE_EXHAUSTED') || e.message.includes('429')) {
        errorMessage = "You've made too many requests in a short time. Please wait a moment before trying again.";
      } else {
        errorMessage = e.message;
      }
    }
    return { error: errorMessage };
  }
}
