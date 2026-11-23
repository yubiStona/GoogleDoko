import { useLocation } from "react-router-dom";
import AdminVendorPortalRedirect from "../components/AdminVendorPortalRedirect";
import Login from "./Login";

export default function CustomerLoginEntry() {
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role");
  const loginState = location.state as { role?: string; from?: string } | null;
  const requestedRole = loginState?.role;

  return role === "vendor" || requestedRole === "vendor" || loginState?.from?.startsWith("/vendor")
    ? <AdminVendorPortalRedirect />
    : <Login />;
}
