import { describe, it, expect } from "vitest";
import { pageTitle } from "../components/DocumentTitle";

describe("DocumentTitle pageTitle resolver tests", () => {
  it("returns 'Landing | GoogleDoko' for landing page ('/')", () => {
    expect(pageTitle("/", "")).toBe("Landing | GoogleDoko");
  });

  it("returns 'Home | GoogleDoko' for food store page ('/food' and '/home')", () => {
    expect(pageTitle("/food", "")).toBe("Home | GoogleDoko");
    expect(pageTitle("/home", "")).toBe("Home | GoogleDoko");
  });

  it("returns appropriate titles for other main pages", () => {
    expect(pageTitle("/categories", "")).toBe("Categories | Products | GoogleDoko");
    expect(pageTitle("/cart", "")).toBe("Cart | GoogleDoko");
    expect(pageTitle("/about", "")).toBe("About Us | GoogleDoko");
  });
});
