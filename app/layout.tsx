import type { Metadata } from "next";
import { Unbounded, Outfit } from "next/font/google"; // Switched to Unbounded + Outfit
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-unbounded" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "5AZ | Premium Jerseys",
  description: "Get the latest football jerseys with Gen Z style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${unbounded.variable} ${outfit.variable} font-sans antialiased bg-black text-white overflow-x-hidden`}>
        <div className="bg-noise"></div>
        <div className="bg-grid"></div>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
