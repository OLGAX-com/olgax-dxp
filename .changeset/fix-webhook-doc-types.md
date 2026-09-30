---
"@olgax.com/payload-preset": patch
---

Fix a TypeScript build error in consuming projects on newer Payload versions: `doc.slug`/`doc.title` in the `Pages` webhook hooks are now cast to `string` (both fields are `required: true`), since the generic `CollectionConfig` hook's `doc` type can otherwise include `null`/`undefined` depending on the installed `payload` version.
