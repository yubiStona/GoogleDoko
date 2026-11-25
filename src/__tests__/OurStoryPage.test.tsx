import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "../store";
import { CartProvider } from "../context/CartContext";
import { WishlistProvider } from "../context/WishlistContext";
import { CheckoutProvider } from "../context/CheckoutContext";
import { AccountProvider } from "../context/AccountContext";
import { AuthFlowProvider } from "../context/AuthFlowContext";
import LandingPage from "../pages/LandingPage";
import OurStory from "../pages/OurStory";
import Support from "../pages/Support";

function renderWithProviders(ui: React.ReactElement, initialRoute = "/") {
  return render(
    <Provider store={store}>
      <AccountProvider>
        <AuthFlowProvider>
          <CartProvider>
            <WishlistProvider>
              <CheckoutProvider>
                <MemoryRouter initialEntries={[initialRoute]}>
                  {ui}
                </MemoryRouter>
              </CheckoutProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthFlowProvider>
      </AccountProvider>
    </Provider>
  );
}

describe("Our Story & Contact Landing Page Navigation Tests", () => {
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
          json: () => Promise.resolve({ success: true, data: [] }),
          text: () => Promise.resolve(JSON.stringify({ success: true, data: [] })),
        })
      )
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("LandingPage header has Explore, Our story, and Contact links, and no search or cart icons", () => {
    renderWithProviders(<LandingPage />, "/");

    const exploreLink = screen.getByRole("link", { name: /^explore$/i });
    const ourStoryLink = screen.getByRole("link", { name: /^our story$/i });
    const contactLink = screen.getByRole("link", { name: /^contact$/i });

    expect(exploreLink).toBeInTheDocument();
    expect(ourStoryLink).toBeInTheDocument();
    expect(contactLink).toBeInTheDocument();

    expect(ourStoryLink).toHaveAttribute("href", "/our-story");
    expect(contactLink).toHaveAttribute("href", "/support");

    // Search and cart buttons should not exist in the landing page header
    expect(screen.queryByRole("link", { name: /search/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /cart/i })).not.toBeInTheDocument();
  });

  it("OurStory page renders heading, the Doko cultural story, and key pillars within landing page theme", () => {
    renderWithProviders(<OurStory />, "/our-story");

    // Hero title
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Rooted in Nepal’s Soil/i);

    // Cultural story section
    expect(screen.getByRole("heading", { name: /Why GoogleDoko\?/i })).toBeInTheDocument();
    expect(screen.getByText(/The Symbol of the Doko/i)).toBeInTheDocument();

    // Two worlds: Food and Lifestyle
    expect(screen.getByRole("heading", { name: /Food with a Place of Origin/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Bring Local Craft into Your Home/i })).toBeInTheDocument();

    // Our Commitments / Values
    expect(screen.getByRole("heading", { name: /What We Stand For/i })).toBeInTheDocument();
    expect(screen.getByText(/Authentic Traceability/i)).toBeInTheDocument();

    // Call to action
    expect(screen.getByText(/Fill Your Doko with Nepal’s Best/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Start Shopping Food/i })).toHaveAttribute("href", "/food");
  });

  it("OurStory page is separate from the food storefront: contains standalone brand navigation, and only 'Explore food' links to /food", () => {
    renderWithProviders(<OurStory />, "/our-story");

    // Header has brand logo pointing to landing page "/"
    const brandLinks = screen.getAllByRole("link", { name: /GoogleDoko/i });
    expect(brandLinks.length).toBeGreaterThan(0);
    expect(brandLinks[0]).toHaveAttribute("href", "/");

    // "Our story" link points to "/our-story" (NOT "/food")
    const ourStoryNavLinks = screen.getAllByRole("link", { name: /^our story$/i });
    expect(ourStoryNavLinks.length).toBeGreaterThan(0);
    ourStoryNavLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/our-story");
      expect(link).not.toHaveAttribute("href", "/food");
    });

    // "Explore food" buttons specifically lead to "/food"
    const exploreFoodBtns = screen.getAllByRole("link", { name: /^explore food/i });
    expect(exploreFoodBtns.length).toBeGreaterThan(0);
    exploreFoodBtns.forEach((btn) => {
      expect(btn).toHaveAttribute("href", "/food");
    });
  });

  it("clicking Our story, Contact, and Explore updates the active underline within the landing page nav", () => {
    renderWithProviders(<LandingPage />, "/");

    const exploreLink = screen.getByRole("link", { name: /^explore$/i });
    const ourStoryLink = screen.getByRole("link", { name: /^our story$/i });
    const contactLink = screen.getByRole("link", { name: /^contact$/i });

    // Initially on "/", Explore is active with the underline
    expect(exploreLink).toHaveClass("active");
    expect(ourStoryLink).not.toHaveClass("active");
    expect(contactLink).not.toHaveClass("active");

    // Click Our story -> becomes active (underlined) without leaving landing page
    fireEvent.click(ourStoryLink);
    expect(ourStoryLink).toHaveClass("active");
    expect(exploreLink).not.toHaveClass("active");
    expect(contactLink).not.toHaveClass("active");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/Rooted in Nepal’s Soil/i);

    // Click Contact -> becomes active (underlined) without leaving landing page
    fireEvent.click(contactLink);
    expect(contactLink).toHaveClass("active");
    expect(ourStoryLink).not.toHaveClass("active");
    expect(exploreLink).not.toHaveClass("active");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/We’re Here to Help/i);
    expect(screen.getByText("+977-1-4567890")).toBeInTheDocument();
    expect(screen.getByText("support@googledoko.com")).toBeInTheDocument();

    // Click Explore -> switches back to active (underlined)
    fireEvent.click(exploreLink);
    expect(exploreLink).toHaveClass("active");
    expect(ourStoryLink).not.toHaveClass("active");
    expect(contactLink).not.toHaveClass("active");
  });

  it("Support component directly renders Contact tab in landing page shell with active underline", () => {
    renderWithProviders(<Support />, "/support");

    const contactLink = screen.getByRole("link", { name: /^contact$/i });
    expect(contactLink).toHaveClass("active");
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/We’re Here to Help/i);
  });
});
