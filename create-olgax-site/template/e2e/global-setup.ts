// Seeds the e2e test database via the (already-running, per playwright.config.ts's
// webServer) REST API - no direct DB/Local API access here, so this never
// races with the dev server's own connection to the same sqlite file.
async function globalSetup() {
  const baseURL = "http://localhost:3100";

  // Users' own `create` access rule (packages/payload-preset) already only
  // allows an unauthenticated create when zero users exist yet - no need to
  // pre-check via a GET first (Users' `read` requires auth anyway, so an
  // anonymous "does a user exist" GET would just 403).
  await fetch(`${baseURL}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "e2e@example.com", password: "E2eTestPass123!" }),
  });

  const login = await fetch(`${baseURL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "e2e@example.com", password: "E2eTestPass123!" }),
  }).then((r) => r.json());
  const token = login.token;

  const pages = await fetch(`${baseURL}/api/pages?where[slug][equals]=home`, {
    headers: { Authorization: `JWT ${token}` },
  }).then((r) => r.json());

  if (pages.docs?.length === 0) {
    await fetch(`${baseURL}/api/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `JWT ${token}` },
      body: JSON.stringify({
        title: "Home",
        slug: "home",
        _status: "published",
        data: {
          root: {},
          content: [
            {
              type: "Hero",
              props: {
                id: "e2e-hero",
                heading: "E2E smoke test heading",
                subheading: "Seeded by e2e/global-setup.ts",
                ctaLabel: "",
                ctaHref: "",
              },
            },
          ],
        },
      }),
    });
  }
}

export default globalSetup;
