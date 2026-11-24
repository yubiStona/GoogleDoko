import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../store";
import LandingPage from "../pages/LandingPage";
import { CartProvider } from "../context/CartContext";

function renderLanding() {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <CartProvider>
          <LandingPage />
        </CartProvider>
      </MemoryRouter>
    </Provider>
  );
}

describe("LandingPage Component Tests", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          clone() {
            return this;
          },
          headers: new Headers({ "content-type": "application/json" }),
          json: () => Promise.resolve({ success: true, data: null }),
          text: () => Promise.resolve(JSON.stringify({ success: true, data: null })),
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the main title, taglines, and navigation elements", () => {
    renderLanding();

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Welcome to/i);
    expect(screen.getAllByText(/Good food\. Better choices\. Local love\./i).length).toBeGreaterThan(0);

    // Check navbar links
    expect(screen.getByRole("link", { name: "Explore" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Our story" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact" })).toBeInTheDocument();
  });

  it("renders both modern cards matching the latest design", () => {
    renderLanding();

    // Food Card (Second Screenshot)
    expect(screen.getByText("Food with a place of origin.")).toBeInTheDocument();
    expect(
      screen.getByText("Shop farm fresh produce and traditional favourites from local growers.")
    ).toBeInTheDocument();
    expect(screen.getByText("Explore food")).toBeInTheDocument();

    // Lifestyle Card (Second Screenshot)
    expect(screen.getByText("Bring local craft into your home.")).toBeInTheDocument();
    expect(
      screen.getByText("Find thoughtful home, fashion, and handmade goods from Nepalese makers.")
    ).toBeInTheDocument();
    expect(screen.getByText("Explore lifestyle")).toBeInTheDocument();
  });
});
