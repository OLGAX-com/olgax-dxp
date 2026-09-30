# @olgax.com/payload-preset

## 0.1.3

### Patch Changes

- 0fd3fa8: Fix the actual remaining type error from the previous patch: `req.locale` in the `Pages` `afterChange` webhook hook is now normalized with `?? undefined` (Payload's request type can report `locale` as `null`, which isn't assignable to `WebhookPayload`'s optional `string` field).

## 0.1.2

### Patch Changes

- 8a7f1ec: Fix a TypeScript build error in consuming projects on newer Payload versions: `doc.slug`/`doc.title` in the `Pages` webhook hooks are now cast to `string` (both fields are `required: true`), since the generic `CollectionConfig` hook's `doc` type can otherwise include `null`/`undefined` depending on the installed `payload` version.

## 0.1.1

### Patch Changes

- 8ff0cbe: Add npm search metadata (description, keywords, repository) to package.json so it's indexed on npmjs.com.
