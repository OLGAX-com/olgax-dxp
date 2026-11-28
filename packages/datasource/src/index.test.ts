import { describe, it, expect, vi } from "vitest";
import {
  DatasourceQueryError,
  queryCollectionFromSearchParams,
  queryCollectionWithMeta,
  createCollectionResolver,
} from "./index";

function makeMockPayload(collections = ["pages", "posts"]) {
  const find = vi.fn().mockResolvedValue({
    docs: [{ id: 1, title: "Hello", slug: "hello" }],
    totalDocs: 15,
    totalPages: 2,
    page: 1,
    hasNextPage: true,
    hasPrevPage: false,
  });
  return {
    collections: Object.fromEntries(collections.map((c) => [c, {}])),
    find,
  };
}

describe("@olgax.com/datasource", () => {
  it("supports sort, page, depth, and filterOperator with pagination metadata", async () => {
    const payload = makeMockPayload();
    const params = new URLSearchParams({
      collection: "posts",
      filterField: "title",
      filterOperator: "contains",
      filterValue: "olgax",
      sort: "-publishedAt",
      limit: "5",
      page: "2",
      depth: "1",
    });

    const res = await queryCollectionWithMeta(async () => payload as never, params, {
      allowedCollections: ["posts"],
      allowedFilterFields: ["title", "slug"],
      allowedSortFields: ["publishedAt", "title"],
    });

    expect(res.totalDocs).toBe(15);
    expect(res.totalPages).toBe(2);
    expect(res.hasNextPage).toBe(true);
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "posts",
        where: { title: { contains: "olgax" } },
        sort: "-publishedAt",
        limit: 5,
        page: 2,
        depth: 1,
        overrideAccess: false,
      }),
    );
  });

  it("clamps limit to maxLimit and depth to maxDepth", async () => {
    const payload = makeMockPayload();
    const params = new URLSearchParams({
      collection: "posts",
      limit: "500",
      depth: "10",
    });

    await queryCollectionFromSearchParams(async () => payload as never, params, {
      allowedCollections: ["posts"],
      maxLimit: 20,
      maxDepth: 2,
    });

    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, depth: 2 }),
    );
  });

  it("enforces maxDepth even when depth is omitted and rejects invalid depth", async () => {
    const payload = makeMockPayload();

    await queryCollectionFromSearchParams(
      async () => payload as never,
      new URLSearchParams({ collection: "posts" }),
      { allowedCollections: ["posts"], maxDepth: 0 },
    );

    expect(payload.find).toHaveBeenCalledWith(expect.objectContaining({ depth: 0 }));

    await expect(
      queryCollectionWithMeta(
        async () => payload as never,
        new URLSearchParams({ collection: "posts", depth: "-1" }),
        { allowedCollections: ["posts"], maxDepth: 2 },
      ),
    ).rejects.toMatchObject({ status: 400 } satisfies Partial<DatasourceQueryError>);
  });

  it("rejects disallowed sort fields and invalid operators", async () => {
    const payload = makeMockPayload();

    await expect(
      queryCollectionWithMeta(
        async () => payload as never,
        new URLSearchParams({ collection: "posts", sort: "-secretField" }),
        { allowedCollections: ["posts"], allowedSortFields: ["publishedAt"] },
      ),
    ).rejects.toMatchObject({ status: 403 } satisfies Partial<DatasourceQueryError>);

    await expect(
      queryCollectionWithMeta(
        async () => payload as never,
        new URLSearchParams({
          collection: "posts",
          filterField: "slug",
          filterOperator: "like",
          filterValue: "x",
        }),
        { allowedCollections: ["posts"], allowedFilterFields: ["slug"] },
      ),
    ).rejects.toMatchObject({ status: 400 } satisfies Partial<DatasourceQueryError>);
  });

  it("createCollectionResolver applies not_equals and sort directly", async () => {
    const payload = makeMockPayload();
    const resolve = createCollectionResolver(async () => payload as never, {
      allowedCollections: ["posts"],
      allowedFilterFields: ["slug"],
      allowedSortFields: ["publishedAt"],
    });

    const out = await resolve(
      {
        props: {
          collection: "posts",
          filterField: "slug",
          filterOperator: "not_equals",
          filterValue: "current",
          sort: "-publishedAt",
          limit: 3,
        },
      } as never,
      { changed: { collection: true }, metadata: {} } as never,
    );

    expect((out as { props: { items: unknown[] } }).props.items).toHaveLength(1);
    expect(payload.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: { not_equals: "current" } },
        sort: "-publishedAt",
        limit: 3,
      }),
    );
  });
});
