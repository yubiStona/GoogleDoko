import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../store";
import App from "../App";
import ErrorBoundary from "../components/common/ErrorBoundary";

describe("Full App Root Render Test", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() =>
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
    ));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders without crashing", () => {
    const { container } = render(
      <ErrorBoundary>
        <Provider store={store}>
          <App />
        </Provider>
      </ErrorBoundary>
    );
    expect(container).toBeTruthy();
  });
});

