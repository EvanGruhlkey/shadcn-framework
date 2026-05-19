export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">
        Clone target not yet built. Run{" "}
        <code className="font-mono text-foreground">/clone-website &lt;url&gt;</code> or{" "}
        <code className="font-mono text-foreground">/launchframe &lt;url&gt; &quot;your idea&quot;</code>{" "}
        to start.
      </p>
    </main>
  );
}
