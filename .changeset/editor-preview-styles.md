---
"create-olgax-site": patch
---

The page editor preview now stays styled exactly like the live page. Puck copies the page's stylesheets into the preview once and never refreshes them, so during `pnpm dev` a hot-updated stylesheet (or the page re-inserting one) left custom blocks unstyled in the editor until a reload. New `components/EditorStyleSync.tsx` keeps the preview's copies in step. The README also gains a troubleshooting section.
