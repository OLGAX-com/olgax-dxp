export default function Page() {
  return (
    <>
      <h1>Drafts &amp; publishing</h1>
      <p>
        The <code>Pages</code> collection has Payload&apos;s built-in drafts enabled
        (<code>versions.drafts</code>) - not a custom versioning system.
      </p>
      <ul>
        <li>
          Editing autosaves progress as a <strong>draft</strong> (debounced, via Puck&apos;s{" "}
          <code>onChange</code>) - this never touches the published/live page.
        </li>
        <li>
          Clicking <strong>Publish</strong> in the Puck editor (<code>onPublish</code>) promotes
          the current changes to <code>_status: &quot;published&quot;</code> - only then does the
          public route show them.
        </li>
        <li>
          Reopening the editor loads the latest draft (falling back to published if there is no
          newer draft), so in-progress edits are never lost.
        </li>
      </ul>
      <h2>Why this needed explicit access control</h2>
      <p>
        Payload&apos;s <code>draft</code> parameter on <code>find</code>/<code>findByID</code>{" "}
        controls which version is returned when you ask for it - it does{" "}
        <strong>not</strong> filter out documents whose <code>_status</code> is{" "}
        <code>&quot;draft&quot;</code> from a normal query. The public render route explicitly
        filters <code>where: {"{"} _status: {"{"} equals: &quot;published&quot; {"}"} {"}"}</code>
        , and the <code>Pages</code> collection&apos;s <code>access.read</code> enforces the same
        rule for anyone using the REST/GraphQL API directly (the Local API used by this app&apos;s
        own routes bypasses access control by default, so both guards matter).
      </p>
    </>
  );
}
