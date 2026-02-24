"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { useInView } from "@/lib/useInView";
import Button from "@/components/shared/Button";
import { Send, CheckCircle } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Ime mora imati najmanje 2 znaka"),
  email: z.string().email("Unesite ispravnu email adresu"),
  phone: z.string().optional(),
  category: z.string().min(1, "Odaberite kategoriju"),
  message: z.string().min(10, "Poruka mora imati najmanje 10 znakova"),
});

type FormData = z.infer<typeof schema>;

const categories = [
  "Sjemenski program",
  "Gnojiva",
  "Zaštita bilja",
  "Stočna hrana",
  "Sadni materijal",
  "Oprema za povrtlarstvo i cvjećarstvo",
  "Navodnjavanje",
  "Enologija",
  "Oprema za pčelarstvo",
  "Poljoprivredni strojevi",
  "Alati",
  "Oprema za stočarstvo",
  "Ulja i maziva",
  "Kućni ljubimci",
  "Pribor za kolinje",
  "Gume i zračnice",
  "Vrt i okućnica",
  "Roba široke potrošnje",
  "Ekološki proizvodi",
  "Ostalo",
];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const ref = useInView<HTMLDivElement>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (_data: FormData) => {
    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
  };

  return (
    <section className="relative">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-green-900/85" />

      <div className="relative pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-2xl mx-auto">
          <div
            ref={ref}
            className="animate-on-scroll anim-fade-in-up bg-white rounded-2xl shadow-2xl p-8 md:p-10"
          >
            {submitted ? (
              <div className="text-center py-12">
                <CheckCircle size={64} className="mx-auto text-green-600 mb-4" />
                <h2 className="text-2xl font-bold text-green-900 mb-2 font-[family-name:var(--font-heading)]">
                  Hvala vam!
                </h2>
                <p className="text-gray-600">
                  Vaša poruka je uspješno poslana. Javit ćemo vam se u najkraćem roku.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-green-900 mb-2 font-[family-name:var(--font-heading)]">
                  Kontaktirajte nas
                </h2>
                <p className="text-gray-500 mb-8">
                  Imate pitanje? Pošaljite nam poruku i javit ćemo vam se u najkraćem roku.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ime i prezime *
                      </label>
                      <input
                        {...register("name")}
                        className="w-full border-b-2 border-gray-200 focus:border-green-600 bg-transparent py-2 px-1 outline-none transition-colors text-gray-900"
                        placeholder="Vaše ime"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        {...register("email")}
                        type="email"
                        className="w-full border-b-2 border-gray-200 focus:border-green-600 bg-transparent py-2 px-1 outline-none transition-colors text-gray-900"
                        placeholder="vas@email.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefon
                      </label>
                      <input
                        {...register("phone")}
                        type="tel"
                        className="w-full border-b-2 border-gray-200 focus:border-green-600 bg-transparent py-2 px-1 outline-none transition-colors text-gray-900"
                        placeholder="+385..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategorija *
                      </label>
                      <select
                        {...register("category")}
                        className="w-full border-b-2 border-gray-200 focus:border-green-600 bg-transparent py-2 px-1 outline-none transition-colors text-gray-900"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Odaberite kategoriju
                        </option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poruka *
                    </label>
                    <textarea
                      {...register("message")}
                      rows={4}
                      className="w-full border-b-2 border-gray-200 focus:border-green-600 bg-transparent py-2 px-1 outline-none transition-colors resize-none text-gray-900"
                      placeholder="Opišite vaše pitanje ili zahtjev..."
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full gap-2">
                    {isSubmitting ? (
                      "Slanje..."
                    ) : (
                      <>
                        <Send size={18} /> Pošalji poruku
                      </>
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
