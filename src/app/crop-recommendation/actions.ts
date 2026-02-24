'use server';

import { recommendCrop, type CropRecommendationInput, type CropRecommendationOutput } from "@/ai/flows/crop-recommendation-assistant";

type ActionResult = {
  data?: CropRecommendationOutput;
  error?: string;
};

export async function getRecommendation(input: CropRecommendationInput): Promise<ActionResult> {
  try {
    const result = await recommendCrop(input);
    return { data: result };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : "An unexpected error occurred. Please try again.";
    return { error: errorMessage };
  }
}
