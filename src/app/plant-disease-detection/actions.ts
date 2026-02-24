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
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred. Please try again.";
    return { error: errorMessage };
  }
}
