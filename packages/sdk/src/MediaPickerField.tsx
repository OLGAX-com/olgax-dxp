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
  const [error, setError] = useState<string | null>(null);
  const [uploadAlt, setUploadAlt] = useState("");

  async function loadMedia() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/media?limit=24&sort=-createdAt");
      if (!res.ok) throw new Error(`Failed to load media (${res.status})`);
      const data = (await res.json()) as { docs?: MediaItem[] };
      setItems(Array.isArray(data.docs) ? data.docs : []);
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
            if (next) void loadMedia();
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
          {loading && <p style={{ margin: 0, fontSize: 11 }}>Loading media…</p>}

          {!loading && items.length === 0 && (
            <p style={{ margin: 0, fontSize: 11, color: "#71717a" }}>
              No uploaded media yet. Upload an image above.
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
        </div>
      )}
    </div>
  );
}
