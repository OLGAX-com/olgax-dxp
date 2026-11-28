---
"@olgax.com/datasource": minor
"@olgax.com/payload-preset": minor
"create-olgax-site": patch
---

- `@olgax.com/datasource`: Add allowlisted `sort`, `page`, `depth`, and `filterOperator` (`equals`, `not_equals`, `contains`) options plus `queryCollectionWithMeta()` returning pagination metadata.
- `@olgax.com/payload-preset`: Export `createDraftWorkflowHooks()`, `dispatchWebhooks()`, `createPagesCollection({ reservedSlugs })`, and `createWebhooksCollection({ events })`.
- `apps/demo` & `create-olgax-site/template`: Exclude `/rss.xml`, `/feed.xml`, and `/atom.xml` in `proxy.ts`.
