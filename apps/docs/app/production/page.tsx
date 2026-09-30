export default function Page() {
  return (
    <>
      <h1>Production considerations</h1>
      <p>
        Two things every real deployment needs to get right that a local spike doesn&apos;t:
        who can edit, and where data lives.
      </p>

      <h2>Access control</h2>
      <p>
        Payload does <strong>not</strong> restrict reads/writes by default just because a
        collection has <code>auth: true</code> or <code>versions.drafts</code> enabled - every
        collection in <code>@olgax.com/payload-preset</code> and <code>@olgax.com/multi-tenancy</code>{" "}
        explicitly defines <code>access.create</code>/<code>update</code>/<code>delete</code>{" "}
        requiring a logged-in user (<code>Boolean(req.user)</code>), and <code>Users</code>{" "}
        additionally allows anonymous <code>create</code> only when zero users exist yet (the
        bootstrap/first-admin flow).
      </p>
      <p>
        The Local API (used by <code>apps/demo</code>&apos;s own server actions and routes)
        bypasses access control by default (<code>overrideAccess: true</code>). Write paths that
        matter - <code>lib/actions.ts</code>&apos;s <code>saveDraftPageData</code>/
        <code>publishPageData</code> - explicitly check for a logged-in user first and pass{" "}
        <code>overrideAccess: false</code> so Payload&apos;s own access control is the actual
        enforcement, not just a UI-level check. The <code>/[slug]/edit</code> route itself also
        redirects anonymous visitors to <code>/admin/login</code> rather than rendering the
        editor at all.
      </p>

      <h2>Database</h2>
      <p>
        <code>apps/demo</code>&apos;s <code>payload.config.ts</code> picks a database adapter
        based on <code>DATABASE_URL</code>: SQLite (zero external services) if it&apos;s a{" "}
        <code>file:</code> path, Postgres if it starts with <code>postgres://</code> or{" "}
        <code>postgresql://</code>.
      </p>
      <pre>{`# Local dev (default)
DATABASE_URL=file:./payload.db

# Production - any managed Postgres works (Neon, Supabase, Railway, Vercel Postgres, ...)
DATABASE_URL=postgres://user:password@host:5432/dbname`}</pre>
      <p>
        SQLite stays the default so <code>create-olgax-site</code> keeps its under-2-minute,
        zero-setup goal - swapping to Postgres for production is a one-line env var change, not
        a code change.
      </p>

      <h2>Migrations</h2>
      <p>
        <code>payload.config.ts</code> sets an explicit <code>migrationDir</code> (
        <code>apps/demo/migrations</code>) so migrations land in the same place regardless of
        which database adapter is active. Three scripts wrap Payload&apos;s CLI:
      </p>
      <pre>{`pnpm migrate:create   # write a new migration from the current schema diff
pnpm migrate          # run any pending migrations
pnpm migrate:status   # list applied/pending migrations`}</pre>
      <p>
        Local dev never needs these - Payload&apos;s dev-mode schema push (the &ldquo;Pulling
        schema from database&rdquo; prompt) applies changes automatically, which is fine for
        disposable local data. A real deployment should use migrations instead: run{" "}
        <code>pnpm migrate:create</code> after a schema-affecting change, commit the generated
        file, and run <code>pnpm migrate</code> as part of deploying - never rely on the
        dev-mode push (or accept its &ldquo;DATA LOSS WARNING&rdquo; prompt) against a database
        with real content.
      </p>
      <p>
        Marking an existing field <code>localized: true</code> (as <code>Pages.title</code>/
        <code>data</code> and <code>Sections.content</code> are, see{" "}
        <code>packages/payload-preset</code>) is the schema change most likely to trigger that
        warning - it changes how the column is stored, and accepting the prompt against a
        populated table drops the old column. Write a migration that moves existing values into
        the new localized structure first, or add localization from the start on a fresh project
        instead of retrofitting it onto live content.
      </p>

      <h2>Analytics</h2>
      <p>
        <code>apps/demo</code> records basic page-view counts out of the box (no setup, no
        external service - see the Analytics tab in <code>/dashboard</code>). For broader
        indicators - countries, session duration, devices, browsers, referrers, UTM campaigns -
        it integrates with a self-hosted{" "}
        <a href="https://umami.is">Umami</a> instance instead of reimplementing any of that.
        Umami is entirely optional: with no env vars set, no tracker script loads and nothing
        changes from today&apos;s zero-config default.
      </p>
      <p>
        Run <code>docker compose -f docker-compose.umami.yml up -d</code> (bundled in{" "}
        <code>apps/demo</code>), create a website in Umami&apos;s own UI, then set{" "}
        <code>NEXT_PUBLIC_UMAMI_SCRIPT_URL</code>, <code>NEXT_PUBLIC_UMAMI_WEBSITE_ID</code>, and{" "}
        <code>NEXT_PUBLIC_UMAMI_DASHBOARD_URL</code> in <code>.env</code> - see{" "}
        <code>.env.example</code> for the exact values. Both the built-in counter and the Umami
        tracker skip a logged-in editor&apos;s own visits, so previewing your own work never
        inflates the numbers.
      </p>

      <h2>Still worth doing before a real launch</h2>
      <ul>
        <li>
          Configure a real email adapter (Payload logs verification/reset emails to the console
          otherwise - see{" "}
          <a href="https://payloadcms.com/docs/email/overview">Payload&apos;s email docs</a>).
        </li>
        <li>
          Add roles to <code>Users</code> if you need more than one editor permission level -
          the current access rules treat any logged-in user as a full editor.
        </li>
        <li>Set a strong, unique `PAYLOAD_SECRET` per environment - never reuse the local one.</li>
      </ul>
    </>
  );
}
