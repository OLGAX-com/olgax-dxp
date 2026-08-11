import { getPayload } from "payload";
import config from "../payload.config";

// One-off local dev helper: creates a first admin user and a demo `home`
// page (built from the default @olgax/components library) so the
// Payload <-> Puck round-trip can be verified without using the admin UI.
async function seed() {
  const payload = await getPayload({ config });

  const existingUsers = await payload.find({ collection: "users", limit: 1 });
  if (existingUsers.docs.length === 0) {
    await payload.create({
      collection: "users",
      data: { email: "admin@example.com", password: "ChangeMe123!" },
    });
    console.log("Created admin user: admin@example.com / ChangeMe123!");
  } else {
    console.log("Admin user already exists, skipping.");
  }

  const existingPages = await payload.find({
    collection: "pages",
    where: { slug: { equals: "home" } },
    limit: 1,
  });
  if (existingPages.docs.length === 0) {
    await payload.create({
      collection: "pages",
      data: {
        title: "Home",
        slug: "home",
        // Explicitly published, since new documents otherwise default to
        // `_status: 'draft'` and wouldn't be visible on the public route.
        _status: "published",
        data: {
          root: {},
          content: [
            {
              type: "Hero",
              props: {
                id: "hero-1",
                heading: "Hello from Puck + Payload",
                subheading: "This page's content lives in Payload and renders through Puck.",
                ctaLabel: "Edit this page",
                ctaHref: "/home/edit",
              },
            },
            {
              type: "CTA",
              props: {
                id: "cta-1",
                heading: "Built with @olgax/components",
                buttonLabel: "View admin",
                buttonHref: "/admin",
              },
            },
          ],
        },
      },
    });
    console.log("Created demo page: /home");
  } else {
    console.log("Demo page already exists, skipping.");
  }

  process.exit(0);
}

seed();
