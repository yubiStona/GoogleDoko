/**
 * Smart Form Error Navigation Utility for GoogleDoko
 * Provides automatic scroll-to-error, sticky navbar offset handling,
 * keyboard field focus, accessibility support, and backend error mapping.
 */

export interface ErrorScrollOptions {
  navbarOffset?: number;
  highlightClass?: string;
  durationMs?: number;
  focusField?: boolean;
  behavior?: ScrollBehavior;
}

const DEFAULT_NAVBAR_OFFSET = 95; // Accounts for sticky header + topbar
const HIGHLIGHT_DURATION = 2400; // Duration to keep visual pulse active

/**
 * Checks whether user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Smoothly scrolls to an element keeping it below the sticky navbar,
 * moves keyboard focus to the input or container, and adds a temporary pulse highlight.
 */
export function scrollToElement(
  element: HTMLElement | null,
  options: ErrorScrollOptions = {}
): boolean {
  if (!element || typeof window === "undefined") return false;

  const offset = options.navbarOffset ?? DEFAULT_NAVBAR_OFFSET;
  const rect = element.getBoundingClientRect();
  const absoluteElementTop = rect.top + window.pageYOffset;
  const targetScrollTop = Math.max(0, absoluteElementTop - offset);

  const behavior: ScrollBehavior = prefersReducedMotion()
    ? "auto"
    : (options.behavior || "smooth");

  window.scrollTo({
    top: targetScrollTop,
    behavior,
  });

  // Focus the interactive control if enabled
  if (options.focusField !== false) {
    const focusable =
      element.matches("input, select, textarea, button, [tabindex]:not([tabindex='-1'])")
        ? element
        : element.querySelector<HTMLElement>(
            "input:not([type='hidden']), select, textarea, button, [tabindex]:not([tabindex='-1'])"
          );

    if (focusable) {
      setTimeout(() => {
        try {
          focusable.focus({ preventScroll: true });
        } catch {
          // Ignore focus failures
        }
      }, 150);
    } else {
      // If the container itself isn't focusable, give it temporary tabIndex so screen readers register it
      if (!element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "-1");
        element.focus({ preventScroll: true });
      }
    }
  }

  // Apply subtle visual pulse
  const highlightClass = options.highlightClass || "smart-error-pulse";
  element.classList.add(highlightClass);
  setTimeout(() => {
    element.classList.remove(highlightClass);
  }, HIGHLIGHT_DURATION);

  return true;
}

/**
 * Locates the first invalid field or error container within the target container
 * and scrolls to it.
 */
export function scrollToFirstError(
  container: HTMLElement | Document = document,
  options: ErrorScrollOptions = {}
): boolean {
  if (!container || typeof window === "undefined") return false;

  // Priority order for discovering the first invalid field
  const selectors = [
    // 1. Standards-based invalid controls
    "[aria-invalid='true']",
    ":invalid:not(form)",
    // 2. Class-based error states
    ".has-error input",
    ".has-error select",
    ".has-error textarea",
    ".field-error",
    ".input-error",
    ".is-invalid",
    // 3. Custom checkout error containers
    "[data-error-target]",
    ".co-address-grid.has-error",
    ".co-pay-list.has-error",
    ".co-summary-item.stock-error",
    ".co-review-item.stock-error",
    // 4. Fallback inline error borders
    "input[style*='ef4444']",
    "select[style*='ef4444']",
    "textarea[style*='ef4444']",
    "span[style*='ef4444']",
    "[role='alert']:not(:empty)",
  ];

  for (const selector of selectors) {
    const found = container.querySelector<HTMLElement>(selector);
    if (found && found.offsetParent !== null) {
      // Find parent field container if element is just text
      const targetElement =
        found.tagName === "SPAN" || found.getAttribute("role") === "alert"
          ? (found.closest<HTMLElement>(".co-form-grid label, .vd-field, .auth-field, label") || found)
          : found;

      return scrollToElement(targetElement, options);
    }
  }

  return false;
}

/**
 * Target a specific field or section by name or ID
 */
export function scrollToField(
  fieldNameOrId: string,
  options: ErrorScrollOptions = {}
): boolean {
  if (typeof document === "undefined") return false;

  const candidateSelectors = [
    `#${fieldNameOrId}`,
    `[name='${fieldNameOrId}']`,
    `[data-field='${fieldNameOrId}']`,
    `[data-field-name='${fieldNameOrId}']`,
    `[id$='-${fieldNameOrId}']`,
    `.field-${fieldNameOrId}`,
  ];

  for (const selector of candidateSelectors) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      const target = element.closest<HTMLElement>("label, .auth-field, .vd-field, .co-card") || element;
      return scrollToElement(target, options);
    }
  }

  return false;
}

/**
 * Creates an onError handler for react-hook-form handleSubmit
 * Usage: form.handleSubmit(onValid, getFormErrorScrollHandler())
 */
export function getFormErrorScrollHandler(
  customCallback?: (errors: Record<string, any>) => void
) {
  return (errors: Record<string, any>) => {
    customCallback?.(errors);

    // Give react-hook-form state a tick to render error classes/aria-invalid into DOM
    setTimeout(() => {
      scrollToFirstError();
    }, 50);
  };
}

/**
 * Parses backend API errors and returns the target field/section identifier
 * along with a user-friendly message.
 */
export function mapBackendErrorToField(errorMessage: string): {
  field?: string;
  targetSelector?: string;
  userMessage: string;
} {
  const msg = (errorMessage || "").toLowerCase();

  // 1. Stock / Quantity Errors
  if (msg.includes("stock") || msg.includes("quantity") || msg.includes("available")) {
    return {
      field: "cart-items",
      targetSelector: ".co-summary-items, .co-form-card, .cart-items",
      userMessage: errorMessage,
    };
  }

  // 2. Promo Code Errors
  if (msg.includes("promo") || msg.includes("coupon") || msg.includes("discount")) {
    return {
      field: "couponCode",
      targetSelector: ".promo-code-section, .promo-section",
      userMessage: errorMessage,
    };
  }

  // 3. Phone Number Errors
  if (msg.includes("phone") || msg.includes("mobile") || msg.includes("contact")) {
    return {
      field: "phone",
      targetSelector: "input[name='phone'], #phone, [data-field='phone']",
      userMessage: "Please enter a valid 10-digit mobile number.",
    };
  }

  // 4. Delivery Address / Location Errors
  if (msg.includes("address") || msg.includes("street") || msg.includes("district") || msg.includes("location")) {
    return {
      field: "deliveryAddress",
      targetSelector: ".co-address-grid, .co-form-card, input[name='street']",
      userMessage: errorMessage,
    };
  }

  // 5. Payment Method Errors
  if (msg.includes("payment") || msg.includes("wallet") || msg.includes("bank")) {
    return {
      field: "paymentMethod",
      targetSelector: ".co-pay-list",
      userMessage: "Please select a valid payment method to continue.",
    };
  }

  // 6. Name / Recipient
  if (msg.includes("name") || msg.includes("recipient")) {
    return {
      field: "fullName",
      targetSelector: "input[name='fullName'], #fullName",
      userMessage: "Please enter recipient's full name.",
    };
  }

  return {
    userMessage: errorMessage,
  };
}
