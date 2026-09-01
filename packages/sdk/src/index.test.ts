import { describe, expect, it, vi } from "vitest";
import { registerComponent, getRegisteredComponents } from "./index";

describe("registerComponent", () => {
  it("throws when name is missing", () => {
    // @ts-expect-error deliberately omitting the required name
    expect(() => registerComponent("", { render: () => null })).toThrow(
      "registerComponent: `name` is required",
    );
  });

  it("registers a component so it's returned by getRegisteredComponents", () => {
    const config = { render: () => null };
    registerComponent("TestOnlyComponent", config);
    expect(getRegisteredComponents().TestOnlyComponent).toBe(config);
  });

  it("warns (does not throw) on a duplicate name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    registerComponent("TestOnlyDuplicate", { render: () => null });
    expect(() =>
      registerComponent("TestOnlyDuplicate", { render: () => null }),
    ).not.toThrow();
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});
