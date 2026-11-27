import { MediaPickerField, cacheMediaAlt, getCachedMediaAlt } from "./MediaPickerField";

/**
 * Reusable Puck custom field allowing editors to paste an image URL, browse
 * Payload's Media collection, or upload a new image without leaving the editor.
 */
export function mediaField(label = "Image") {
  return {
    type: "custom" as const,
    render: ({
      name,
      value,
      onChange,
    }: {
      name: string;
      value?: string;
      onChange: (value: string) => void;
    }) => <MediaPickerField label={label} name={name} value={value} onChange={onChange} />,
  };
}

/**
 * Resolves default alt text for a Payload media URL (from in-memory selection
 * cache or `/api/media` lookup in the browser) so blocks like `Gallery` can
 * auto-populate `alt` when an image is chosen or replaced.
 */
export async function resolveMediaAlt(url: string | undefined | null): Promise<string | undefined> {
  if (!url) return undefined;
  const cached = getCachedMediaAlt(url);
  if (cached) return cached;
  if (typeof window === "undefined" || !url.startsWith("/api/media")) return undefined;

  try {
    const res = await fetch(`/api/media?where[url][equals]=${encodeURIComponent(url)}&limit=1`);
    if (!res.ok) return undefined;
    const data = (await res.json()) as { docs?: { alt?: string | null; filename?: string | null }[] };
    const alt = data.docs?.[0]?.alt || data.docs?.[0]?.filename || undefined;
    if (alt) cacheMediaAlt(url, alt);
    return alt;
  } catch {
    return undefined;
  }
}
