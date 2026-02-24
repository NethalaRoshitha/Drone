'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CropRecommendationOutput } from '@/ai/flows/crop-recommendation-assistant';
import { getRecommendation } from './actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Sprout, TestTube2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  nitrogen: z.coerce.number().min(0, "Must be non-negative").max(200, "Value seems high"),
  phosphorus: z.coerce.number().min(0, "Must be non-negative").max(200, "Value seems high"),
  potassium: z.coerce.number().min(0, "Must be non-negative").max(200, "Value seems high"),
  temperature: z.coerce.number().min(-50, "Temperature too low").max(60, "Temperature too high"),
  humidity: z.coerce.number().min(0, "Must be non-negative").max(100, "Must be a percentage"),
  ph: z.coerce.number().min(0, "pH must be between 0 and 14").max(14, "pH must be between 0 and 14"),
  rainfall: z.coerce.number().min(0, "Must be non-negative"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CropRecommendationPage() {
  const [result, setResult] = useState<CropRecommendationOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nitrogen: 50,
      phosphorus: 50,
      potassium: 50,
      temperature: 25,
      humidity: 80,
      ph: 6.5,
      rainfall: 200,
    },
  });

  async function onSubmit(values: FormValues) {
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
    } else {
      setResult(response.data);
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Crop Recommendation" />
      <div className="flex-1 p-4 md:p-8 grid gap-8 md:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Environmental Data</CardTitle>
            <CardDescription>Enter the values for your soil and climate conditions to get a crop recommendation.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField control={form.control} name="nitrogen" render={({ field }) => (
                  <FormItem><FormLabel>Nitrogen (N) in soil</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phosphorus" render={({ field }) => (
                  <FormItem><FormLabel>Phosphorus (P) in soil</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="potassium" render={({ field }) => (
                  <FormItem><FormLabel>Potassium (K) in soil</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="temperature" render={({ field }) => (
                  <FormItem><FormLabel>Temperature (°C)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="humidity" render={({ field }) => (
                  <FormItem><FormLabel>Humidity (%)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="ph" render={({ field }) => (
                  <FormItem><FormLabel>Soil pH</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="rainfall" render={({ field }) => (
                  <FormItem><FormLabel>Rainfall (mm)</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={loading} className="w-full sm:col-span-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Recommend Crop
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
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
                <div>
                  <h3 className="flex items-center text-lg font-semibold text-primary mb-2">
                    <TestTube2 className="h-5 w-5 mr-2" />
                    Suggested Fertilizer
                  </h3>
                  <p className="text-lg bg-gray-100 p-3 rounded-md">{result.fertilizer}</p>
                </div>
                <div>
                  <h3 className="flex items-center text-lg font-semibold text-primary mb-2">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Cultivation Tips
                  </h3>
                  <p className="text-base bg-gray-100 p-3 rounded-md whitespace-pre-wrap">{result.tips}</p>
                </div>
              </div>
            )}
            {!result && !loading && (
              <div className="text-center text-muted-foreground py-12">
                <Sparkles className="h-12 w-12 mx-auto mb-4" />
                <p>Your crop recommendation will be shown here once you submit the form.</p>
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
