'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import Image from 'next/image';
import type { GeneratePlantDiseaseCureOutput } from '@/ai/flows/plant-disease-cure-generator';
import { getDiseaseCure } from './actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, UploadCloud, HeartPulse, ShieldCheck, Microscope } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { placeholderImages } from '@/lib/placeholder-images';

export default function PlantDiseasePage() {
  const [result, setResult] = useState<GeneratePlantDiseaseCureOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(placeholderImages[0].imageUrl);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
    }
  };
  
  const handleAnalyzeClick = async () => {
    if (!imageFile) {
        toast({
            variant: 'destructive',
            title: 'No image selected',
            description: 'Please upload an image of a plant to analyze.',
        });
        return;
    }

    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onloadend = async () => {
      const base64data = reader.result as string;
      const response = await getDiseaseCure({ photoDataUri: base64data });
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
    };
    reader.onerror = () => {
        setLoading(false);
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'Could not read the selected file.',
        });
    }
  };


  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="Plant Disease Detection" />
      <div className="flex-1 p-4 md:p-8 grid gap-8 md:grid-cols-2 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Upload Plant Image</CardTitle>
            <CardDescription>Upload an image of a plant leaf to detect potential diseases.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="font-semibold text-primary">Click to upload or drag & drop</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, or WEBP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {imagePreview && (
              <div className="mt-4 rounded-lg overflow-hidden border">
                <Image
                  src={imagePreview}
                  alt="Plant preview"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  data-ai-hint={imageFile ? undefined : placeholderImages[0].imageHint}
                />
              </div>
            )}
            <Button onClick={handleAnalyzeClick} disabled={loading || !imageFile} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Analyze Plant
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Diagnosis</CardTitle>
            <CardDescription>Our AI-powered diagnosis will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && <DiagnosisSkeleton />}
            {result && !loading && (
              <div className="space-y-6">
                 <div>
                  <h3 className="flex items-center text-lg font-semibold text-primary mb-2">
                    <Microscope className="h-5 w-5 mr-2" />
                    Identified Disease
                  </h3>
                  <p className="text-2xl font-bold bg-primary/10 text-primary p-3 rounded-md text-center">{result.disease} ({result.confidence})</p>
                </div>
                <div>
                  <h3 className="flex items-center text-lg font-semibold text-primary mb-2">
                    <HeartPulse className="h-5 w-5 mr-2" />
                    Cure Instructions
                  </h3>
                  <p className="text-base bg-gray-100 p-3 rounded-md whitespace-pre-wrap">{result.cureInstructions}</p>
                </div>
                <div>
                  <h3 className="flex items-center text-lg font-semibold text-primary mb-2">
                    <ShieldCheck className="h-5 w-5 mr-2" />
                    Prevention Tips
                  </h3>
                  <p className="text-base bg-gray-100 p-3 rounded-md whitespace-pre-wrap">{result.preventionTips}</p>
                </div>
              </div>
            )}
             {!result && !loading && (
              <div className="text-center text-muted-foreground py-12">
                <Sparkles className="h-12 w-12 mx-auto mb-4" />
                <p>Your plant diagnosis will be shown here once you submit an image for analysis.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DiagnosisSkeleton() {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div>
          <Skeleton className="h-7 w-52 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div>
          <Skeleton className="h-7 w-40 mb-2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }
