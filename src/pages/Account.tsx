import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  Bell,
  Bike,
  ChevronRight,
  Clock3,
  Coins,
  Gift,
  Heart,
  Lock,
  LogOut,
  MapPin,
  Package,
  PackageCheck,
  ShoppingBag,
  Star,
  Truck,
  UserRound,
} from "lucide-react";

import TopBar from "../components/TopBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import AccountSettingsModals from "../components/AccountSettingsModals";

import { useAccount } from "../context/AccountContext";
import { useWishlist } from "../context/WishlistContext";
import { statusToQuery } from "../data/mockOrders";

function countByStatus(
  orders: { status: string }[],
  status: string,
) {
  return orders.filter((order) => order.status === status).length;
}

function Account() {
  const navigate = useNavigate();
  const { user, orders, points, logout } =
    useAccount();
  const { wishlist } = useWishlist();
  const [modal, setModal] = useState<
    "password" | "notifications" | "invite" | null
  >(null);

  const pending = countByStatus(orders, "Pending");
  const processing = countByStatus(orders, "Processing");
  const shipped = countByStatus(orders, "Shipped");
  const outForDelivery = countByStatus(orders, "Out for Delivery");
  const delivered = countByStatus(orders, "Delivered");

  return (
    <>
      <TopBar />
      <Navbar />

      <main className="profile-page">
        <div className="profile-page-inner">
          <h1>Your profile</h1>

          <section className="profile-shell">
            <div className="profile-hero">
              <div
                className="profile-avatar"
                aria-hidden="true"
                style={
                  user.photo
                    ? {
                        backgroundImage: `url(${user.photo})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {user.photo ? null : <UserRound size={48} strokeWidth={1.6} />}
              </div>

              <div>
                <h2>
                  {user.firstName} {user.lastName}
                </h2>
                <p>
                  <MapPin size={16} />
                  {user.location}
                </p>
                {user.verified ? (
                  <span className="profile-verified">
                    <BadgeCheck size={14} />
                    Verified Customer
                  </span>
                ) : null}
              </div>
            </div>

            <div className="profile-stats">
              <Link to="/account/orders" className="profile-stat">
                <ShoppingBag size={22} />
                <strong>{orders.length}</strong>
                <span>Total Orders</span>
                <em>View all &gt;</em>
              </Link>

              <Link to="/account/wishlist" className="profile-stat">
                <Heart size={22} />
                <strong>{wishlist.length}</strong>
                <span>Wishlist</span>
                <em>View all &gt;</em>
              </Link>

              <Link to="/account/addresses" className="profile-stat">
                <MapPin size={22} />
                <strong className="profile-stat-label">Address</strong>
                <em>Manage &gt;</em>
              </Link>

              <Link to="/account/rewards" className="profile-stat">
                <Coins size={22} />
                <strong>Rs {points}</strong>
                <span>Reward Points</span>
                <em>Redeem &gt;</em>
              </Link>
            </div>

            <div className="profile-columns">
              <div className="profile-column">
                <article className="profile-panel">
                  <div className="profile-panel-head">
                    <h3>My Orders</h3>
                    <Link to="/account/orders">
                      View All Orders
                      <ChevronRight size={16} />
                    </Link>
                  </div>

                  <div className="profile-order-status">
                    <Link to={`/account/orders?status=${statusToQuery("Pending")}`}>
                      <span className="profile-status-icon">
                        <Clock3 size={20} />
                        <b>{pending}</b>
                      </span>
                      <small>Pending</small>
                    </Link>
                    <Link to={`/account/orders?status=${statusToQuery("Processing")}`}>
                      <span className="profile-status-icon">
                        <Package size={20} />
                        <b>{processing}</b>
                      </span>
                      <small>Processing</small>
                    </Link>
                    <Link to={`/account/orders?status=${statusToQuery("Shipped")}`}>
                      <span className="profile-status-icon">
                        <Truck size={20} />
                        <b>{shipped}</b>
                      </span>
                      <small>Shipped</small>
                    </Link>
                    <Link to={`/account/orders?status=${statusToQuery("Out for Delivery")}`}>
                      <span className="profile-status-icon peach">
                        <Bike size={20} />
                        <b>{outForDelivery}</b>
                      </span>
                      <small>Out for Delivery</small>
                    </Link>
                    <Link to={`/account/orders?status=${statusToQuery("Delivered")}`}>
                      <span className="profile-status-icon">
                        <PackageCheck size={20} />
                        <b>{delivered}</b>
                      </span>
                      <small>Delivered</small>
                    </Link>
                  </div>
                </article>

                <article className="profile-panel profile-menu">
                  <Link to="/account/profile" className="profile-menu-row">
                    <span className="profile-menu-icon mint">
                      <UserRound size={18} />
                    </span>
                    <span>
                      <strong>Personal Information</strong>
                      <small>Manage your name,email and phone number</small>
                    </span>
                    <ChevronRight size={18} />
                  </Link>

                  <Link to="/account/addresses" className="profile-menu-row">
                    <span className="profile-menu-icon peach">
                      <MapPin size={18} />
                    </span>
                    <span>
                      <strong>Addresses</strong>
                      <small>Manage your delivery addresses</small>
                    </span>
                    <ChevronRight size={18} />
                  </Link>

                  <Link to="/account/reviews" className="profile-menu-row">
                    <span className="profile-menu-icon mint">
                      <Star size={18} />
                    </span>
                    <span>
                      <strong>My Reviews</strong>
                      <small>See you review and setting</small>
                    </span>
                    <ChevronRight size={18} />
                  </Link>

                  <button
                    type="button"
                    className="profile-menu-row"
                    onClick={() => {
                      logout();
                      navigate("/");
                    }}
                  >
                    <span className="profile-menu-icon mint">
                      <LogOut size={18} />
                    </span>
                    <span>
                      <strong>Log Out</strong>
                      <small>Log out of all sessions</small>
                    </span>
                    <ChevronRight size={18} />
                  </button>
                </article>
              </div>

              <div className="profile-column">
                <article className="profile-panel profile-settings">
                  <h3>Account Settings</h3>

                  <button
                    type="button"
                    className="profile-menu-row"
                    onClick={() => setModal("password")}
                  >
                    <span className="profile-menu-icon mint">
                      <Lock size={18} />
                    </span>
                    Change Password
                    <ChevronRight size={18} />
                  </button>
                  <button
                    type="button"
                    className="profile-menu-row"
                    onClick={() => setModal("notifications")}
                  >
                    <span className="profile-menu-icon peach">
                      <Bell size={18} />
                    </span>
                    Notification Settings
                    <ChevronRight size={18} />
                  </button>
                </article>

                <article className="profile-invite">
                  <div>
                    <h3>Invite Friends and get rewards</h3>
                    <p>Invite friends and earn rewards points</p>
                    <button type="button" onClick={() => setModal("invite")}>
                      Invite Now
                    </button>
                  </div>
                  <Gift size={72} strokeWidth={1.4} />
                </article>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <AccountSettingsModals
        passwordOpen={modal === "password"}
        notificationsOpen={modal === "notifications"}
        languageOpen={false}
        inviteOpen={modal === "invite"}
        onClose={() => setModal(null)}
      />
    </>
  );
}

export default Account;
