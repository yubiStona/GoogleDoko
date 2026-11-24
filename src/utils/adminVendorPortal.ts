const configuredPortalUrl = import.meta.env.VITE_ADMIN_VENDOR_URL?.trim();

export function adminVendorPortalUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  let baseUrl = configuredPortalUrl;

  if (!baseUrl) {
    const { protocol, hostname } = window.location;
    baseUrl = hostname === "localhost" || hostname === "127.0.0.1"
      ? `${protocol}//127.0.0.1:5174`
      : `${protocol}//admin.${hostname.replace(/^www\./, "")}`;
  }

  return `${baseUrl.replace(/\/+$/, "")}${normalizedPath}`;
}
