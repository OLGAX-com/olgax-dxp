import { createHmac } from "crypto";
import http from "node:http";
import { describe, expect, it } from "vitest";
import { postWebhook, sign } from "./dispatch";
import { resolveAndValidateWebhookTarget, validateWebhookUrl } from "./validate";

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

  it("rejects IPv4-mapped IPv6 addresses targeting protected ranges", () => {
    expect(validateWebhookUrl("http://[::ffff:127.0.0.1]/hook")).not.toBe(true);
    expect(validateWebhookUrl("http://[::ffff:7f00:1]/hook")).not.toBe(true);
    expect(validateWebhookUrl("http://[::ffff:169.254.169.254]/latest/meta-data/")).not.toBe(true);
    expect(validateWebhookUrl("http://[::ffff:a9fe:a9fe]/latest/meta-data/")).not.toBe(true);
    expect(validateWebhookUrl("http://[::ffff:10.0.0.1]/hook")).not.toBe(true);
    expect(validateWebhookUrl("http://[::ffff:192.168.1.1]/hook")).not.toBe(true);
    expect(validateWebhookUrl("http://[::ffff:172.16.0.1]/hook")).not.toBe(true);
    expect(validateWebhookUrl("http://[::ffff:8.8.8.8]/hook")).toBe(true);
  });
});

describe("resolveAndValidateWebhookTarget", () => {
  it("rejects hostnames that resolve to private or loopback IPs", async () => {
    await expect(
      resolveAndValidateWebhookTarget("https://rebind.example.com/hook", async () => [
        { address: "127.0.0.1", family: 4 },
      ]),
    ).rejects.toThrow(/private or reserved/i);

    await expect(
      resolveAndValidateWebhookTarget("https://rebind.example.com/hook", async () => [
        { address: "::ffff:7f00:1", family: 6 },
      ]),
    ).rejects.toThrow(/private or reserved/i);
  });

  it("returns pinned public IP when DNS resolves cleanly", async () => {
    const target = await resolveAndValidateWebhookTarget(
      "https://hooks.example.com/hook",
      async () => [{ address: "93.184.216.34", family: 4 }],
    );
    expect(target.address).toBe("93.184.216.34");
    expect(target.family).toBe(4);
  });
});

describe("postWebhook", () => {
  it("does not follow 307 redirects to internal targets", async () => {
    let internalHit = false;
    const internalServer = http.createServer((_req, res) => {
      internalHit = true;
      res.writeHead(200);
      res.end("secret");
    });
    const redirectServer = http.createServer((_req, res) => {
      const internalPort = (internalServer.address() as { port: number }).port;
      res.writeHead(307, { Location: `http://127.0.0.1:${internalPort}/metadata` });
      res.end();
    });

    await new Promise<void>((r) => internalServer.listen(0, "127.0.0.1", r));
    await new Promise<void>((r) => redirectServer.listen(0, "127.0.0.1", r));

    const prev = process.env.OLGAX_ALLOW_PRIVATE_WEBHOOKS;
    process.env.OLGAX_ALLOW_PRIVATE_WEBHOOKS = "true";
    try {
      const redirectPort = (redirectServer.address() as { port: number }).port;
      const res = await postWebhook(
        `http://127.0.0.1:${redirectPort}/hook`,
        "secret",
        "page.published",
        JSON.stringify({ event: "page.published", slug: "home", timestamp: "now" }),
      );
      expect(res.statusCode).toBe(307);
      expect(internalHit).toBe(false);
    } finally {
      if (prev === undefined) delete process.env.OLGAX_ALLOW_PRIVATE_WEBHOOKS;
      else process.env.OLGAX_ALLOW_PRIVATE_WEBHOOKS = prev;
      redirectServer.close();
      internalServer.close();
    }
  });
});
