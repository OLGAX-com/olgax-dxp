---
"@olgax.com/datasource": patch
"@olgax.com/payload-preset": patch
"create-olgax-site": patch
---

Enforce Payload access control and collection allowlists in `@olgax.com/datasource` and `/api/related-pages`, add SSRF URL/IP validation to webhook configuration and dispatch, and require a non-empty `PAYLOAD_SECRET` at production runtime.
