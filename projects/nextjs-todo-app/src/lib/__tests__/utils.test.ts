import { describe, expect, it } from "vitest"
import { priorityBadgeClass, priorityRank, toIsoDate } from "@/lib/utils"

describe("lib/utils", () => {
  it("toIsoDate returns YYYY-MM-DD in UTC", () => {
    const d = new Date(Date.UTC(2026, 1, 10, 15, 30, 0))
    expect(toIsoDate(d)).toBe("2026-02-10")
  })

  it("priorityRank orders high > medium > low", () => {
    expect(priorityRank("high")).toBe(3)
    expect(priorityRank("medium")).toBe(2)
    expect(priorityRank("low")).toBe(1)
  })

  it("priorityBadgeClass maps to color-coded styles", () => {
    expect(priorityBadgeClass("high")).toContain("red")
    expect(priorityBadgeClass("medium")).toContain("amber")
    expect(priorityBadgeClass("low")).toContain("emerald")
  })
})
