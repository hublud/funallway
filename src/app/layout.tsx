import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // --- Core ---
  title: {
    default: "Baddies212 | Premium Escort Directory Nigeria",
    template: "%s | Baddies212",
  },
  description:
    "Baddies212 is Nigeria's premier escort directory. Browse verified, subscribed profiles and connect directly via WhatsApp. Discreet, safe, and stress-free.",
  keywords: [
    "escort Nigeria",
    "escorts Lagos",
    "escorts Abuja",
    "escort directory Nigeria",
    "Nigerian escorts",
    "companions Nigeria",
    "Baddies212",
    "meet escorts Nigeria",
    "escort booking Nigeria",
  ],

  // --- Canonical & Robots ---
  metadataBase: new URL("https://www.baddies212.com"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // --- Open Graph (Facebook, WhatsApp, LinkedIn previews) ---
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://www.baddies212.com",
    siteName: "Baddies212",
    title: "Baddies212 | Premium Escort Directory Nigeria",
    description:
      "Browse verified escort profiles across Nigeria. Connect directly via WhatsApp — discreet, secure, and stress-free. Start browsing on Baddies212 today.",
    images: [
      {
        url: "/images/home-banner.jpg",
        width: 1200,
        height: 630,
        alt: "Baddies212 — Nigeria's Premier Escort Directory",
      },
    ],
  },

  // --- Twitter / X Card ---
  twitter: {
    card: "summary_large_image",
    title: "Baddies212 | Premium Escort Directory Nigeria",
    description:
      "Browse verified escort profiles and connect via WhatsApp. Discreet and stress-free.",
    images: ["/images/home-banner.jpg"],
  },

  // --- Google Verification ---
  verification: {
    google: "vi6GrkFysJVF4IdNFlPI55op5Sw1V1LWbO1bfxwypbk",
  },

  // --- Author ---
  authors: [{ name: "Baddies212", url: "https://www.baddies212.com" }],
  creator: "Baddies212",
  publisher: "Baddies212",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-1C07YNN2WJ" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
          
            gtag('config', 'G-1C07YNN2WJ');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
        <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />
        <Navbar />
        <main className="flex-1 flex flex-col pb-16 sm:pb-0">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
