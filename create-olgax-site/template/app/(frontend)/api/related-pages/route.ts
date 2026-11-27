import { NextResponse } from "next/server";
import { DatasourceQueryError, queryCollectionFromSearchParams } from "@olgax.com/datasource";
import { getPayloadClient } from "@/lib/payload";

const PUBLIC_COLLECTIONS = ["pages"] as const;
const ALLOWED_FILTER_FIELDS = ["slug", "title"] as const;

// Server-only bridge for @olgax.com/datasource's client-safe resolver: never
// imported by client-bundled code, so it's fine for this to use Payload directly.
// Explicitly restricts queries to public collections and enforces anonymous
// Payload access control (`overrideAccess: false`) so drafts and private
// collections (users, webhooks, sections, page-views) can never be read here.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  try {
    const items = await queryCollectionFromSearchParams(getPayloadClient, searchParams, {
      allowedCollections: PUBLIC_COLLECTIONS,
      allowedFilterFields: ALLOWED_FILTER_FIELDS,
      user: null,
    });
    return NextResponse.json(items);
  } catch (error) {
    if (error instanceof DatasourceQueryError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Failed to query datasource." }, { status: 500 });
  }
}
