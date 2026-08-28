import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Users, Media, Pages, Sections, SiteSettings, PageViews } from "@olgax/payload-preset";
import { LOCALES, DEFAULT_LOCALE } from "./lib/i18n";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const databaseURL = process.env.DATABASE_URL || "file:./payload.db";

// SQLite is the zero-config local dev default (matches create-olgax-site's
// under-2-minutes goal - no external service to stand up). For a real
// deployment, set DATABASE_URL to a postgres:// connection string (e.g. from
// Neon, Supabase, Railway, or Vercel Postgres) and this switches automatically.
const db = /^postgres(ql)?:\/\//.test(databaseURL)
  ? postgresAdapter({ pool: { connectionString: databaseURL } })
  : sqliteAdapter({ client: { url: databaseURL } });

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages, Sections, PageViews],
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
