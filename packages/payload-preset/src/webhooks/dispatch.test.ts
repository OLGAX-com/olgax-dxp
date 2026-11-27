import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { sign } from "./dispatch";
import { validateWebhookUrl } from "./validate";

describe("sign", () => {
  it("produces a sha256=<hex> signature matching a manual HMAC computation", () => {
    const secret = "test-secret";
    const body = JSON.stringify({ event: "page.published", slug: "home" });
    const expected = `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
    expect(sign(secret, body)).toBe(expected);
  });

  it("produces a different signature for a different secret", () => {
    const body = JSON.stringify({ event: "page.published", slug: "home" });
    expect(sign("secret-a", body)).not.toBe(sign("secret-b", body));
  });

  it("produces a different signature for a different body", () => {
    const secret = "test-secret";
    expect(sign(secret, "a")).not.toBe(sign(secret, "b"));
  });
});

describe("validateWebhookUrl", () => {
  it("accepts public https and http URLs", () => {
    expect(validateWebhookUrl("https://hooks.example.com/olgax")).toBe(true);
    expect(validateWebhookUrl("http://webhooks.example.org/hook")).toBe(true);
  });

  it("rejects non-HTTP(S) schemes", () => {
    expect(validateWebhookUrl("file:///etc/passwd")).not.toBe(true);
    expect(validateWebhookUrl("javascript:alert(1)")).not.toBe(true);
  });

  it("rejects loopback, private, and cloud metadata endpoints", () => {
    expect(validateWebhookUrl("http://localhost:3000/hook")).not.toBe(true);
    expect(validateWebhookUrl("http://127.0.0.1/hook")).not.toBe(true);
    expect(validateWebhookUrl("http://169.254.169.254/latest/meta-data/")).not.toBe(true);
    expect(validateWebhookUrl("http://10.0.0.1/internal")).not.toBe(true);
    expect(validateWebhookUrl("http://192.168.1.1/hook")).not.toBe(true);
    expect(validateWebhookUrl("http://[::1]/hook")).not.toBe(true);
    expect(validateWebhookUrl("http://metadata.google.internal/computeMetadata/v1/")).not.toBe(true);
  });
});
