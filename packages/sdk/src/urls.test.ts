import { describe, expect, it } from "vitest";
import { safeHref, safeMediaSrc } from "./urls";

describe("safeHref", () => {
  it("preserves safe relative, hash, http(s), mailto, and tel URLs", () => {
    expect(safeHref("/about")).toBe("/about");
    expect(safeHref("pricing")).toBe("pricing");
    expect(safeHref("#faq")).toBe("#faq");
    expect(safeHref("https://olgax.com/docs")).toBe("https://olgax.com/docs");
    expect(safeHref("http://localhost:3000")).toBe("http://localhost:3000");
    expect(safeHref("mailto:team@olgax.com")).toBe("mailto:team@olgax.com");
    expect(safeHref("tel:+15551234567")).toBe("tel:+15551234567");
  });

  it("blocks javascript:, vbscript:, data:, and protocol-relative variants", () => {
    expect(safeHref("javascript:alert(1)")).toBe("#");
    expect(safeHref("  JaVaScRiPt:alert(1)")).toBe("#");
    expect(safeHref("java\tscript:alert(1)")).toBe("#");
    expect(safeHref("vbscript:msgbox(1)")).toBe("#");
    expect(safeHref("data:text/html,<script>alert(1)</script>")).toBe("#");
    expect(safeHref("//evil.example.com/phish")).toBe("#");
    expect(safeHref("/\\evil.example.com/phish")).toBe("#");
    expect(safeHref("/\t/evil.example.com/phish")).toBe("#");
    expect(safeHref("\\\\evil.example.com\\phish")).toBe("#");
    expect(safeHref("")).toBe("#");
  });
});

describe("safeMediaSrc", () => {
  it("allows relative and http(s) media URLs", () => {
    expect(safeMediaSrc("/api/media/file/hero.png")).toBe("/api/media/file/hero.png");
    expect(safeMediaSrc("https://cdn.example.com/photo.jpg")).toBe(
      "https://cdn.example.com/photo.jpg",
    );
  });

  it("rejects javascript:, data:, mailto:, and protocol-relative variants", () => {
    expect(safeMediaSrc("javascript:alert(1)")).toBeNull();
    expect(safeMediaSrc("data:image/svg+xml,<svg onload=alert(1)>")).toBeNull();
    expect(safeMediaSrc("mailto:test@example.com")).toBeNull();
    expect(safeMediaSrc("//evil.example.com/x.png")).toBeNull();
    expect(safeMediaSrc("/\\evil.example.com/x.png")).toBeNull();
    expect(safeMediaSrc("/\t/evil.example.com/x.png")).toBeNull();
    expect(safeMediaSrc("")).toBeNull();
  });
});
