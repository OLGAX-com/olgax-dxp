import { test, expect } from "@playwright/test";

test.describe("Editorial workflows & validation", () => {
  test("rejects invalid and reserved page slugs via API", async ({ request }) => {
    const login = await request
      .post("/api/users/login", {
        data: { email: "e2e@example.com", password: "E2eTestPass123!" },
      })
      .then((r) => r.json());
    const headers = { Authorization: `JWT ${login.token}`, "Content-Type": "application/json" };

    const reservedSlug = await request.post("/api/pages", {
      headers,
      data: { title: "Reserved", slug: "dashboard", data: { root: {}, content: [] } },
    });
    expect(reservedSlug.status()).toBe(400);

    const invalidSlug = await request.post("/api/pages", {
      headers,
      data: { title: "Bad", slug: "Bad Slug!", data: { root: {}, content: [] } },
    });
    expect(invalidSlug.status()).toBe(400);
  });

  test("draft pages preview for logged-in editors and 404 for anonymous users", async ({
    browser,
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
          title: "Draft Preview Page",
          slug: "draft-preview-test",
          _status: "draft",
          data: {
            root: { props: { title: "Draft Preview Page" } },
            content: [
              {
                type: "Hero",
                props: {
                  id: "draft-hero",
                  heading: "Unpublished Draft Heading",
                  subheading: "Only visible in preview",
                  ctaLabel: "",
                  ctaHref: "",
                },
              },
            ],
          },
        },
      })
      .then((r) => r.json());

    const draftId = created.doc.id;
    try {
      // Anonymous request must still 404 even with ?preview=true
      const anonContext = await browser.newContext();
      const anonPage = await anonContext.newPage();
      const anonRes = await anonPage.goto("/en/draft-preview-test?preview=true");
      expect(anonRes?.status()).toBe(404);
      await anonContext.close();

      // Authenticated editor sees Preview link in dashboard and Draft preview banner
      const editorContext = await browser.newContext();
      const editorPage = await editorContext.newPage();
      await editorPage.goto("/admin/login");
      await editorPage.getByLabel("Email").fill("e2e@example.com");
      await editorPage.getByLabel("Password", { exact: true }).fill("E2eTestPass123!");
      await editorPage.getByRole("button", { name: "Login" }).click();
      await editorPage.waitForURL("**/admin");

      await editorPage.goto("/en/dashboard/pages");
      await expect(editorPage.getByText("Draft Preview Page")).toBeVisible();
      await editorPage.locator('a[href*="/en/draft-preview-test?preview=true"]').click();
      await expect(editorPage.getByText(/Draft preview/)).toBeVisible();
      await expect(editorPage.getByRole("heading", { name: "Unpublished Draft Heading" })).toBeVisible();
      await editorContext.close();
    } finally {
      await request.delete(`/api/pages/${draftId}`, { headers });
    }
  });

  test("NewPageForm validates invalid/reserved slugs and keeps mobile input height", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("e2e@example.com");
    await page.getByLabel("Password", { exact: true }).fill("E2eTestPass123!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL("**/admin");

    await page.goto("/en/dashboard/pages");
    const slugInput = page.getByLabel("Page slug");
    const box = await slugInput.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(36);

    await slugInput.fill("dashboard");
    await page.getByRole("button", { name: "New page" }).click();
    await expect(page.getByText(/reserved route name/)).toBeVisible();

    await slugInput.fill("bad!@#");
    await page.getByRole("button", { name: "New page" }).click();
    await expect(page.getByText(/lowercase letters, numbers, and hyphens/)).toBeVisible();
  });
});
