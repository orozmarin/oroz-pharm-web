import { Leaf } from "lucide-react";
import Button from "@/components/shared/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-cream">
      <div className="text-center">
        <Leaf size={64} className="mx-auto text-green-300 mb-6" />
        <h1 className="text-6xl md:text-8xl font-bold text-green-900 mb-4 font-[family-name:var(--font-heading)]">
          404
        </h1>
        <p className="text-xl text-gray-600 mb-2">Stranica nije pronađena</p>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Izgleda da ste zalutali s polja. Vratite se na početnu stranicu ili pregledajte naše proizvode.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/">Početna stranica</Button>
          <Button href="/proizvodi" variant="outline">Proizvodi</Button>
        </div>
      </div>
    </div>
  );
}
