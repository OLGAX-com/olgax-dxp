import { test, expect } from "@playwright/test";

test.describe("SEO metadata, sitemap, RBAC, unpublish, and dashboard UX", () => {
  test("renders SEO metadata tags, dynamic /sitemap.xml, and /robots.txt", async ({
    page,
    request,
  }) => {
    const login = await request
      .post("/api/users/login", {
        data: { email: "e2e@example.com", password: "E2eTestPass123!" },
      })
      .then((r) => r.json());
    const headers = { Authorization: `JWT ${login.token}`, "Content-Type": "application/json" };

    const indexable = await request
      .post("/api/pages", {
        headers,
        data: {
          title: "SEO Test Page",
          slug: "seo-public-test",
          _status: "published",
          seo: {
            metaTitle: "Custom SEO Meta Title",
            metaDescription: "Custom meta description for search engines.",
            noIndex: false,
          },
          data: { root: { props: { title: "SEO Test Page" } }, content: [] },
        },
      })
      .then((r) => r.json());

    const hidden = await request
      .post("/api/pages", {
        headers,
        data: {
          title: "Hidden NoIndex Page",
          slug: "seo-noindex-test",
          _status: "published",
          seo: {
            metaTitle: "Hidden Page",
            noIndex: true,
          },
          data: { root: { props: { title: "Hidden NoIndex Page" } }, content: [] },
        },
      })
      .then((r) => r.json());

    try {
      await page.goto("/en/seo-public-test");
      await expect(page).toHaveTitle("Custom SEO Meta Title");
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        "Custom meta description for search engines.",
      );

      await page.goto("/en/seo-noindex-test");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

      const sitemapRes = await request.get("/sitemap.xml");
      expect(sitemapRes.status()).toBe(200);
      const sitemapXml = await sitemapRes.text();
      expect(sitemapXml).toContain("/en/seo-public-test");
      expect(sitemapXml).not.toContain("/en/seo-noindex-test");

      const robotsRes = await request.get("/robots.txt");
      expect(robotsRes.status()).toBe(200);
      const robotsTxt = await robotsRes.text();
      expect(robotsTxt).toContain("Disallow: /admin");
      expect(robotsTxt).toContain("sitemap.xml");
    } finally {
      await request.delete(`/api/pages/${indexable.doc.id}`, { headers });
      await request.delete(`/api/pages/${hidden.doc.id}`, { headers });
    }
  });

  test("enforces RBAC permissions for author role vs admin", async ({ request }) => {
    const adminLogin = await request
      .post("/api/users/login", {
        data: { email: "e2e@example.com", password: "E2eTestPass123!" },
      })
      .then((r) => r.json());
    const adminHeaders = {
      Authorization: `JWT ${adminLogin.token}`,
      "Content-Type": "application/json",
    };

    const authorEmail = `author-${Date.now()}@example.com`;
    const authorRes = await request
      .post("/api/users", {
        headers: adminHeaders,
        data: { email: authorEmail, password: "AuthorPass123!", role: "author" },
      })
      .then((r) => r.json());
    const authorId = authorRes.doc.id;

    const authorLogin = await request
      .post("/api/users/login", {
        data: { email: authorEmail, password: "AuthorPass123!" },
      })
      .then((r) => r.json());
    const authorHeaders = {
      Authorization: `JWT ${authorLogin.token}`,
      "Content-Type": "application/json",
    };

    let draftPageId: number | string | undefined;
    try {
      // Author cannot read webhooks or update site-settings
      const whRes = await request.get("/api/webhooks", { headers: authorHeaders });
      expect(whRes.status()).toBe(403);

      const settingsRes = await request.post("/api/globals/site-settings", {
        headers: authorHeaders,
        data: { primaryColor: "#000000" },
      });
      expect(settingsRes.status()).toBe(403);

      // Author cannot elevate their own role
      await request.patch(`/api/users/${authorId}`, {
        headers: authorHeaders,
        data: { role: "admin" },
      });
      const selfCheck = await request
        .get(`/api/users/${authorId}`, { headers: authorHeaders })
        .then((r) => r.json());
      expect(selfCheck.role).toBe("author");

      // Author cannot publish directly
      const publishAttempt = await request.post("/api/pages", {
        headers: authorHeaders,
        data: {
          title: "Author Publish Attempt",
          slug: "author-publish-blocked",
          _status: "published",
          data: { root: {}, content: [] },
        },
      });
      expect(publishAttempt.status()).toBe(403);

      // Author CAN create a draft, CANNOT delete it
      const draftCreate = await request.post("/api/pages", {
        headers: authorHeaders,
        data: {
          title: "Author Draft",
          slug: "author-draft-ok",
          _status: "draft",
          data: { root: {}, content: [] },
        },
      });
      expect(draftCreate.status()).toBe(201);
      draftPageId = (await draftCreate.json()).doc.id;

      const deleteAttempt = await request.delete(`/api/pages/${draftPageId}`, {
        headers: authorHeaders,
      });
      expect(deleteAttempt.status()).toBe(403);
    } finally {
      if (draftPageId) {
        await request.delete(`/api/pages/${draftPageId}`, { headers: adminHeaders });
      }
      await request.delete(`/api/users/${authorId}`, { headers: adminHeaders });
    }
  });

  test("editor can unpublish a live page and sign out from the dashboard", async ({
    page,
    request,
  }) => {
    const login = await request
      .post("/api/users/login", {
        data: { email: "e2e@example.com", password: "E2eTestPass123!" },
      })
      .then((r) => r.json());
    const headers = { Authorization: `JWT ${login.token}`, "Content-Type": "application/json" };

    const created = await request
      .post("/api/pages", {
        headers,
        data: {
          title: "Unpublish Me",
          slug: "unpublish-e2e",
          _status: "published",
          data: { root: { props: { title: "Unpublish Me" } }, content: [] },
        },
      })
      .then((r) => r.json());
    const id = created.doc.id;

    try {
      await page.goto("/admin/login");
      await page.getByLabel("Email").fill("e2e@example.com");
      await page.getByLabel("Password", { exact: true }).fill("E2eTestPass123!");
      await page.getByRole("button", { name: "Login" }).click();
      await page.waitForURL("**/admin");

      await page.goto("/en/dashboard/pages");
      const row = page.locator("li", { hasText: "Unpublish Me" });
      await expect(row).toBeVisible();

      page.once("dialog", (dialog) => dialog.accept());
      await row.getByRole("button", { name: "Unpublish" }).click();
      await expect(page.locator("li", { hasText: "Unpublish Me" })).toContainText("Draft");

      // Public route now 404s for anonymous visitors
      const anonContext = await page.context().browser()!.newContext();
      const anonPage = await anonContext.newPage();
      const res = await anonPage.goto("/en/unpublish-e2e");
      expect(res?.status()).toBe(404);
      await anonContext.close();

      // Sign out button logs out to /admin/login
      await page.getByRole("button", { name: "Sign out" }).click();
      await page.waitForURL("**/admin/login");
    } finally {
      await request.delete(`/api/pages/${id}`, { headers });
    }
  });

  test("Media collection rejects unsafe MIME types and generates thumbnail", async ({
    request,
  }) => {
    const login = await request
      .post("/api/users/login", {
        data: { email: "e2e@example.com", password: "E2eTestPass123!" },
      })
      .then((r) => r.json());
    const authHeaders = { Authorization: `JWT ${login.token}` };

    // Reject HTML upload
    const htmlUpload = await request.post("/api/media", {
      headers: authHeaders,
      multipart: {
        file: {
          name: "bad.html",
          mimeType: "text/html",
          buffer: Buffer.from("<script>alert(1)</script>"),
        },
        _payload: JSON.stringify({ alt: "Bad HTML" }),
      },
    });
    expect(htmlUpload.status()).toBe(400);

    // Accept PNG upload and generate thumbnail
    const sharp = (await import("sharp")).default;
    const pngBuffer = await sharp({
      create: { width: 450, height: 350, channels: 3, background: { r: 24, g: 24, b: 27 } },
    })
      .png()
      .toBuffer();
    const pngUpload = await request.post("/api/media", {
      headers: authHeaders,
      multipart: {
        file: {
          name: "thumb-check.png",
          mimeType: "image/png",
          buffer: pngBuffer,
        },
        _payload: JSON.stringify({ alt: "Thumb check" }),
      },
    });
    expect(pngUpload.status()).toBe(201);
    const body = await pngUpload.json();
    expect(body.doc?.sizes?.thumbnail?.url).toBeTruthy();
    expect(body.doc?.sizes?.thumbnail?.width).toBe(400);
    expect(body.doc?.sizes?.thumbnail?.height).toBe(300);
    if (body.doc?.id) {
      await request.delete(`/api/media/${body.doc.id}`, { headers: authHeaders });
    }
  });
});
