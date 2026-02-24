import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="relative flex items-center justify-center p-4 border-b">
      <Button asChild variant="ghost" size="icon" className="absolute left-4">
        <Link href="/">
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Back to Home</span>
        </Link>
      </Button>
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
    </header>
  );
}
