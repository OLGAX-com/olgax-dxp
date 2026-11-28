# @olgax.com/components

## 0.2.0

### Minor Changes

- 974aec3: - `@olgax.com/sdk` & `@olgax.com/payload-preset`: Add `primaryContrastColor`, `mutedBackgroundColor`, `borderColor`, `fontPreset`, and `colorScheme` lock to `SiteSettings` and SDK color overrides.
  - `@olgax.com/components`: Upgrade `Hero` with optional `eyebrow`, `backgroundImage`, `overlayOpacity`, and `secondaryCta`, and upgrade `Gallery` with `columns`, `aspectRatio`, and per-image `caption`.

### Patch Changes

- Updated dependencies [268b064]
- Updated dependencies [974aec3]
- Updated dependencies [22eea80]
  - @olgax.com/datasource@0.2.0
  - @olgax.com/sdk@0.3.0

## 0.1.6

### Patch Changes

- 939b5de: Add `safeHref()`, `safeMediaSrc()`, and a visual `mediaField()` Puck media picker to `@olgax.com/sdk`; sanitize link/image URLs and add a `Gallery` empty state in `@olgax.com/components`; link Puck's editor preview action to `?preview=true` and update `@olgax.com/*` minimum semver ranges in `create-olgax-site`.
- Updated dependencies [939b5de]
  - @olgax.com/sdk@0.2.0

## 0.1.5

### Patch Changes

- 021fb81: Sync Puck page title edits to Payload, add authenticated draft preview (`?preview=true`), fix `RelatedPages` locale links and SDK theming/visibility support, validate/sanitize page slugs, fix mobile `NewPageForm` input sizing, and add Puck save/publish status feedback.

## 0.1.4

### Patch Changes

- Updated dependencies [aa9b1ec]
  - @olgax.com/datasource@0.1.4

## 0.1.3

### Patch Changes

- ecf8364: Link the new documentation site (https://dxp.olgax.com) and the official Discord (https://discord.gg/EAXcCXgUz2) from READMEs, package metadata and the CLI's next-steps output, and refresh the generated project's README.
- Updated dependencies [ecf8364]
  - @olgax.com/sdk@0.1.2
  - @olgax.com/datasource@0.1.3

## 0.1.2

### Patch Changes

- fdccb7c: Remove references to an internal repo file from the published README and source comments.
- Updated dependencies [fdccb7c]
  - @olgax.com/datasource@0.1.2

## 0.1.1

### Patch Changes

- 8ff0cbe: Add npm search metadata (description, keywords, repository) to package.json so it's indexed on npmjs.com.
- Updated dependencies [8ff0cbe]
  - @olgax.com/sdk@0.1.1
  - @olgax.com/datasource@0.1.1
