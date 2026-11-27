"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogout() {
    setSigningOut(true);
    setError(null);
    try {
      const res = await fetch("/api/users/logout", { method: "POST" });
      if (!res.ok) {
        throw new Error("Sign out failed");
      }
      router.push("/admin/login");
      router.refresh();
    } catch {
      setSigningOut(false);
      setError("Sign out failed");
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        disabled={signingOut}
        onClick={() => void handleLogout()}
        className="cursor-pointer text-zinc-600 hover:underline disabled:opacity-50 dark:text-zinc-400"
      >
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
      {error && (
        <span role="status" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </span>
  );
}
