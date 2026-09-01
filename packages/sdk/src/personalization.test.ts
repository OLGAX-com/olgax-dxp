import { describe, expect, it } from "vitest";
import { isVisible } from "./personalization";

describe("isVisible", () => {
  it("always shows when no rule is set", () => {
    expect(isVisible(undefined, "new")).toBe(true);
    expect(isVisible(undefined, "returning")).toBe(true);
  });

  it("always shows for 'everyone'", () => {
    expect(isVisible("everyone", "new")).toBe(true);
    expect(isVisible("everyone", "returning")).toBe(true);
  });

  it("always shows when visitor state is unknown (e.g. the Puck editor canvas)", () => {
    expect(isVisible("new-visitors", undefined)).toBe(true);
    expect(isVisible("returning-visitors", undefined)).toBe(true);
  });

  it("only shows to new visitors for 'new-visitors'", () => {
    expect(isVisible("new-visitors", "new")).toBe(true);
    expect(isVisible("new-visitors", "returning")).toBe(false);
  });

  it("only shows to returning visitors for 'returning-visitors'", () => {
    expect(isVisible("returning-visitors", "returning")).toBe(true);
    expect(isVisible("returning-visitors", "new")).toBe(false);
  });
});
