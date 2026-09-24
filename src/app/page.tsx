import { api } from "@/lib/api";

type Health = { status: string; app: string; time: string };

async function getHealth(): Promise<Health | null> {
  try {
    return await api<Health>("health", { cache: "no-store" });
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">EcoTrail</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Azerbaijan Trail Explorer is under construction.
      </p>
      <p className="text-sm">
        API:{" "}
        {health ? (
          <span className="text-emerald-600">connected ({health.app})</span>
        ) : (
          <span className="text-red-600">unreachable</span>
        )}
      </p>
    </main>
  );
}
