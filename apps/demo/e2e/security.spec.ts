import { test, expect } from "@playwright/test";

test.describe("Security boundaries", () => {
  test("unauthenticated /api/related-pages blocks private collections and drafts", async ({
    request,
  }) => {
    const usersRes = await request.get("/api/related-pages?collection=users");
    expect(usersRes.status()).toBe(403);

    const webhooksRes = await request.get("/api/related-pages?collection=webhooks");
    expect(webhooksRes.status()).toBe(403);

    const invalidRes = await request.get("/api/related-pages?collection=nonexistent");
    expect(invalidRes.status()).toBe(403);

    const badCharsRes = await request.get("/api/related-pages?collection=../users");
    expect(badCharsRes.status()).toBe(400);

    // Public pages query is allowed and only returns published pages
    const pagesRes = await request.get("/api/related-pages?collection=pages&limit=5");
    expect(pagesRes.status()).toBe(200);
    const docs = await pagesRes.json();
    expect(Array.isArray(docs)).toBe(true);
    for (const doc of docs) {
      expect(doc._status).not.toBe("draft");
    }
  });

  test("rejects SSRF webhook URLs targeting private or metadata endpoints", async ({
    request,
  }) => {
    const login = await request
      .post("/api/users/login", {
        data: { email: "e2e@example.com", password: "E2eTestPass123!" },
      })
      .then((r) => r.json());
    const headers = { Authorization: `JWT ${login.token}`, "Content-Type": "application/json" };

    const ssrfWebhook = await request.post("/api/webhooks", {
      headers,
      data: {
        name: "Blocked metadata hook",
        url: "http://169.254.169.254/latest/meta-data/",
        secret: "test-secret",
        events: ["page.published"],
        enabled: true,
      },
    });
    expect(ssrfWebhook.status()).toBe(400);
  });
});
