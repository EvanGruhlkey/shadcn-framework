import Link from "next/link";

import {
  LAUNCHFRAME_SAAS_IDEA,
  LAUNCHFRAME_SOURCE_URL,
} from "@/lib/launchframe-config";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          SaaS idea
        </p>
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl whitespace-pre-wrap">
          {LAUNCHFRAME_SAAS_IDEA}
        </h1>
        <p className="text-pretty text-sm text-muted-foreground sm:text-base">
          Visual reference (clone target):{" "}
          <Link
            href={LAUNCHFRAME_SOURCE_URL}
            className="font-medium text-foreground underline underline-offset-4"
            target="_blank"
            rel="noreferrer noopener"
          >
            {LAUNCHFRAME_SOURCE_URL}
          </Link>
        </p>
        <p className="text-pretty text-sm text-muted-foreground">
          Run{" "}
          <code className="rounded-md bg-muted px-2 py-1 font-mono text-foreground">
            /launchframe {LAUNCHFRAME_SOURCE_URL} &quot;…your saas idea…&quot;
          </code>{" "}
          with your AI agent to rebuild this layout from the reference site while keeping the SaaS
          positioning above.
        </p>
      </div>
    </main>
  );
}
