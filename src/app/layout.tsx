import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  LAUNCHFRAME_SAAS_IDEA,
  LAUNCHFRAME_SOURCE_URL,
} from "@/lib/launchframe-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function pickMetaTitle(idea: string): string {
  const line = idea.trim().split(/\r?\n/)[0]?.trim() ?? idea.trim();
  return line.slice(0, 70) || "Launchframe";
}

export async function generateMetadata(): Promise<Metadata> {
  const title = pickMetaTitle(LAUNCHFRAME_SAAS_IDEA);
  return {
    title,
    description: `Landing positioning: ${LAUNCHFRAME_SAAS_IDEA.slice(0, 140)} Visual reference: ${LAUNCHFRAME_SOURCE_URL}`,
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
