import type { Metadata } from "next";
import React from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next.js App with ZenVQ Universal Live Translation",
  description: "Production Next.js App Router setup with zero-server live translation"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* ZenVQ Live DOM Translation Engine (Loads early and patches Virtual DOM safety) */}
        <script src="/lib/zenvq-translate.js" defer />
      </head>
      <body className="bg-[#09090b] text-[#fafafa] min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
