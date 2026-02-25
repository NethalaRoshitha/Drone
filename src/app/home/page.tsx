'use client';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Leaf, ScanSearch, LogOut } from 'lucide-react';
import { AgriSmartLogo } from '@/components/icons';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const features = [
  {
    icon: <Leaf className="h-8 w-8 text-primary" />,
    title: 'Crop Recommendation',
    description: 'Get AI-driven advice on the best crops for your soil and climate conditions.',
    href: '/crop-recommendation',
    cta: 'Get Started',
  },
  {
    icon: <ScanSearch className="h-8 w-8 text-primary" />,
    title: 'Plant Disease Detection',
    description: 'Upload an image of a plant to detect diseases and receive expert cure recommendations.',
    href: '/plant-disease-detection',
    cta: 'Analyze Plant',
  },
];

export default function HomePage() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleSignOut = () => {
    if (auth) {
      signOut(auth);
      router.push('/login');
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
       <Button onClick={handleSignOut} variant="ghost" className="absolute top-4 right-4">
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
      <div className="w-full max-w-4xl">
        <header className="text-center mb-12">
          {user && <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">Hello {user.displayName || 'Roshitha'} 👋</h1>}
          <div className="inline-block mb-4">
            <AgriSmartLogo className="h-20 w-20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
            AgriSmart AI
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Smart solutions for modern farming.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="flex-row items-start gap-4 space-y-0">
                {feature.icon}
                <div className="flex-1">
                  <CardTitle className="text-xl">{feature.title}</CardTitle>

                  <CardDescription>{feature.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex items-end">
                <Button asChild className="w-full bg-primary/90 hover:bg-primary">
                  <Link href={feature.href}>
                    {feature.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
