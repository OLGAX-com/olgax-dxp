export default function Page() {
  return (
    <>
      <h1>Data sources</h1>
      <p>
        <code>@olgax.com/datasource</code> is a narrow resolver layer: a component declares
        &quot;pull N items from a Payload collection, filtered by one field&quot; and receives
        them as a resolved <code>items</code> prop. It deliberately does not support a general
        query language - one equality filter, a limit, nothing more.
      </p>
      <pre>{`// lib/puck.config.ts - shared by the editor and the render route
import { createCollectionResolverFetch } from "@olgax.com/datasource";
import { registerRelatedPages } from "@olgax.com/components";

registerRelatedPages(createCollectionResolverFetch("/api/related-pages"));`}</pre>
      <pre>{`// app/(frontend)/api/related-pages/route.ts - the Route Handler it calls
import { NextResponse } from "next/server";
import { queryCollectionFromSearchParams } from "@olgax.com/datasource";
import { getPayloadClient } from "@/lib/payload";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const items = await queryCollectionFromSearchParams(getPayloadClient, searchParams);
  return NextResponse.json(items);
}`}</pre>
      <p>
        The author sets <code>collection</code>, optionally <code>filterField</code>/
        <code>filterValue</code>, and <code>limit</code> in the Puck editor - <code>items</code>{" "}
        is resolved automatically (via Puck&apos;s <code>resolveData</code>) and marked
        read-only. See <code>@olgax.com/components</code>&apos;s <code>RelatedPages</code> block for
        a complete example.
      </p>
      <p>
        <code>createCollectionResolverFetch</code> is safe to share with the client{" "}
        <code>&lt;Puck&gt;</code> editor because it only ever calls <code>fetch()</code> - the
        actual Payload query runs inside the Route Handler, which is always server-only. A
        direct <code>createCollectionResolver(getPayload)</code> variant also exists, but it
        must only be used in a config that never reaches client-bundled code.
      </p>
    </>
  );
}
