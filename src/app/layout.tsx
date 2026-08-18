import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { ClientProviders } from "./client-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "First Issues - Find Beginner-Friendly Open Source Issues",
    template: "%s | First Issues",
  },
  description:
    "Discover beginner-friendly open source issues on GitHub. Filter by language, difficulty, and more to find your first contribution.",
  keywords: [
    "open source",
    "good first issue",
    "beginner friendly",
    "github issues",
    "first contribution",
    "hacktoberfest",
  ],
  authors: [{ name: "First Issues" }],
  openGraph: {
    type: "website",
    title: "First Issues - Find Beginner-Friendly Open Source Issues",
    description:
      "Discover beginner-friendly open source issues on GitHub.",
    siteName: "First Issues",
  },
  twitter: {
    card: "summary_large_image",
    title: "First Issues - Find Beginner-Friendly Open Source Issues",
    description:
      "Discover beginner-friendly open source issues on GitHub.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
        <Toaster position="bottom-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}

