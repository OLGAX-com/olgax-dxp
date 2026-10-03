---
"create-olgax-site": patch
---

Custom components no longer need a reload or a restart. Blocks in `components/blocks/` are now plain exported Puck configs listed in `components/blocks/index.ts`, and the open editor updates live when you edit a block's fields or add a new block with `pnpm new:component`. The generated README documents the flow, including renaming and new-field pitfalls.
