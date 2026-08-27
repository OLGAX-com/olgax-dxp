import type { CSSProperties } from "react";

export type ColorOverrideProps = {
  backgroundColor?: string;
  primaryColor?: string;
  textColor?: string;
};

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

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
              Reset to default
            </button>
          )}
        </div>
      </label>
    ),
  };
}

/**
 * Optional per-instance color override fields any component can opt into -
 * spread the result into a component's Puck `fields` config alongside its
 * own fields. Pairs with `colorOverrideStyle()` to actually apply them.
 */
export function colorOverrideFields() {
  return {
    backgroundColor: colorField("Background color (this block only)", "#ffffff"),
    primaryColor: colorField("Accent color (this block only)", "#18181b"),
    textColor: colorField("Text color (this block only)", "#18181b"),
  };
}

/**
 * Turns optional color override props into inline CSS custom property
 * overrides scoped to whatever element this style is applied to (and its
 * descendants) - the same --olgax-color-* tokens packages/components'
 * tokens.css defines, so no component CSS has to change to support this.
 * Each override also sets the matching "-muted" variable to the same value
 * (background/text only) so components that use the muted variant for
 * secondary surfaces/text stay visually consistent with a single color pick,
 * rather than needing a 4th/5th field per instance.
 * Re-validated as strict hex here since these props live in Payload's
 * free-form `data` JSON with no schema to enforce it.
 */
export function colorOverrideStyle(props: ColorOverrideProps): CSSProperties {
  const style: Record<string, string> = {};
  if (props.backgroundColor && HEX_COLOR.test(props.backgroundColor)) {
    style["--olgax-color-bg"] = props.backgroundColor;
    style["--olgax-color-bg-muted"] = props.backgroundColor;
  }
  if (props.primaryColor && HEX_COLOR.test(props.primaryColor)) {
    style["--olgax-color-primary"] = props.primaryColor;
  }
  if (props.textColor && HEX_COLOR.test(props.textColor)) {
    style["--olgax-color-text"] = props.textColor;
    style["--olgax-color-text-muted"] = props.textColor;
  }
  return style as CSSProperties;
}
