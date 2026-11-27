"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleLogout() {
    setSigningOut(true);
    try {
      await fetch("/api/users/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      disabled={signingOut}
      onClick={() => void handleLogout()}
      className="cursor-pointer text-zinc-600 hover:underline disabled:opacity-50 dark:text-zinc-400"
    >
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
