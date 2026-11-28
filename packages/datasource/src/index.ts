import type { ComponentConfig, DefaultComponentProps } from "@puckeditor/core";
import type { Payload, PayloadRequest, Where } from "payload";

export type FilterOperator = "equals" | "not_equals" | "contains";

const ALLOWED_OPERATORS = new Set<FilterOperator>(["equals", "not_equals", "contains"]);

export type CollectionQueryProps = {
  collection: string;
  filterField?: string;
  filterOperator?: FilterOperator;
  filterValue?: string;
  sort?: string;
  limit?: number;
  page?: number;
  depth?: number;
  items?: unknown[];
};

export type QueryCollectionOptions = {
  /** Explicit allowlist of collection slugs that may be queried. */
  allowedCollections?: readonly string[];
  /** Optional explicit allowlist of field names allowed in `filterField`. */
  allowedFilterFields?: readonly string[];
  /** Optional explicit allowlist of field names allowed in `sort` (with or without leading `-`). */
  allowedSortFields?: readonly string[];
  /** Optional authenticated user; defaults to anonymous access (`null`). */
  user?: PayloadRequest["user"] | null;
  /** Maximum number of items returned per query (default: 50). */
  maxLimit?: number;
  /** Maximum relationship population depth allowed (default: 2). */
  maxDepth?: number;
  /** Optional Payload locale code forwarded to `payload.find()`. */
  locale?: string;
};

export type PaginatedCollectionResult<T = unknown> = {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export class DatasourceQueryError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "DatasourceQueryError";
    this.status = status;
  }
}

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const FIELD_PATTERN = /^[a-zA-Z0-9_.]+$/;
const SORT_PATTERN = /^-?[a-zA-Z0-9_.]+$/;

/**
 * Puck field definitions for the query props a component author fills in - plug these
 * into a component's `fields`.
 */
export const collectionQueryFields = {
  collection: { type: "text" as const },
  filterField: { type: "text" as const },
  filterOperator: {
    type: "select" as const,
    options: [
      { label: "Equals", value: "equals" },
      { label: "Not equals", value: "not_equals" },
      { label: "Contains", value: "contains" },
    ],
  },
  filterValue: { type: "text" as const },
  sort: { type: "text" as const },
  limit: { type: "number" as const },
  page: { type: "number" as const },
  depth: { type: "number" as const },
};

type ResolveDataFn<Props extends DefaultComponentProps> = NonNullable<
  ComponentConfig<{ props: Props }>["resolveData"]
>;

function shouldResolve(props: CollectionQueryProps, changed: Partial<Record<string, boolean>>) {
  if (!props.collection) return false;
  return Boolean(
    changed.collection ||
      changed.filterField ||
      changed.filterOperator ||
      changed.filterValue ||
      changed.sort ||
      changed.limit ||
      changed.page ||
      changed.depth,
  );
}

function normalizePositiveInt(raw: unknown, fallback: number, max: number): number {
  const safeMax = Number.isFinite(max) && max >= 1 ? Math.floor(max) : fallback;
  const parsed = Number(raw ?? fallback);
  if (!Number.isFinite(parsed) || parsed <= 0) return Math.min(fallback, safeMax);
  return Math.max(1, Math.min(Math.floor(parsed), safeMax));
}

function normalizeDepth(raw: unknown, maxDepth: number): number {
  const safeMax = Number.isFinite(maxDepth) && maxDepth >= 0 ? Math.floor(maxDepth) : 2;
  if (raw === undefined || raw === null || raw === "") {
    return Math.min(2, safeMax);
  }
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new DatasourceQueryError("Invalid depth parameter.", 400);
  }
  return Math.min(Math.floor(parsed), safeMax);
}

function normalizeSort(raw: string | undefined | null, allowedSortFields?: readonly string[]): string | undefined {
  const trimmed = raw?.trim();
  if (!trimmed) return undefined;
  if (!SORT_PATTERN.test(trimmed)) {
    throw new DatasourceQueryError("Invalid sort parameter.", 400);
  }
  const fieldName = trimmed.startsWith("-") ? trimmed.slice(1) : trimmed;
  if (allowedSortFields && !allowedSortFields.includes(fieldName)) {
    throw new DatasourceQueryError(`Sort field "${fieldName}" is not permitted.`, 403);
  }
  return trimmed;
}

function validateQueryInputs(
  params: {
    collection?: string | null;
    filterField?: string | null;
    filterOperator?: string | null;
    filterValue?: string | null;
    sort?: string | null;
    limit?: unknown;
    page?: unknown;
    depth?: unknown;
  },
  options: QueryCollectionOptions,
) {
  const collection = params.collection?.trim();
  if (!collection) return null;

  if (!SLUG_PATTERN.test(collection)) {
    throw new DatasourceQueryError("Invalid collection parameter.", 400);
  }
  if (options.allowedCollections && !options.allowedCollections.includes(collection)) {
    throw new DatasourceQueryError(`Collection "${collection}" is not permitted.`, 403);
  }

  const filterField = params.filterField?.trim();
  const rawOperator = params.filterOperator?.trim() as FilterOperator | undefined;
  const filterOperator: FilterOperator = rawOperator || "equals";
  const filterValue = params.filterValue ?? undefined;

  if (rawOperator && !ALLOWED_OPERATORS.has(rawOperator)) {
    throw new DatasourceQueryError(`Filter operator "${rawOperator}" is not permitted.`, 400);
  }

  if (filterField) {
    if (!FIELD_PATTERN.test(filterField)) {
      throw new DatasourceQueryError("Invalid filterField parameter.", 400);
    }
    if (options.allowedFilterFields && !options.allowedFilterFields.includes(filterField)) {
      throw new DatasourceQueryError(`Filter field "${filterField}" is not permitted.`, 403);
    }
  }

  const sort = normalizeSort(params.sort, options.allowedSortFields);
  const limit = normalizePositiveInt(params.limit, 10, options.maxLimit ?? 50);
  const page = normalizePositiveInt(params.page, 1, 10000);
  const depth = normalizeDepth(params.depth, options.maxDepth ?? 2);

  const where: Where =
    filterField && filterValue !== undefined && filterValue !== ""
      ? { [filterField]: { [filterOperator]: filterValue } }
      : {};

  return { collection, where, sort, limit, page, depth };
}

/**
 * Builds a Puck `resolveData` function that re-runs a Payload Local API `find()` whenever
 * the query props change, and writes the results into a read-only `items` prop.
 *
 * **Server-only.** Only use inside a config that backs server-rendered `<Render>`, never one
 * shared directly with the client `<Puck>` editor.
 */
export function createCollectionResolver<Props extends CollectionQueryProps>(
  getPayload: () => Promise<Payload>,
  options: Pick<
    QueryCollectionOptions,
    "allowedCollections" | "allowedFilterFields" | "allowedSortFields" | "maxLimit" | "maxDepth" | "locale"
  > = {},
): ResolveDataFn<Props> {
  return (async (
    { props }: { props: Props },
    params: { changed: Partial<Record<string, boolean>>; metadata?: Record<string, unknown> },
  ) => {
    const { changed, metadata } = params;
    if (!shouldResolve(props, changed)) return { props };

    let validated;
    try {
      validated = validateQueryInputs(props, options);
    } catch {
      return { props: { ...props, items: [] }, readOnly: { items: true } };
    }
    if (!validated) return { props };

    const locale =
      options.locale ??
      (typeof metadata?.locale === "string" && metadata.locale ? metadata.locale : undefined);

    const payload = await getPayload();
    const result = await payload.find({
      collection: validated.collection as Parameters<Payload["find"]>[0]["collection"],
      where: validated.where,
      limit: validated.limit,
      page: validated.page,
      depth: validated.depth,
      ...(validated.sort ? { sort: validated.sort } : {}),
      ...(locale ? { locale: locale as Parameters<Payload["find"]>[0]["locale"] } : {}),
      overrideAccess: false,
    });

    return {
      props: { ...props, items: result.docs },
      readOnly: { items: true },
    };
  }) as ResolveDataFn<Props>;
}

/**
 * Builds a Puck `resolveData` function that fetches from a same-app Route Handler instead of
 * calling Payload directly - safe to use in a config shared between the client `<Puck>`
 * editor and server-rendered `<Render>`.
 */
export function createCollectionResolverFetch<Props extends CollectionQueryProps>(
  endpoint: string,
): ResolveDataFn<Props> {
  return (async ({ props }: { props: Props }, { changed }: { changed: Partial<Record<string, boolean>> }) => {
    if (!shouldResolve(props, changed)) return { props };

    const base =
      typeof window === "undefined" ? (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000") : "";
    const params = new URLSearchParams({
      collection: props.collection,
      limit: String(props.limit ?? 10),
    });
    if (props.filterField && props.filterValue) {
      params.set("filterField", props.filterField);
      params.set("filterValue", props.filterValue);
      if (props.filterOperator) params.set("filterOperator", props.filterOperator);
    }
    if (props.sort) params.set("sort", props.sort);
    if (props.page) params.set("page", String(props.page));
    if (props.depth !== undefined) params.set("depth", String(props.depth));

    const res = await fetch(`${base}${endpoint}?${params.toString()}`);
    const body = res.ok ? await res.json() : [];
    const items = Array.isArray(body) ? body : Array.isArray(body?.docs) ? body.docs : [];

    return {
      props: { ...props, items },
      readOnly: { items: true },
    };
  }) as ResolveDataFn<Props>;
}

/**
 * Executes a validated, access-controlled Payload `find()` from URLSearchParams and returns
 * docs along with pagination metadata.
 */
export async function queryCollectionWithMeta(
  getPayload: () => Promise<Payload>,
  searchParams: URLSearchParams,
  options: QueryCollectionOptions = {},
): Promise<PaginatedCollectionResult> {
  const validated = validateQueryInputs(
    {
      collection: searchParams.get("collection"),
      filterField: searchParams.get("filterField"),
      filterOperator: searchParams.get("filterOperator"),
      filterValue: searchParams.get("filterValue"),
      sort: searchParams.get("sort"),
      limit: searchParams.get("limit"),
      page: searchParams.get("page"),
      depth: searchParams.get("depth"),
    },
    options,
  );

  if (!validated) {
    return { docs: [], totalDocs: 0, totalPages: 1, page: 1, hasNextPage: false, hasPrevPage: false };
  }

  const payload = await getPayload();
  if (!(validated.collection in payload.collections)) {
    throw new DatasourceQueryError(`Unknown collection "${validated.collection}".`, 400);
  }

  const result = await payload.find({
    collection: validated.collection as Parameters<Payload["find"]>[0]["collection"],
    where: validated.where,
    limit: validated.limit,
    page: validated.page,
    depth: validated.depth,
    ...(validated.sort ? { sort: validated.sort } : {}),
    ...(options.locale ? { locale: options.locale as Parameters<Payload["find"]>[0]["locale"] } : {}),
    overrideAccess: false,
    user: options.user ?? undefined,
  });

  return {
    docs: result.docs,
    totalDocs: result.totalDocs,
    totalPages: result.totalPages,
    page: result.page ?? validated.page,
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
  };
}

/**
 * Backward-compatible array-only helper wrapping `queryCollectionWithMeta`.
 */
export async function queryCollectionFromSearchParams(
  getPayload: () => Promise<Payload>,
  searchParams: URLSearchParams,
  options: QueryCollectionOptions = {},
) {
  const result = await queryCollectionWithMeta(getPayload, searchParams, options);
  return result.docs;
}
