"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-xs font-bold tracking-[0.2em] text-pomegranate-600 uppercase">Something went wrong</p>
      <h1 className="font-display-tight mt-3 text-4xl font-semibold text-forest-900">We lost the signal</h1>
      <p className="mt-3 max-w-md text-ink-700">We couldn&apos;t load this page. Check your connection and try again.</p>
      <button onClick={reset} className="mt-8 rounded-full bg-forest-800 px-6 py-3 font-bold text-sand-50 hover:bg-forest-900">
        Try again
      </button>
    </div>
  );
}
