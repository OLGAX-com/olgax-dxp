export default function Page() {
  return (
    <>
      <h1>Webhooks</h1>
      <p>
        The <code>Webhooks</code> collection (<code>packages/payload-preset</code>) is the
        integration mechanism itself, not an integration with any one third-party service -
        register any URL and it gets notified when content changes. No vendor is hardcoded, so
        it works equally well for a Slack incoming webhook, a Zapier catch hook, a static-site
        rebuild trigger, or your own custom endpoint.
      </p>

      <h2>Configuring one</h2>
      <p>
        In Payload admin, go to <strong>Webhooks</strong> and create an entry with a name, the
        target <code>url</code>, a <code>secret</code>, and which <code>events</code> it should
        fire for. Both read and write access require a logged-in user, since a webhook&apos;s
        secret is sensitive.
      </p>

      <h2>Events</h2>
      <ul>
        <li>
          <code>page.published</code> - fires whenever a page&apos;s <code>_status</code> becomes
          (or stays) <code>&quot;published&quot;</code>. A plain autosaved draft never fires
          this - only an actual publish does.
        </li>
        <li>
          <code>page.deleted</code> - fires whenever a page is deleted, published or not.
        </li>
      </ul>
      <p>
        Both are dispatched from the <code>Pages</code> collection&apos;s{" "}
        <code>afterChange</code>/<code>afterDelete</code> hooks (see{" "}
        <code>packages/payload-preset/src/webhooks/dispatch.ts</code>), so they fire no matter
        how the change happens - the admin panel, the REST/GraphQL API, or the Local API - not
        just through this app&apos;s own server actions.
      </p>

      <h2>Payload shape</h2>
      <pre>{`{
  "event": "page.published",
  "slug": "home",
  "locale": "en",
  "title": "Home",
  "timestamp": "2026-01-01T12:00:00.000Z"
}`}</pre>

      <h2>Verifying the signature</h2>
      <p>
        Every request carries an <code>X-Olgax-Signature</code> header -{" "}
        <code>sha256=&lt;hex&gt;</code>, an HMAC-SHA256 of the raw request body keyed with that
        webhook&apos;s own <code>secret</code> (the same convention GitHub and Stripe use for
        their webhooks). Verify it before trusting the payload:
      </p>
      <pre>{`import { createHmac, timingSafeEqual } from "crypto";

function isValid(secret: string, rawBody: string, header: string | null) {
  if (!header) return false;
  const expected = \`sha256=\${createHmac("sha256", secret).update(rawBody).digest("hex")}\`;
  return (
    header.length === expected.length &&
    timingSafeEqual(Buffer.from(header), Buffer.from(expected))
  );
}`}</pre>
      <p>
        A slow or unreachable receiver never blocks or fails the publish/delete that triggered
        it - dispatch happens in parallel with a 5-second timeout per request, and a failure is
        swallowed rather than surfaced to the editor.
      </p>
    </>
  );
}
