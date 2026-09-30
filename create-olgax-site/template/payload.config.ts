import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users, Media, Pages, Sections, SiteSettings, PageViews, Webhooks } from "@olgax.com/payload-preset";
import { LOCALES, DEFAULT_LOCALE } from "./lib/i18n";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseURL = process.env.DATABASE_URL || "file:./payload.db";

// Explicit path (rather than relying on each adapter's own default) so
// `pnpm migrate:create` always writes to the same place regardless of which
// db adapter is active - see apps/docs' production page for when a real
// migration (vs. dev-mode's automatic schema push) is required.
const migrationDir = path.resolve(dirname, "migrations");

// SQLite is the zero-config local dev default (matches create-olgax-site's
// under-2-minutes goal - no external service to stand up). For a real
// deployment, set DATABASE_URL to a postgres:// connection string (e.g. from
// Neon, Supabase, Railway, or Vercel Postgres) and this switches automatically.
const db = /^postgres(ql)?:\/\//.test(databaseURL)
  ? postgresAdapter({ pool: { connectionString: databaseURL }, migrationDir })
  : sqliteAdapter({ client: { url: databaseURL }, migrationDir });

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Sections, PageViews, Webhooks],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  // `Pages.title`/`data` are `localized: true` - each locale stores its own
  // content under the same document/slug (see lib/i18n.ts for the source of
  // truth this mirrors on the frontend's locale-prefixed routes).
  localization: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    fallback: true,
  },
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db,
  sharp,
});
