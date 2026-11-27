"use client";

import { useState } from "react";
import { safeMediaSrc } from "./urls";

type MediaItem = {
  id: string | number;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  alt?: string | null;
};

type MediaPageResponse = {
  docs?: MediaItem[];
  hasNextPage?: boolean;
  nextPage?: number | null;
};

const PAGE_SIZE = 12;

// Cache of known media default alt texts keyed by URL so blocks (like Gallery)
// can populate default `alt` metadata on selection/upload without breaking
// string-typed `src` fields.
const mediaAltCache = new Map<string, string>();

export function getCachedMediaAlt(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  return mediaAltCache.get(url);
}

export function cacheMediaAlt(url: string | undefined | null, alt: string | undefined | null) {
  if (url && alt && alt.trim()) {
    mediaAltCache.set(url, alt.trim());
  }
}

export function MediaPickerField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value?: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");

  async function loadMedia(targetPage = 1, append = false, query = search) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        page: String(targetPage),
        sort: "-createdAt",
      });
      const trimmed = query.trim();
      if (trimmed) {
        params.set("where[or][0][alt][contains]", trimmed);
        params.set("where[or][1][filename][contains]", trimmed);
      }
      const res = await fetch(`/api/media?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to load media (${res.status})`);
      const data = (await res.json()) as MediaPageResponse;
      const docs = Array.isArray(data.docs) ? data.docs : [];
      for (const doc of docs) {
        cacheMediaAlt(doc.url, doc.alt || doc.filename);
      }
      setItems((prev) => (append ? [...prev, ...docs] : docs));
      setPage(targetPage);
      setHasNextPage(Boolean(data.hasNextPage));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load media library");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const alt = uploadAlt.trim() || file.name.replace(/\.[^.]+$/, "") || "Uploaded image";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("_payload", JSON.stringify({ alt }));

      const res = await fetch("/api/media", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const data = (await res.json()) as { doc?: MediaItem };
      if (data.doc?.url) {
        cacheMediaAlt(data.doc.url, data.doc.alt || alt);
        onChange(data.doc.url);
        setItems((prev) => [data.doc!, ...prev]);
        setUploadAlt("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  const previewSrc = safeMediaSrc(value);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span>{label}</span>
        <input
          type="text"
          name={name}
          value={value ?? ""}
          placeholder="https://... or /api/media/file/..."
          onChange={(e) => onChange(e.currentTarget.value)}
          style={{
            padding: "6px 8px",
            borderRadius: 4,
            border: "1px solid #d4d4d8",
            fontSize: 12,
          }}
        />
      </label>

      {previewSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewSrc}
          alt="Selected media preview"
          style={{
            maxHeight: 96,
            width: "100%",
            objectFit: "cover",
            borderRadius: 4,
            border: "1px solid #e4e4e7",
          }}
        />
      )}

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          type="button"
          onClick={() => {
            const next = !open;
            setOpen(next);
            if (next) void loadMedia(1, false, search);
          }}
          style={{
            fontSize: 12,
            padding: "4px 8px",
            borderRadius: 4,
            border: "1px solid #d4d4d8",
            cursor: "pointer",
          }}
        >
          {open ? "Close library" : "Browse media"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ fontSize: 12, cursor: "pointer" }}
          >
            Clear
          </button>
        )}
      </div>

      {open && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 8,
            border: "1px solid #e4e4e7",
            borderRadius: 6,
            background: "#fafafa",
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            <input
              type="search"
              value={search}
              placeholder="Search media by alt or filename"
              onChange={(e) => {
                const nextSearch = e.currentTarget.value;
                setSearch(nextSearch);
                void loadMedia(1, false, nextSearch);
              }}
              style={{
                flex: 1,
                padding: "4px 6px",
                borderRadius: 4,
                border: "1px solid #d4d4d8",
                fontSize: 11,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <input
              type="text"
              value={uploadAlt}
              placeholder="Alt text for new upload (optional)"
              onChange={(e) => setUploadAlt(e.currentTarget.value)}
              style={{
                padding: "4px 6px",
                borderRadius: 4,
                border: "1px solid #d4d4d8",
                fontSize: 11,
              }}
            />
            <label style={{ fontSize: 11, cursor: "pointer" }}>
              {uploading ? "Uploading..." : "Upload new image: "}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.currentTarget.files?.[0];
                  if (file) void handleUpload(file);
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {error && <p style={{ margin: 0, fontSize: 11, color: "#dc2626" }}>{error}</p>}
          {loading && items.length === 0 && <p style={{ margin: 0, fontSize: 11 }}>Loading media…</p>}

          {!loading && items.length === 0 && (
            <p style={{ margin: 0, fontSize: 11, color: "#71717a" }}>
              No matching media found. Upload an image above.
            </p>
          )}

          {items.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 6,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {items.map((item) => {
                const thumb = safeMediaSrc(item.thumbnailURL || item.url);
                const fullUrl = safeMediaSrc(item.url);
                if (!thumb || !fullUrl) return null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.alt || item.filename || fullUrl}
                    onClick={() => {
                      cacheMediaAlt(fullUrl, item.alt || item.filename);
                      onChange(fullUrl);
                      setOpen(false);
                    }}
                    style={{
                      padding: 2,
                      border: value === fullUrl ? "2px solid #18181b" : "1px solid #e4e4e7",
                      borderRadius: 4,
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={thumb}
                      alt={item.alt || item.filename || "Media"}
                      style={{ width: "100%", height: 48, objectFit: "cover", borderRadius: 2 }}
                    />
                  </button>
                );
              })}
            </div>
          )}

          {hasNextPage && (
            <button
              type="button"
              disabled={loading}
              onClick={() => void loadMedia(page + 1, true, search)}
              style={{
                fontSize: 11,
                padding: "4px 8px",
                borderRadius: 4,
                border: "1px solid #d4d4d8",
                cursor: "pointer",
              }}
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
