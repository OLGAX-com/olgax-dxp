# create-olgax-site

## 0.1.2

### Patch Changes

- 22d97bc: Pin all Payload packages in the scaffolded project's `package.json` to the exact tested version (3.87.1). Scaffolded projects have no lockfile, so the previous caret ranges let `payload` resolve to a newer release than the exact-pinned `@payloadcms/ui`, and Payload refused to start (`Mismatching "payload" dependency versions`).

## 0.1.1

### Patch Changes

- 8ff0cbe: Add npm search metadata (description, keywords, repository) to package.json so it's indexed on npmjs.com.
