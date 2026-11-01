import { describe, it, expect, beforeEach, vi } from "vitest";
import { api, getToken, setToken, clearToken } from "../api/client";

describe("API Client & Auth Flow", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("stores and retrieves token correctly", () => {
    expect(getToken()).toBe("");
    setToken("test-jwt-token", true);
    expect(getToken()).toBe("test-jwt-token");
    clearToken();
    expect(getToken()).toBe("");
  });

  it("stores token in sessionStorage when remember is false", () => {
    setToken("session-token", false);
    expect(sessionStorage.getItem("googledoko-token")).toBe("session-token");
    expect(localStorage.getItem("googledoko-token")).toBeNull();
    expect(getToken()).toBe("session-token");
  });

  it("handles forgotPassword call properly", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          message: "Password reset link sent",
          data: { resetToken: "XYZ12345" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const res = await api.forgotPassword("user@example.com");
    expect(fetchSpy).toHaveBeenCalled();
    expect(res.resetToken).toBe("XYZ12345");
  });

  it("submits email, token, and newPassword on resetPassword", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          message: "Password reset successful",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const res = await api.resetPassword({
      email: "user@example.com",
      token: "XYZ12345",
      password: "NewPassword123!",
    });

    expect(fetchSpy).toHaveBeenCalled();
    const requestBody = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(requestBody.email).toBe("user@example.com");
    expect(requestBody.token).toBe("XYZ12345");
    expect(requestBody.password).toBe("NewPassword123!");
    expect(requestBody.newPassword).toBe("NewPassword123!");
    expect(res.ok).toBe(true);
  });

  it("normalizes and throws ApiError on 400 failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          message: "Invalid verification token.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    );

    await expect(
      api.resetPassword({
        email: "user@example.com",
        token: "WRONG",
        password: "Pass123456!",
      })
    ).rejects.toThrow("Invalid verification token.");
  });
});
