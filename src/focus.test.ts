import { describe, expect, it } from "vitest";
import { nextFocusIndex } from "./focus";

describe("keyboard selection", () => {
  it("wraps around disabled choices in either direction", () => {
    const choices = [true, false, true, false];
    expect(nextFocusIndex("ArrowRight", 0, choices)).toBe(2);
    expect(nextFocusIndex("ArrowRight", 2, choices)).toBe(0);
    expect(nextFocusIndex("ArrowLeft", 0, choices)).toBe(2);
    expect(nextFocusIndex("ArrowLeft", 2, choices)).toBe(0);
  });

  it("uses the first or last enabled choice for Home and End", () => {
    expect(nextFocusIndex("Home", 2, [false, true, true, false])).toBe(1);
    expect(nextFocusIndex("End", 1, [false, true, true, false])).toBe(2);
  });

  it("keeps vertical scrolling available for horizontal tabs", () => {
    expect(nextFocusIndex("ArrowDown", 0, [true, true])).toBeNull();
    expect(nextFocusIndex("ArrowUp", 1, [true, true])).toBeNull();
    expect(nextFocusIndex("ArrowDown", 0, [true, true], true)).toBe(1);
    expect(nextFocusIndex("ArrowUp", 0, [true, true], true)).toBe(1);
    expect(nextFocusIndex("Tab", 0, [true, true], true)).toBeNull();
  });

  it("handles missing, disabled and solitary selections", () => {
    expect(nextFocusIndex("ArrowRight", -1, [false, true, false])).toBe(1);
    expect(nextFocusIndex("ArrowLeft", 0, [false, true, false])).toBe(1);
    expect(nextFocusIndex("ArrowRight", 1, [false, true, false])).toBe(1);
    expect(nextFocusIndex("Home", 0, [false, false])).toBeNull();
    expect(nextFocusIndex("ArrowRight", 0, [])).toBeNull();
  });
});
