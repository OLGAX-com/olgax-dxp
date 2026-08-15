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
        collection in <code>@olgax/payload-preset</code> and <code>@olgax/multi-tenancy</code>{" "}
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
