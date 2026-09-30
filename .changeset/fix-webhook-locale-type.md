---
"@olgax.com/payload-preset": patch
---

Fix the actual remaining type error from the previous patch: `req.locale` in the `Pages` `afterChange` webhook hook is now normalized with `?? undefined` (Payload's request type can report `locale` as `null`, which isn't assignable to `WebhookPayload`'s optional `string` field).
