import { describe, expect, it } from "vitest";
import { colorOverrideStyle } from "./theming";

describe("colorOverrideStyle", () => {
  it("returns an empty object when no colors are set", () => {
    expect(colorOverrideStyle({})).toEqual({});
  });

  it("maps each override to its CSS custom property, plus a matching -muted variable", () => {
    expect(
      colorOverrideStyle({
        backgroundColor: "#fff",
        primaryColor: "#18181b",
        textColor: "#000000",
      }),
    ).toEqual({
      "--olgax-color-bg": "#fff",
      "--olgax-color-bg-muted": "#fff",
      "--olgax-color-primary": "#18181b",
      "--olgax-color-text": "#000000",
      "--olgax-color-text-muted": "#000000",
    });
  });

  it("silently ignores a non-hex value instead of applying it", () => {
    // Guards the actual security boundary: these props live in Payload's
    // free-form `data` JSON with no schema enforcing they're really hex.
    expect(colorOverrideStyle({ primaryColor: "javascript:alert(1)" })).toEqual({});
  });
});
