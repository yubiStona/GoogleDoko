import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import { CartProvider } from "../context/CartContext";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderLanding() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <CartProvider>
        <LandingPage />
      </CartProvider>
    </MemoryRouter>
  );
}

describe("LandingPage Component Tests", () => {
  it("renders the main title, taglines, and navigation elements", () => {
    renderLanding();

    expect(screen.getByText(/Discover · Shop · Enjoy/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome to Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Good Food. Better Choices. Local Love./i)).toBeInTheDocument();

    // Check navbar links
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("navigates to /food when clicking 'Explore Food'", () => {
    renderLanding();

    const exploreFoodBtn = screen.getByTestId("explore-food-btn");
    expect(exploreFoodBtn).toBeInTheDocument();

    fireEvent.click(exploreFoodBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/food");
  });

  it("shows 'Coming Soon' modal when clicking 'Explore Lifestyle'", () => {
    renderLanding();

    const exploreLifestyleBtn = screen.getByTestId("explore-lifestyle-btn");
    expect(exploreLifestyleBtn).toBeInTheDocument();

    fireEvent.click(exploreLifestyleBtn);

    // Modal should be visible with "Coming Soon"
    expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();

    // Close button dismisses modal
    const closeBtn = screen.getByRole("button", { name: /Close notification/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Coming Soon/i)).not.toBeInTheDocument();
  });
});
