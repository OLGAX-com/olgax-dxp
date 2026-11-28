# @olgax.com/sdk

## 0.3.0

### Minor Changes

- 974aec3: - `@olgax.com/sdk` & `@olgax.com/payload-preset`: Add `primaryContrastColor`, `mutedBackgroundColor`, `borderColor`, `fontPreset`, and `colorScheme` lock to `SiteSettings` and SDK color overrides.
  - `@olgax.com/components`: Upgrade `Hero` with optional `eyebrow`, `backgroundImage`, `overlayOpacity`, and `secondaryCta`, and upgrade `Gallery` with `columns`, `aspectRatio`, and per-image `caption`.

## 0.2.0

### Minor Changes

- 939b5de: Add `safeHref()`, `safeMediaSrc()`, and a visual `mediaField()` Puck media picker to `@olgax.com/sdk`; sanitize link/image URLs and add a `Gallery` empty state in `@olgax.com/components`; link Puck's editor preview action to `?preview=true` and update `@olgax.com/*` minimum semver ranges in `create-olgax-site`.

## 0.1.2

### Patch Changes

- ecf8364: Link the new documentation site (https://dxp.olgax.com) and the official Discord (https://discord.gg/EAXcCXgUz2) from READMEs, package metadata and the CLI's next-steps output, and refresh the generated project's README.

## 0.1.1

### Patch Changes

- 8ff0cbe: Add npm search metadata (description, keywords, repository) to package.json so it's indexed on npmjs.com.
