import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

// Pages that used to live at the site root now live under /docs.
const moved = {
  installation: "/docs/getting-started/quick-start",
  components: "/docs/contributing/default-components",
  tutorial: "/docs/guides/custom-components",
  sdk: "/docs/reference/sdk",
  theming: "/docs/guides/theming",
  personalization: "/docs/guides/personalization",
  "data-sources": "/docs/guides/data-sources",
  drafts: "/docs/guides/drafts-and-publishing",
  webhooks: "/docs/guides/webhooks",
  production: "/docs/deployment/production",
  "custom-components": "/docs/guides/custom-components",
};

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return Object.entries(moved).map(([from, to]) => ({
      source: `/${from}`,
      destination: to,
      permanent: true,
    }));
  },
};

export default withMDX(config);
