---
"create-olgax-site": patch
---

Pin all Payload packages in the scaffolded project's `package.json` to the exact tested version (3.87.1). Scaffolded projects have no lockfile, so the previous caret ranges let `payload` resolve to a newer release than the exact-pinned `@payloadcms/ui`, and Payload refused to start (`Mismatching "payload" dependency versions`).
