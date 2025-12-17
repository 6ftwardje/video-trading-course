"use client";

import { useRouter } from "next/navigation";

export function LockedOverlay() {
  const router = useRouter();

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
      <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-6 text-center space-y-4 shadow-lg">
        <p className="font-semibold text-white">
          Deze content is vergrendeld
        </p>

        <p className="text-sm text-[var(--text-dim)]">
          Upgrade je account om volledige toegang te krijgen.
        </p>

        <button
          onClick={() => router.push("/upgrade")}
          className="rounded-md bg-[var(--accent)] px-4 py-2 font-medium text-black hover:opacity-90 transition"
        >
          Ontgrendel volledige toegang
        </button>
      </div>
    </div>
  );
}

