import { createHmac } from "crypto";
import { describe, expect, it } from "vitest";
import { sign } from "./dispatch";

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
