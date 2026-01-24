import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css"; // Attention au chemin relatif selon où est ton layout
import Header from "@/app/components/layout/header";
import Footer from "@/app/components/layout/footer"; // Import du Footer
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Koda - Marketplace de données",
  description: "Achetez et vendez des datasets de qualité pour l'IA",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <ClerkProvider>
      <html lang={locale}>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
          <NextIntlClientProvider messages={messages}>

            <Header />

            <main className="flex-1">
              {children}
            </main>

            {/* Le Footer s'affichera toujours en bas grâce au flex-col et flex-1 du main */}
            <Footer />

            <Toaster position="top-center" richColors />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}