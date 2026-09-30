import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Workspace packages ship raw TS/CSS source (no build step), so Next needs
  // to transpile them itself.
  transpilePackages: [
    "@olgax.com/sdk",
    "@olgax.com/components",
    "@olgax.com/payload-preset",
    "@olgax.com/datasource",
  ],
};

export default withPayload(nextConfig);
