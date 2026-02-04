import type { Metadata } from "next";
import { Unbounded, Bricolage_Grotesque, Space_Mono, Syne, Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Footer from "@/components/Footer";

const displayFont = Unbounded({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["700", "800", "900"]
});
const fancyFont = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-fancy",
  weight: ["300", "400", "500", "600", "700", "800"]
});
const aestheticFont = Syne({
  subsets: ["latin"],
  variable: "--font-aesthetic",
  weight: ["400", "500", "600", "700", "800"]
});
const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans-alt",
  weight: ["400", "500", "600", "700", "800"]
});
const accentFont = Outfit({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["400", "500", "600", "700", "800", "900"]
});
const monoFont = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"]
});

export const metadata: Metadata = {
  title: "5AZ | ELITE FOOTBALL ARCHIVE",
  description: "India's premier destination for high-end football kits and retro classics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${fancyFont.variable} ${monoFont.variable} ${aestheticFont.variable} ${sansFont.variable} ${accentFont.variable} font-fancy antialiased overflow-x-hidden bg-[#000] text-white selection:bg-[#D9FF00] selection:text-black`}>
        <Providers>
          {children}
        </Providers>
        <Footer />
      </body>
    </html>
  );
}
