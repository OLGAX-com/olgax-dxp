// A single shared visibility rule any component can opt into via
// `visibilityFields()`/`isVisible()`, rather than each one inventing its own
// "who sees this" field. Deliberately one dimension - new vs returning
// visitor, the narrowest and most universal personalization signal - not a
// general segments/audiences/rules-engine system. See lib/personalization.ts
// (apps/demo) for how `VisitorState` is determined and passed to <Render>'s
// `metadata` prop.
export type VisibilityRule = "everyone" | "new-visitors" | "returning-visitors";
export type VisitorState = "new" | "returning";

export type VisibilityProps = {
  visibility?: VisibilityRule;
};

/**
 * Spread into a component's Puck `fields` config alongside its own fields.
 * Pairs with `isVisible()` to actually apply the rule in `render`.
 */
export function visibilityFields() {
  return {
    visibility: {
      type: "select" as const,
      label: "Show to",
      options: [
        { label: "Everyone", value: "everyone" },
        { label: "New visitors only", value: "new-visitors" },
        { label: "Returning visitors only", value: "returning-visitors" },
      ],
    },
  };
}

/**
 * Whether a component instance should render for the current visitor.
 * `visitor` comes from Puck's `metadata` prop (`props.puck.metadata.visitor`)
 * - undefined (e.g. in the editor canvas, which has no real visitor) always
 * renders, so authoring never shows a blank block.
 */
export function isVisible(rule: VisibilityRule | undefined, visitor: VisitorState | undefined): boolean {
  if (!rule || rule === "everyone" || !visitor) return true;
  return rule === "new-visitors" ? visitor === "new" : visitor === "returning";
}
