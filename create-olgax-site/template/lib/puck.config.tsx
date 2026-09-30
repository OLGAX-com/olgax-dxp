import type { Config } from "@puckeditor/core";
import type { ReactNode } from "react";
import { getRegisteredComponents } from "@olgax.com/sdk";
import { registerRelatedPages } from "@olgax.com/components";
import { createCollectionResolverFetch } from "@olgax.com/datasource";

// Importing @olgax.com/components registers its 8 default blocks as a side effect.
// RelatedPages uses the fetch-based resolver (not the direct-Payload one) because
// this config is shared with the client `<Puck>` editor - see apps/demo's
// app/(frontend)/api/related-pages/route.ts for the server-side query it calls.
registerRelatedPages(createCollectionResolverFetch("/api/related-pages"));

// An empty value means "no override - use the site-wide Site Settings default".
const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

// A native color picker per root field, saved/loaded like any other Puck
// field via the standard `custom` field type (documented, stable - unlike
// the `overrides` API). Root fields are per-page, so these only ever affect
// the page currently being edited.
function colorField(label: string, fallback: string) {
  return {
    type: "custom" as const,
    render: ({
      name,
      value,
      onChange,
    }: {
      name: string;
      value?: string;
      onChange: (value: string) => void;
    }) => (
      <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
        {label}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="color"
            name={name}
            value={value || fallback}
            onChange={(e) => onChange(e.currentTarget.value)}
          />
          {value && (
            <button type="button" onClick={() => onChange("")} style={{ fontSize: 12 }}>
              Reset to site default
            </button>
          )}
        </div>
      </label>
    ),
  };
}

// Root fields are per-page metadata/props stored in data.root.props - typed
// explicitly so root.render below gets real types instead of `any`.
type RootProps = {
  title?: string;
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
};

// Read the full registry now that every block (including RelatedPages) has
// registered - combines the default component library into the one Puck
// `Config` this app's editor and render routes share.
export const config: Config = {
  components: getRegisteredComponents(),
  root: {
    fields: {
      title: { type: "text" }, // redeclare to keep Puck's default title field
      primaryColor: colorField("Primary color (this page only)", "#18181b"),
      backgroundColor: colorField("Background color (this page only)", "#ffffff"),
      textColor: colorField("Text color (this page only)", "#18181b"),
    },
    render: (props: RootProps & { children?: ReactNode; [key: string]: unknown }) => {
      const { children, primaryColor, backgroundColor, textColor } = props;
      // Values live in the page's own free-form `data` JSON (no Payload field
      // schema to enforce this), so re-validate as strict hex before
      // interpolating into a <style> tag - malformed input is silently
      // dropped rather than risking broken/injected CSS.
      const overrides = [
        typeof primaryColor === "string" && HEX_COLOR.test(primaryColor)
          ? `--olgax-color-primary: ${primaryColor};`
          : null,
        typeof backgroundColor === "string" && HEX_COLOR.test(backgroundColor)
          ? `--olgax-color-bg: ${backgroundColor};`
          : null,
        typeof textColor === "string" && HEX_COLOR.test(textColor)
          ? `--olgax-color-text: ${textColor};`
          : null,
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <>
          {overrides && <style>{`:root { ${overrides} }`}</style>}
          {children}
        </>
      );
    },
  },
};
