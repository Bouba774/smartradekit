import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageSkeleton } from "@/components/ui/PageSkeleton";

const cases: Array<[string, string]> = [
  ["/dashboard", "dashboard"],
  ["/reports", "reports"],
  ["/calculator", "calculator"],
  ["/menu", "menu"],
  ["/history", "history"],
  ["/comparison", "comparison"],
  ["/psychology", "psychology"],
  ["/journal", "journal"],
  ["/add-trade", "add-trade"],
  ["/challenges", "challenges"],
  ["/ai-assistant", "ai-assistant"],
  ["/currency-conversion", "currency"],
  ["/settings", "settings"],
  ["/profile", "profile"],
  ["/aide", "help"],
  ["/sessions", "sessions"],
  ["/admin-roles", "admin-roles"],
  ["/audit", "audit"],
  ["/security", "security"],
  ["/privacy", "privacy"],
  ["/about", "about"],
  ["/unknown-route", "default"],
];

describe("PageSkeleton route → variant", () => {
  for (const [path, expected] of cases) {
    it(`renders "${expected}" skeleton for ${path}`, () => {
      const { getByTestId } = render(
        <MemoryRouter initialEntries={[path]}>
          <PageSkeleton />
        </MemoryRouter>
      );
      expect(getByTestId("page-skeleton")).toHaveAttribute(
        "data-variant",
        expected
      );
    });
  }

  it("respects explicit type prop over route", () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <PageSkeleton type="reports" />
      </MemoryRouter>
    );
    expect(getByTestId("page-skeleton")).toHaveAttribute(
      "data-variant",
      "reports"
    );
  });
});
