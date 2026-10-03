import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = `${SITE.name} - ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Shown when the site is shared (Discord, social media, search results).
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "linear-gradient(135deg, #09090b 0%, #27272a 100%)",
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: "#fafafa",
              color: "#09090b",
              fontSize: 44,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            O
          </div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>{SITE.name}</div>
        </div>
        <div style={{ marginTop: 40, fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>
          Self-hostable page building for Payload CMS and Next.js
        </div>
        <div style={{ marginTop: 40, fontSize: 30, color: "#a1a1aa" }}>
          dxp.olgax.com  -  discord.gg/EAXcCXgUz2
        </div>
      </div>
    ),
    size,
  );
}
