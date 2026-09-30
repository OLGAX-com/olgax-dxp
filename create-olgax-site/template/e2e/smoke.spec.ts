import { test, expect } from "@playwright/test";

// One smoke test, not a full e2e suite: confirms the core pipeline actually
// works end to end on a real browser - login, an authenticated dashboard
// view, and a published page rendering its real content publicly. State is
// arranged via the REST API in global-setup.ts (proven reliable) rather than
// by automating Puck's drag-and-drop canvas, which this project's own
// experience has found fragile to drive through browser automation - this
// test asserts on real rendering, which is the part actually worth covering.

test("published content renders on the public site", async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { name: "E2E smoke test heading" })).toBeVisible();
});

test("an editor can log in and see the seeded page in the dashboard", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("e2e@example.com");
  await page.getByLabel("Password", { exact: true }).fill("E2eTestPass123!");
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("**/admin");

  await page.goto("/en/dashboard/pages");
  await expect(page.getByText("/home")).toBeVisible();
});

test("publishing a change via the API is reflected on the public page", async ({
  page,
  request,
}) => {
  const login = await request
    .post("/api/users/login", {
      data: { email: "e2e@example.com", password: "E2eTestPass123!" },
    })
    .then((r) => r.json());

  const found = await request
    .get("/api/pages?where[slug][equals]=home", {
      headers: { Authorization: `JWT ${login.token}` },
    })
    .then((r) => r.json());
  const home = found.docs[0];

  const newHeading = `Updated at ${Date.now()}`;
  await request.patch(`/api/pages/${home.id}?draft=false`, {
    headers: { Authorization: `JWT ${login.token}`, "Content-Type": "application/json" },
    data: {
      title: home.title,
      data: {
        ...home.data,
        content: home.data.content.map((block: { type: string; props: Record<string, unknown> }) =>
          block.type === "Hero" ? { ...block, props: { ...block.props, heading: newHeading } } : block,
        ),
      },
      _status: "published",
    },
  });

  await page.goto("/en");
  await expect(page.getByRole("heading", { name: newHeading })).toBeVisible();
});
