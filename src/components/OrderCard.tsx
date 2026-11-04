import {
    ChevronRight,
    CalendarDays,
    Truck,
    Eye,
    Star,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { Order } from "../data/orders";

interface OrderCardProps {
    order: Order;
}

function OrderCard({ order }: OrderCardProps) {
    const itemCount =
        typeof order.items === "number"
            ? order.items
            : Array.isArray(order.items)
                ? (order.items as any[]).length
                : Array.isArray(order.products)
                    ? order.products.length
                    : 1;

    return (
        <article className="order-card">

            {/* Left side */}
            <div className="order-main">

                <div className={`order-status ${order.status.toLowerCase()}`}>
                    {order.status}
                </div>

                <div className="order-content">

                    <img
                        src={order.image || "/src/frontend/assets/images/products/apple.jpg"}
                        alt={order.category || "Order items"}
                        className="order-image"
                    />

                    <div className="order-information">

                        <span className="order-id">
                            Order # {order.id}
                        </span>

                        <h3>{order.category || "Organic Farm Produce"}</h3>

                        <p className="order-items">
                            {itemCount} items&nbsp; . &nbsp;Rs {order.total.toLocaleString()}
                        </p>

                        <div className="order-date">
                            <CalendarDays size={16} />
                            <span>{order.date}</span>
                        </div>

                    </div>

                </div>
            </div>

            {/* Middle */}
            <div className={`order-delivery ${order.status.toLowerCase()}`}>

                <strong>{order.status}</strong>

                <span>
                    {order.status === "Delivered"
                        ? "Delivered on"
                        : "Est Delivered on"}
                </span>

                <span>{order.deliveryDate || "2–3 Days"}</span>

            </div>

            {/* Right side */}
            <div className="order-card-actions" style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {order.status === "Delivered" && (
                        <Link
                            to={`/orders/${order.id}`}
                            className="view-details-button order-review-link"
                            style={{
                                background: "#fef3c7",
                                border: "1px solid #f59e0b",
                                color: "#b45309",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                                textDecoration: "none",
                                fontWeight: 600,
                            }}
                        >
                            <Star size={13} fill="#f59e0b" color="#f59e0b" /> Review Items
                        </Link>
                    )}

                    <Link
                        to={`/orders/${order.id}/track`}
                        className="view-details-button"
                        style={{
                            background: "transparent",
                            border: "1px solid var(--brand-primary, #0c831f)",
                            color: "var(--brand-primary, #0c831f)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            textDecoration: "none",
                            fontWeight: 600,
                        }}
                    >
                        <Truck size={14} /> Track Order
                    </Link>

                    <Link
                        to={`/orders/${order.id}`}
                        className="view-details-button"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "0.85rem",
                            textDecoration: "none",
                            fontWeight: 600,
                        }}
                    >
                        <Eye size={14} /> Open Detail
                    </Link>
                </div>

                <Link
                    to={`/orders/${order.id}`}
                    className="order-arrow"
                    aria-label={`View order ${order.id} details`}
                >
                    <ChevronRight size={22} />
                </Link>

            </div>

        </article>
    );
}

export default OrderCard;
