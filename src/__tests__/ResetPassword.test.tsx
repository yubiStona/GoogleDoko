import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "../pages/ResetPassword";
import { api } from "../api/client";

vi.mock("../components/auth/AuthShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("ResetPassword Page", () => {
  it("renders form fields with email and token parameters", () => {
    render(
      <MemoryRouter initialEntries={["/reset-password?email=test%40example.com&token=TOK12345"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    const emailInput = screen.getByPlaceholderText("Enter your registered email") as HTMLInputElement;
    const tokenInput = screen.getByPlaceholderText("Enter 8-character verification token") as HTMLInputElement;

    expect(emailInput.value).toBe("test@example.com");
    expect(tokenInput.value).toBe("TOK12345");
    expect(screen.getByText("Reset password")).toBeInTheDocument();
  });

  it("submits correct payload when filled and submitted", async () => {
    const resetSpy = vi.spyOn(api, "resetPassword").mockResolvedValueOnce({
      ok: true,
      message: "Password reset successful",
    });

    render(
      <MemoryRouter initialEntries={["/reset-password?email=alice%40example.com&token=CODE1234"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    const newPwInput = screen.getByPlaceholderText("8+ characters, letters and numbers");
    const confirmPwInput = screen.getByPlaceholderText("Re-enter password");
    const submitBtn = screen.getByRole("button", { name: "Reset password" });

    fireEvent.change(newPwInput, { target: { value: "SecurePass123!" } });
    fireEvent.change(confirmPwInput, { target: { value: "SecurePass123!" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(resetSpy).toHaveBeenCalledWith({
        email: "alice@example.com",
        token: "CODE1234",
        password: "SecurePass123!",
      });
    });

    expect(await screen.findByText("Password updated")).toBeInTheDocument();
  });
});
