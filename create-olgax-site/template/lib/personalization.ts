import { cookies } from "next/headers";
import type { VisitorState } from "@olgax.com/sdk";

// Same cookie name/marker proxy.ts sets on a visitor's first request (kept
// as a separate literal here rather than a shared import, since proxy.ts
// runs in the Edge runtime and this file pulls in next/headers).
const VISITOR_COOKIE = "olgax_visitor";

export async function getVisitorState(): Promise<VisitorState> {
  const store = await cookies();
  return store.has(VISITOR_COOKIE) ? "returning" : "new";
}
