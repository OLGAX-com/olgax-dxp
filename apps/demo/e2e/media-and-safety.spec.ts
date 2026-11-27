import { test, expect } from "@playwright/test";

test.describe("URL sanitization, Gallery empty state, and Puck draft preview", () => {
  test("sanitizes javascript: hrefs and unsafe Gallery media srcs on render", async ({
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
          title: "Safety Render Check",
          slug: "safety-render-check",
          _status: "published",
          data: {
            root: { props: { title: "Safety Render Check" } },
            content: [
              {
                type: "Hero",
                props: {
                  id: "xss-hero",
                  heading: "Safe Hero",
                  subheading: "Sub",
                  ctaLabel: "Unsafe Link",
                  ctaHref: "javascript:alert(1)",
                },
              },
              {
                type: "Gallery",
                props: {
                  id: "xss-gallery",
                  images: [{ src: "javascript:alert(1)", alt: "Bad image" }],
                },
              },
            ],
          },
        },
      })
      .then((r) => r.json());
    const id = created.doc.id;

    try {
      await page.goto("/en/safety-render-check");
      const link = page.getByRole("link", { name: "Unsafe Link" });
      await expect(link).toHaveAttribute("href", "#");
      await expect(page.getByText("No images added yet.")).toBeVisible();
      await expect(page.locator("img[alt='Bad image']")).toHaveCount(0);
    } finally {
      await request.delete(`/api/pages/${id}`, { headers });
    }
  });

  test("Puck editor header links to draft preview (?preview=true)", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByLabel("Email").fill("e2e@example.com");
    await page.getByLabel("Password", { exact: true }).fill("E2eTestPass123!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL("**/admin");

    await page.goto("/en/new-draft-preview-check/edit");
    const previewLink = page.getByRole("link", { name: /Preview draft/ });
    await expect(previewLink).toHaveAttribute("href", "/en/new-draft-preview-check?preview=true");
  });
});
