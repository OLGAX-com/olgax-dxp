import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Workspace packages ship raw TS/CSS source (no build step), so Next needs
  // to transpile them itself.
  transpilePackages: [
    "@olgax/sdk",
    "@olgax/components",
    "@olgax/payload-preset",
    "@olgax/datasource",
  ],
};

export default withPayload(nextConfig);
