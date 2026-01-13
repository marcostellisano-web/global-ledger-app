import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global Ledger - AI-Powered Investment Analysis",
  description: "Aggregates macroeconomic and geopolitical news with daily AI-powered investment analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
