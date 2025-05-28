import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Party Venue Directory - Find Perfect Kids Party Venues in the UK",
  description: "Compare packages, prices, and facilities across the UK's best children's party venues. See what's included, hidden costs, and everything parents need to know.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
