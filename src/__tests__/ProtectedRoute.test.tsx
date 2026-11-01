import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import * as AccountContextModule from "../context/AccountContext";

vi.mock("../components/TopBar", () => ({ default: () => <div data-testid="top-bar">TopBar</div> }));
vi.mock("../components/layout/Navbar", () => ({ default: () => <div data-testid="navbar">Navbar</div> }));
vi.mock("../components/layout/Footer", () => ({ default: () => <div data-testid="footer">Footer</div> }));

describe("ProtectedRoute component", () => {
  it("renders loading state while session is being verified", () => {
    vi.spyOn(AccountContextModule, "useAccount").mockReturnValue({
      isLoggedIn: false,
      loadingSession: true,
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="secret-content">Secret Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText("Verifying session…")).toBeInTheDocument();
    expect(screen.queryByTestId("secret-content")).not.toBeInTheDocument();
  });

  it("renders AuthGate prompt when user is not logged in", () => {
    vi.spyOn(AccountContextModule, "useAccount").mockReturnValue({
      isLoggedIn: false,
      loadingSession: false,
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute intent="orders">
          <div data-testid="secret-content">Secret Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByTestId("secret-content")).not.toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  it("renders protected children when user is authenticated", () => {
    vi.spyOn(AccountContextModule, "useAccount").mockReturnValue({
      isLoggedIn: true,
      loadingSession: false,
    } as any);

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="secret-content">Secret Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId("secret-content")).toBeInTheDocument();
    expect(screen.queryByText("Verifying session…")).not.toBeInTheDocument();
  });
});
