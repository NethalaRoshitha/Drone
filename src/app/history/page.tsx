'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query, doc, deleteDoc } from 'firebase/firestore';
import { format } from 'date-fns';

import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sprout, Microscope, Trash2 } from 'lucide-react';
import type { CropRecommendationOutput } from '@/ai/flows/crop-recommendation-assistant';
import type { GeneratePlantDiseaseCureOutput } from '@/ai/flows/plant-disease-cure-generator';
import { WithId } from '@/firebase/firestore/use-collection';
import { placeholderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


type CropRecommendationHistory = {
  inputs: any;
  output: CropRecommendationOutput;
  createdAt: { toDate: () => Date };
};

type DiseaseDetectionHistory = {
  photoDataUri: string;
  output: GeneratePlantDiseaseCureOutput;
  createdAt: { toDate: () => Date };
};

export default function HistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const recommendationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const recsCollection = collection(firestore, 'users', user.uid, 'cropRecommendations');
    return query(recsCollection, orderBy('createdAt', 'desc'));
  }, [firestore, user]);
  const { data: recommendations, isLoading: loadingRecs } = useCollection<CropRecommendationHistory>(recommendationsQuery);

  const detectionsQuery = useMemoFirebase(() => {
    if (!user) return null;
    const detsCollection = collection(firestore, 'users', user.uid, 'diseaseDetections');
    return query(detsCollection, orderBy('createdAt', 'desc'));
  }, [firestore, user]);
  const { data: detections, isLoading: loadingDets } = useCollection<DiseaseDetectionHistory>(detectionsQuery);

  const isLoading = loadingRecs || loadingDets;

  return (
    <div className="flex flex-col flex-1">
      <PageHeader title="History" />
      <div className="flex-1 p-4 md:p-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="recommendations" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recommendations">Crop Recommendations</TabsTrigger>
              <TabsTrigger value="detections">Disease Detections</TabsTrigger>
            </TabsList>
            <TabsContent value="recommendations">
              <HistoryList
                title="Crop Recommendation History"
                icon={<Sprout className="h-6 w-6 text-primary" />}
                items={recommendations}
                renderItem={(item) => <RecommendationCard item={item} />}
                emptyMessage="No crop recommendations found. Try using the Crop Recommendation feature!"
              />
            </TabsContent>
            <TabsContent value="detections">
              <HistoryList
                title="Disease Detection History"
                icon={<Microscope className="h-6 w-6 text-primary" />}
                items={detections}
                renderItem={(item) => <DetectionCard item={item} />}
                emptyMessage="No disease detections found. Try using the Plant Disease Detection feature!"
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function HistoryList<T>({ title, icon, items, renderItem, emptyMessage }: { title: string, icon: React.ReactNode, items: WithId<T>[] | null, renderItem: (item: WithId<T>) => React.ReactNode, emptyMessage: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items && items.length > 0 ? (
          items.map((item) => (
            <div key={item.id}>
                {renderItem(item)}
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-12">
            <p>{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendationCard({ item }: { item: WithId<CropRecommendationHistory> }) {
    const { inputs, output, createdAt } = item;
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete item. User not authenticated.',
            });
            return;
        }
        try {
            const docRef = doc(firestore, 'users', user.uid, 'cropRecommendations', item.id);
            await deleteDoc(docRef);
            toast({
                title: 'History Deleted',
                description: 'The recommendation has been removed from your history.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete history item.',
            });
            console.error("Error deleting document: ", error);
        }
    };

    return (
        <Card className='bg-background'>
            <CardHeader>
                <CardTitle className='text-lg'>Crop: {output.recommended_crop}</CardTitle>
                <CardDescription>
                    {createdAt ? format(createdAt.toDate(), 'PPP p') : 'Date not available'}
                </CardDescription>
            </CardHeader>
            <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                 <div className="md:col-span-1">
                    <h4 className="font-semibold mb-2">Inputs</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Nitrogen: {inputs.nitrogen}</li>
                        <li>Phosphorus: {inputs.phosphorus}</li>
                        <li>Potassium: {inputs.potassium}</li>
                        <li>Temperature: {inputs.temperature}°C</li>
                        <li>Humidity: {inputs.humidity}%</li>
                        <li>pH: {inputs.ph}</li>
                        <li>Rainfall: {inputs.rainfall}mm</li>
                    </ul>
                </div>
                <div className="md:col-span-1 space-y-4">
                    <div>
                        <h4 className="font-semibold">Fertilizer</h4>
                        <p>{output.fertilizer}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Tips</h4>
                        <p className='whitespace-pre-wrap'>{output.tips}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this history item.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    )
}

function DetectionCard({ item }: { item: WithId<DiseaseDetectionHistory> }) {
    const { output, createdAt, photoDataUri } = item;
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete item. User not authenticated.',
            });
            return;
        }
        try {
            const docRef = doc(firestore, 'users', user.uid, 'diseaseDetections', item.id);
            await deleteDoc(docRef);
            toast({
                title: 'History Deleted',
                description: 'The detection has been removed from your history.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete history item.',
            });
            console.error("Error deleting document: ", error);
        }
    };
    return (
        <Card className='bg-background'>
            <CardHeader>
                <CardTitle className='text-lg'>Disease: {output.disease} ({output.confidence})</CardTitle>
                <CardDescription>
                    {createdAt ? format(createdAt.toDate(), 'PPP p') : 'Date not available'}
                </CardDescription>
            </CardHeader>
            <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm'>
                {photoDataUri && (
                    <div className="relative aspect-video rounded-lg overflow-hidden border">
                        <Image
                            src={photoDataUri}
                            alt={`Detected disease: ${output.disease}`}
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
                <div className='space-y-2'>
                    <div>
                        <h4 className="font-semibold">Cure Instructions</h4>
                        <p className="whitespace-pre-wrap">{output.cureInstructions}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold">Prevention Tips</h4>
                        <p className="whitespace-pre-wrap">{output.preventionTips}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this history item.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    )
}
