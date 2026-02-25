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
