import type { Metadata } from "next";
import type { ReactNode } from "react";

import { StudioShell } from "@/components/ui/studio-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "shadcn-ui-framework",
    template: "%s — shadcn-ui-framework",
  },
  description:
    "A research-oriented shadcn/ui framework for extracting SaaS interface patterns and generating original AI-assisted websites.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-sm focus:text-background"
        >
          Skip to content
        </a>
        <StudioShell>{children}</StudioShell>
      </body>
    </html>
  );
}
