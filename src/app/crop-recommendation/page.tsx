'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { CropRecommendationInput, CropRecommendationOutput } from '@/ai/flows/crop-recommendation-assistant';
import { getRecommendation } from './actions';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Sprout, TestTube2, Zap } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { placeholderImages } from '@/lib/placeholder-images';
import { Separator } from '@/components/ui/separator';

export default function CropRecommendationPage() {
  const [result, setResult] = useState<CropRecommendationOutput | null>(null);
  const [lastInputs, setLastInputs] = useState<CropRecommendationInput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const seedPlaceholder = placeholderImages.find(p => p.id === 'crop-seed-placeholder')?.imageUrl || 'https://picsum.photos/seed/seed/200/200';
  const productPlaceholder = placeholderImages.find(p => p.id === 'crop-product-placeholder')?.imageUrl || 'https://picsum.photos/seed/product/200/200';

  const generateSimulatedData = (): CropRecommendationInput => {
    return {
        nitrogen: parseFloat((Math.random() * 140).toFixed(2)),
        phosphorus: parseFloat((Math.random() * 140 + 5).toFixed(2)),
        potassium: parseFloat((Math.random() * 200 + 5).toFixed(2)),
        temperature: parseFloat((Math.random() * 30 + 10).toFixed(2)),
        humidity: parseFloat((Math.random() * 70 + 30).toFixed(2)),
        ph: parseFloat((Math.random() * 3 + 5.5).toFixed(2)),
        rainfall: parseFloat((Math.random() * 200 + 30).toFixed(2)),
    };
  };

  async function handleGetRecommendation() {
    setLoading(true);
    setResult(null);
    
    const simulatedValues = generateSimulatedData();
    setLastInputs(simulatedValues);

    const response = await getRecommendation(simulatedValues);
    setLoading(false);
    
    if (response.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: response.error,
      });
    } else if (response.data) {
      setResult(response.data);
      if (user && firestore) {
        const historyData = {
          inputs: simulatedValues,
          output: response.data,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };
        const recommendationsCollection = collection(firestore, 'users', user.uid, 'cropRecommendations');
        addDocumentNonBlocking(recommendationsCollection, historyData);
      }
    }
  }

  const isValidUrl = (url: string | undefined | null): url is string => {
    return !!(url && (url.startsWith('http://') || url.startsWith('https://')));
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Crop Recommendation" />
      <div className="flex-1 p-4 md:p-8 grid gap-8 md:grid-cols-1 items-start justify-items-center">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle>Get Your Recommendation</CardTitle>
            <CardDescription>Click the button below. Our AI will analyze simulated environmental conditions to recommend the perfect crop for a sample scenario.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGetRecommendation} disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
              Get Crop Recommendation
            </Button>
          </CardContent>

          <Separator className="my-4" />

          <CardHeader>
            <CardTitle>AI Recommendation</CardTitle>
            <CardDescription>Our AI-powered analysis will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <RecommendationSkeleton />}
            {result && !loading && (
              <div className="space-y-6">
                <div>
                  <h3 className="flex items-center text-lg font-semibold text-primary mb-2">
                    <Sprout className="h-5 w-5 mr-2" />
                    Recommended Crop
                  </h3>
                  <p className="text-2xl font-bold bg-primary/10 text-primary p-3 rounded-md text-center">{result.recommended_crop}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold mb-2 text-center">Seed</h4>
                        <Image src={isValidUrl(result.seedImageUrl) ? result.seedImageUrl : seedPlaceholder} alt={`${result.recommended_crop} seed`} width={250} height={250} className="rounded-lg object-cover w-full aspect-square border" data-ai-hint="seed" />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 text-center">Product</h4>
                         <Image src={isValidUrl(result.productImageUrl) ? result.productImageUrl : productPlaceholder} alt={`${result.recommended_crop} product`} width={250} height={250} className="rounded-lg object-cover w-full aspect-square border" data-ai-hint="vegetable harvest" />
                    </div>
                </div>

                {lastInputs && (
                    <div>
                        <h3 className="flex items-center text-lg font-semibold text-primary mb-2">
                            <Zap className="h-5 w-5 mr-2" />
                            Based on Conditions
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm bg-gray-100 p-3 rounded-md dark:bg-gray-800">
                            <p><strong>N:</strong> {lastInputs.nitrogen}</p>
                            <p><strong>P:</strong> {lastInputs.phosphorus}</p>
                            <p><strong>K:</strong> {lastInputs.potassium}</p>
                            <p><strong>Temp:</strong> {lastInputs.temperature}°C</p>
                            <p><strong>Humidity:</strong> {lastInputs.humidity}%</p>
                            <p><strong>pH:</strong> {lastInputs.ph}</p>
                            <p><strong>Rainfall:</strong> {lastInputs.rainfall}mm</p>
                        </div>
                    </div>
                )}

                <div>
                  <h3 className="flex items-center text-lg font-semibold text-primary mb-2">
                    <TestTube2 className="h-5 w-5 mr-2" />
                    Suggested Fertilizer
                  </h3>
                  <p className="text-lg bg-gray-100 p-3 rounded-md dark:bg-gray-800">{result.fertilizer}</p>
                </div>
                <div>
                  <h3 className="flex items-center text-lg font-semibold text-primary mb-2">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Cultivation Tips
                  </h3>
                  <p className="text-base bg-gray-100 p-3 rounded-md whitespace-pre-wrap dark:bg-gray-800">{result.tips}</p>
                </div>
              </div>
            )}
            {!result && !loading && (
              <div className="text-center text-muted-foreground py-12">
                <Sparkles className="h-12 w-12 mx-auto mb-4" />
                <p>Your crop recommendation will be shown here once you request it.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RecommendationSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
