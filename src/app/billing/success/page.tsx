"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BillingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;

    const checkAccess = async () => {
      attempts++;

      try {
        const res = await fetch("/api/me");
        if (!res.ok) return;

        const student = await res.json();

        if (student.access_level >= 2) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // ignore and retry
      }

      if (attempts < 10) {
        setTimeout(checkAccess, 1000);
      } else {
        router.replace("/dashboard");
      }
    };

    checkAccess();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Betaling verwerkt… even geduld</p>
    </div>
  );
}

