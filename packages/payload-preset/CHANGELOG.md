# @olgax.com/payload-preset

## 0.1.6

### Patch Changes

- 021fb81: Sync Puck page title edits to Payload, add authenticated draft preview (`?preview=true`), fix `RelatedPages` locale links and SDK theming/visibility support, validate/sanitize page slugs, fix mobile `NewPageForm` input sizing, and add Puck save/publish status feedback.

## 0.1.5

### Patch Changes

- aa9b1ec: Enforce Payload access control and collection allowlists in `@olgax.com/datasource` and `/api/related-pages`, add SSRF URL/IP validation to webhook configuration and dispatch, and require a non-empty `PAYLOAD_SECRET` at production runtime.

## 0.1.4

### Patch Changes

- ecf8364: Link the new documentation site (https://dxp.olgax.com) and the official Discord (https://discord.gg/EAXcCXgUz2) from READMEs, package metadata and the CLI's next-steps output, and refresh the generated project's README.

## 0.1.3

### Patch Changes

- 0fd3fa8: Fix the actual remaining type error from the previous patch: `req.locale` in the `Pages` `afterChange` webhook hook is now normalized with `?? undefined` (Payload's request type can report `locale` as `null`, which isn't assignable to `WebhookPayload`'s optional `string` field).

## 0.1.2

### Patch Changes

- 8a7f1ec: Fix a TypeScript build error in consuming projects on newer Payload versions: `doc.slug`/`doc.title` in the `Pages` webhook hooks are now cast to `string` (both fields are `required: true`), since the generic `CollectionConfig` hook's `doc` type can otherwise include `null`/`undefined` depending on the installed `payload` version.

## 0.1.1

### Patch Changes

- 8ff0cbe: Add npm search metadata (description, keywords, repository) to package.json so it's indexed on npmjs.com.
