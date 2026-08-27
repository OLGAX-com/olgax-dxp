"use client";

import { deletePage } from "@/lib/actions";

export function DeletePageButton({ id, title }: { id: string | number; title: string }) {
  return (
    <form
      action={() => deletePage(id)}
      onSubmit={(e) => {
        if (!confirm(`Delete "${title}"? This can't be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <button type="submit" className="text-red-600 hover:underline dark:text-red-400">
        Delete
      </button>
    </form>
  );
}
