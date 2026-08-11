import { NextResponse } from "next/server";
import { queryCollectionFromSearchParams } from "@olgax/datasource";
import { getPayloadClient } from "@/lib/payload";

// Server-only bridge for @olgax/datasource's client-safe resolver: never
// imported by client-bundled code, so it's fine for this to use Payload directly.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const items = await queryCollectionFromSearchParams(getPayloadClient, searchParams);
  return NextResponse.json(items);
}
