'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import type { CropRecommendationOutput } from '@/ai/flows/crop-recommendation-assistant';
import { getRecommendation } from './actions';
import { useFirestore, useUser, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Sprout, TestTube2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const formSchema = z.object({
  nitrogen: z.number().min(0).max(140),
  phosphorus: z.number().min(5).max(145),
  potassium: z.number().min(5).max(205),
  temperature: z.number().min(0).max(50),
  humidity: z.number().min(0).max(100),
  ph: z.number().min(0).max(14),
  rainfall: z.number().min(20).max(300),
});

type FormData = z.infer<typeof formSchema>;

export default function CropRecommendationPage() {
  const [result, setResult] = useState<CropRecommendationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nitrogen: 70,
      phosphorus: 75,
      potassium: 105,
      temperature: 25,
      humidity: 50,
      ph: 7,
      rainfall: 160,
    },
  });

  async function onSubmit(values: FormData) {
    setLoading(true);
    setResult(null);

    const response = await getRecommendation(values);
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
          inputs: values,
          output: response.data,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };
        const recommendationsCollection = collection(firestore, 'users', user.uid, 'cropRecommendations');
        addDocumentNonBlocking(recommendationsCollection, historyData);
      }
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Crop Recommendation" />
      <div className="flex-1 p-4 md:p-8 grid gap-8 md:grid-cols-2 items-start">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Enter Soil & Weather Conditions</CardTitle>
            <CardDescription>Adjust the sliders to match your farm's conditions and get an AI-powered crop recommendation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <SliderField name="nitrogen" label="Nitrogen (N)" min={0} max={140} step={1} unit="kg/ha" form={form} />
                <SliderField name="phosphorus" label="Phosphorus (P)" min={5} max={145} step={1} unit="kg/ha" form={form} />
                <SliderField name="potassium" label="Potassium (K)" min={5} max={205} step={1} unit="kg/ha" form={form} />
                <SliderField name="temperature" label="Temperature" min={0} max={50} step={0.1} unit="°C" form={form} />
                <SliderField name="humidity" label="Humidity" min={0} max={100} step={1} unit="%" form={form} />
                <SliderField name="ph" label="Soil pH" min={0} max={14} step={0.1} unit="" form={form} />
                <SliderField name="rainfall" label="Rainfall" min={20} max={300} step={1} unit="mm" form={form} />

                <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                  {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                  Get Crop Recommendation
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card className="sticky top-8">
            <CardHeader>
                <CardTitle>AI Recommendation</CardTitle>
                <CardDescription>Our AI-powered analysis will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading && <RecommendationSkeleton />}
                {result && !loading && (
                  <Accordion type="single" collapsible className="w-full">
                    {result.recommendations.map((rec, index) => (
                      <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-xl font-bold text-primary">
                          <div className="flex items-center">
                            <Sprout className="h-6 w-6 mr-3" />
                            {rec.crop_name}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pl-2">
                            <div>
                              <h4 className="flex items-center text-lg font-semibold mb-2">
                                <TestTube2 className="h-5 w-5 mr-2" />
                                Suggested Fertilizer
                              </h4>
                              <p className="text-base bg-gray-100 p-3 rounded-md dark:bg-gray-800">{rec.fertilizer}</p>
                            </div>
                            <div>
                              <h4 className="flex items-center text-lg font-semibold mb-2">
                                <Sparkles className="h-5 w-5 mr-2" />
                                Cultivation Tips
                              </h4>
                              <div className="text-base bg-gray-100 p-3 rounded-md whitespace-pre-wrap dark:bg-gray-800">
                                {rec.tips.split('*').filter(tip => tip.trim()).map((tip, tipIndex) => (
                                  <p key={tipIndex} className="flex items-start">
                                    <span className="mr-2">&#8226;</span>
                                    <span>{tip.trim()}</span>
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
                {!result && !loading && (
                <div className="text-center text-muted-foreground py-12">
                    <Sparkles className="h-12 w-12 mx-auto mb-4" />
                    <p>Your crop recommendation will be shown here once you submit the conditions.</p>
                </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component for sliders to avoid repetition
function SliderField({ name, label, min, max, step, unit, form }: { name: keyof FormData, label: string, min: number, max: number, step: number, unit: string, form: any }) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <FormLabel>{label}</FormLabel>
            <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-md w-24 text-center">
              {field.value.toFixed(step === 1 ? 0 : 1)} {unit}
            </span>
          </div>
          <FormControl>
            <Slider
              min={min}
              max={max}
              step={step}
              value={[field.value]}
              onValueChange={(vals) => field.onChange(vals[0])}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function RecommendationSkeleton() {
  return (
    <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
    </div>
  );
}
