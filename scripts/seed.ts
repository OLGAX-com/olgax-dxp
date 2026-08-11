import { getPayload } from "payload";
import config from "../payload.config";

// One-off local dev helper: creates a first admin user and a demo `home`
// page so the Phase 0 round-trip (Puck Data -> Payload -> render) can be
// verified without going through the admin UI by hand.
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
        data: {
          root: {},
          content: [
            {
              type: "HeadingBlock",
              props: { id: "heading-1", title: "Hello from Puck + Payload" },
            },
            {
              type: "TextBlock",
              props: {
                id: "text-1",
                text: "This page's content lives in Payload and renders through Puck.",
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
