import type { Metadata } from "next";
import { Geist, Geist_Mono, Lora } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import ScrollToTop from "@/components/ScrollToTop";
import LoadingScreen from "@/components/LoadingScreen";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-ui",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Premium Dealership | Veloce",
  description:
    "Curated selection of performance and luxury vehicles. Inspected with precision, presented with total transparency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} ${lora.variable} antialiased font-normal`}>
        <LoadingScreen />
        <div className="noise" />
        <SmoothScrollProvider />
        <ScrollToTop />
        {children}
      </body>
    </html>
  );
}
