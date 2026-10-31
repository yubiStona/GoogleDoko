import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Activity,
  Bell,
  Camera,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Diamond,
  Equal,
  Eye,
  ImagePlus,
  Mail,
  Pencil,
  RotateCcw,
  Search,
  Star,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { useAccount } from "../../context/AccountContext";
import { DEMO_PASSWORD, type VendorStoreSettings } from "../../data/authOptions";
import { api } from "../../api/client";
import { useGetVendorOrdersQuery } from "../../store/api/apiSlice";
import bannerImage from "../../assets/images/vendor/storefront-banner.jpg";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

interface VendorSectionProps {
  title: string;
  text: string;
  action?: { to: string; label: string };
  rows?: { title: string; meta: string; extra?: string }[];
}

export function VendorSection({ title, text, action, rows }: VendorSectionProps) {
  return (
    <section className="vd-card vd-section">
      <div className="vd-card-head">
        <div>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
        {action ? <Link to={action.to}>{action.label}</Link> : null}
      </div>
      {rows?.length ? (
        <ul className="vd-list">
          {rows.map((row) => (
            <li key={row.title}>
              <div>
                <strong>{row.title}</strong>
                <span>{row.meta}</span>
              </div>
              {row.extra ? <em>{row.extra}</em> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose a JPG or PNG image"));
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      reject(new Error("Image must be under 4MB"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that image"));
    reader.readAsDataURL(file);
  });
}

function VendorModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="vd-modal" role="dialog" aria-modal="true" aria-labelledby="vd-modal-title">
      <button type="button" className="vd-modal-backdrop" aria-label="Close" onClick={onClose} />
      <div className="vd-modal-card">
        <header>
          <h2 id="vd-modal-title">{title}</h2>
          <button type="button" className="vd-icon-btn" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

const catalog = [
  {
    id: "apples",
    name: "Fresh Red Apples",
    detail: "Organic Mustang Orchards",
    category: "Fruits",
    price: 450,
    stock: "120 kg",
    status: "Active" as const,
    image: "/src/frontend/assets/images/products/apple.jpg",
  },
  {
    id: "potatoes",
    name: "Organic Potatoes",
    detail: "Local Tarai Harvesting",
    category: "Vegetables",
    price: 120,
    stock: "200 kg",
    status: "Active" as const,
    image: "/src/frontend/assets/images/products/potato.jpg",
  },
  {
    id: "honey",
    name: "Local Natural Honey",
    detail: "Wildflowers Honey Jar",
    category: "Others",
    price: 1800,
    stock: "40 jars",
    status: "Active" as const,
    image: "/src/frontend/assets/images/products/honey.jpg",
  },
  {
    id: "tomatoes",
    name: "Cherry Tomatoes",
    detail: "Greenhouse Fresh Pick",
    category: "Vegetables",
    price: 250,
    stock: "15 kg",
    status: "Inactive" as const,
    image: "/src/frontend/assets/images/products/tomato.jpg",
  },
];

export function VendorProducts() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("Active Status");
  const [sort, setSort] = useState("price-high");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState(catalog);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const filtered = useMemo(() => {
    const next = items.filter((item) => {
      const haystack = `${item.name} ${item.detail} ${item.category}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesCategory =
        category === "All Categories" || item.category === category;
      const matchesStatus =
        status === "Active Status" || item.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });

    next.sort((a, b) =>
      sort === "price-low" ? a.price - b.price : b.price - a.price,
    );
    return next;
  }, [category, items, query, sort, status]);

  return (
    <div className="vd-products">
      <div className="vd-products-head">
        <div>
          <h1>Products Management</h1>
          <p>Displaying and managing active and inactive fresh produce.</p>
        </div>
        <Link to="/vendor/products/new" className="vd-add-btn">
          + Add New Product
        </Link>
      </div>

      <section className="vd-card vd-products-card">
        <div className="vd-filters">
          <label className="vd-filter-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              aria-label="Search products"
            />
          </label>
          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
          >
            <option>All Categories</option>
            <option>Fruits</option>
            <option>Vegetables</option>
            <option>Others</option>
          </select>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
          >
            <option>Active Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort products"
          >
            <option value="price-high">Sort by: Price High</option>
            <option value="price-low">Sort by: Price Low</option>
          </select>
        </div>

        <div className="vd-table-wrap">
          <table className="vd-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price (NPR)</th>
                <th>Stock Available</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img src={item.image} alt="" className="vd-thumb" />
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                    <span>{item.detail}</span>
                  </td>
                  <td>{item.category}</td>
                  <td>Rs. {item.price.toLocaleString()}</td>
                  <td>{item.stock}</td>
                  <td>
                    <span className={`vd-status ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="vd-row-actions">
                      <Link
                        to="/vendor/products/new"
                        className="vd-icon-btn"
                        aria-label={`Edit ${item.name}`}
                      >
                        <Pencil size={15} />
                      </Link>
                      <button
                        type="button"
                        className="vd-icon-btn danger"
                        aria-label={`Remove ${item.name}`}
                        onClick={() =>
                          setItems((current) =>
                            current.filter((row) => row.id !== item.id),
                          )
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="vd-table-foot">
          <span>Showing 1-4 of 45 products</span>
          <div className="vd-pager">
            <button type="button" aria-label="Previous page" onClick={() => setPage(1)}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className={page === 1 ? "active" : ""} onClick={() => setPage(1)}>
              1
            </button>
            <button type="button" className={page === 2 ? "active" : ""} onClick={() => setPage(2)}>
              2
            </button>
            <button type="button" aria-label="Next page" onClick={() => setPage(2)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

const addProductSchema = yup.object({
  name: yup.string().required("Product name is required").trim(),
  description: yup.string().default("").trim(),
  category: yup.string().default("Fruits"),
  subcategory: yup.string().default("Apples"),
  price: yup.string().required("Price is required").trim(),
  discount: yup.string().default("").trim(),
  stock: yup.string().required("Stock quantity is required").trim(),
  unit: yup.string().required("Measurement unit is required").trim(),
  sku: yup.string().default("").trim(),
  origin: yup.string().default("Mustang District, Nepal"),
  freshness: yup.string().default("").trim(),
  delivery: yup.string().default("").trim(),
});

type AddProductFormData = yup.InferType<typeof addProductSchema>;

export function VendorAddProduct() {
  const navigate = useNavigate();
  const { showToast } = useAccount();
  const [publish, setPublish] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<AddProductFormData>({
    resolver: yupResolver(addProductSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "Fruits",
      subcategory: "Apples",
      price: "",
      discount: "",
      stock: "",
      unit: "",
      sku: "",
      origin: "Mustang District, Nepal",
      freshness: "",
      delivery: "",
    },
  });

  async function addFiles(list: FileList | null) {
    if (!list) return;
    const newFiles = Array.from(list).slice(0, 6 - files.length);
    setFiles((current) => [...current, ...newFiles].slice(0, 6));
    // Upload first new file immediately
    const firstFile = newFiles[0];
    if (firstFile) {
      setUploading(true);
      try {
        const result = await api.uploadImage(firstFile);
        setUploadedImageUrl(result.url);
        showToast("Image uploaded successfully!");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        showToast("Image upload failed: " + message);
      } finally {
        setUploading(false);
      }
    }
  }

  async function onSaveProduct(data: AddProductFormData, asDraft: boolean) {
    if (!asDraft && files.length === 0 && !uploadedImageUrl) {
      showToast("Add at least one product image");
      return;
    }
    const weight = data.stock && data.unit ? `${data.stock} ${data.unit}` : data.unit || "1 kg";
    const payload = {
      name: data.name.trim(),
      description: data.description || "",
      category: data.category,
      weight,
      price: Number(data.price),
      stock: Number(data.stock) || 0,
      origin: data.origin,
      image: uploadedImageUrl || "",
      active: asDraft ? 0 : (publish ? 1 : 0),
    };
    try {
      await api.vendorSaveProduct(null, payload);
      showToast(
        asDraft
          ? `${data.name.trim() || "Product"} saved as draft`
          : `${data.name.trim()} is now live on GoogleDoko`,
      );
      if (!asDraft) navigate("/vendor/products");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      showToast("Save failed: " + message);
    }
  }

  return (
    <div className="vd-add">
      <div className="vd-products-head">
        <div>
          <h1>Add New Product</h1>
          <p>Enter all details to list your fresh agricultural yield on the public marketplace.</p>
        </div>
      </div>

      <form className="vd-add-grid" onSubmit={handleSubmit((data) => onSaveProduct(data, !publish))} noValidate>
        <section className="vd-card">
          <h2>Basic Information</h2>

          <label className="vd-field">
            <span>Product Name <i>*</i></span>
            <input
              {...register("name")}
              placeholder="e.g. Fresh Red Apples (Mustang Organic)"
            />
            {errors.name?.message && (
              <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                {errors.name.message}
              </span>
            )}
          </label>

          <label className="vd-field">
            <span>Detailed Description <i>*</i></span>
            <textarea
              rows={4}
              {...register("description")}
              placeholder="Describe when it was harvested, geographical origin, organic nature, taste profile..."
            />
          </label>

          <div className="vd-two">
            <label className="vd-field">
              <span>Category <i>*</i></span>
              <select {...register("category")}>
                <option>Fruits</option>
                <option>Vegetables</option>
                <option>Spices</option>
                <option>Others</option>
              </select>
            </label>
            <label className="vd-field">
              <span>Subcategory</span>
              <select {...register("subcategory")}>
                <option>Apples</option>
                <option>Citrus</option>
                <option>Root vegetables</option>
                <option>Leafy greens</option>
                <option>Honey</option>
              </select>
            </label>
          </div>

          <div className="vd-two">
            <label className="vd-field">
              <span>Price (NPR / Rs.) <i>*</i></span>
              <input
                {...register("price")}
                placeholder="e.g. 450"
              />
              {errors.price?.message && (
                <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                  {errors.price.message}
                </span>
              )}
            </label>
            <label className="vd-field">
              <span>Discount (Optional %)</span>
              <input {...register("discount")} placeholder="e.g. 10" />
            </label>
          </div>

          <div className="vd-two">
            <label className="vd-field">
              <span>Available Stock Quantity <i>*</i></span>
              <input
                {...register("stock")}
                placeholder="e.g. 150"
              />
              {errors.stock?.message && (
                <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                  {errors.stock.message}
                </span>
              )}
            </label>
            <label className="vd-field">
              <span>Measurement Unit <i>*</i></span>
              <select {...register("unit")}>
                <option value="">Select Unit (e.g. kg, gram, piece)</option>
                <option>kg</option>
                <option>gram</option>
                <option>piece</option>
                <option>jar</option>
                <option>bunch</option>
              </select>
              {errors.unit?.message && (
                <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                  {errors.unit.message}
                </span>
              )}
            </label>
          </div>

          <label className="vd-field">
            <span>SKU (Stock Keeping Unit)</span>
            <input {...register("sku")} placeholder="e.g. HFF-APP-MUSTANG-01" />
          </label>
        </section>

        <div className="vd-add-side">
          <section className="vd-card">
            <h2>Media &amp; Distribution</h2>

            <div className="vd-field">
              <span>Product Images <i>*</i></span>
              <label
                className="vd-drop"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  addFiles(event.dataTransfer.files);
                }}
              >
                <ImagePlus size={22} />
                <strong>Drag &amp; drop file here, or click to browse</strong>
                <small>Supports JPG, PNG up to 4MB. Drag &amp; drop multiple files.</small>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  multiple
                  onChange={(event) => addFiles(event.target.files)}
                />
              </label>
              {files.length > 0 ? (
                <ul className="vd-file-list">
                  {files.map((file) => (
                    <li key={file.name}>{file.name}</li>
                  ))}
                </ul>
              ) : null}
              {uploading && <p style={{ color: "#16a34a", fontSize: 13, marginTop: 6 }}>⬆ Uploading image…</p>}
              {uploadedImageUrl && !uploading && (
                <div style={{ marginTop: 8 }}>
                  <img src={uploadedImageUrl} alt="Uploaded preview" style={{ height: 70, borderRadius: 8, objectFit: "cover", border: "1px solid #e5e7eb" }} />
                  <p style={{ fontSize: 12, color: "#16a34a", marginTop: 4 }}>✅ Image uploaded</p>
                </div>
              )}
            </div>

            <label className="vd-field">
              <span>Harvest/Origin Location <i>*</i></span>
              <select {...register("origin")}>
                <option>Mustang District, Nepal</option>
                <option>Ilam, Nepal</option>
                <option>Kavre, Nepal</option>
                <option>Chitwan, Nepal</option>
              </select>
            </label>

            <label className="vd-field">
              <span>Freshness Window</span>
              <input {...register("freshness")} placeholder="Best within 7 days of delivery" />
            </label>

            <div className="vd-toggle-row">
              <div>
                <strong>Availability Settings</strong>
                <span>Instantly Publish &amp; Make Active</span>
              </div>
              <button
                type="button"
                className={`vd-switch${publish ? " on" : ""}`}
                aria-pressed={publish}
                onClick={() => setPublish((value) => !value)}
              >
                <span />
              </button>
            </div>

            <label className="vd-field">
              <span>Delivery Information</span>
              <textarea
                rows={3}
                {...register("delivery")}
                placeholder="Same-day shipping for Bagmati province, 2 days for Koshi province..."
              />
            </label>
          </section>

          <div className="vd-add-actions">
            <button
              type="button"
              className="vd-draft"
              onClick={() => onSaveProduct(getValues(), true)}
            >
              Save Draft
            </button>
            <button type="submit" className="vd-add-btn">
              {publish ? "Publish Product Live" : "Save Inactive Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const vendorOrderTabs = [
  { id: "all", label: "All Orders", count: 124 },
  { id: "incoming", label: "New Incoming", count: 3 },
  { id: "preparing", label: "Preparing", count: 12 },
  { id: "ready", label: "Ready", count: 4 },
  { id: "shipped", label: "Shipped", count: 18 },
  { id: "delivered", label: "Delivered", count: 82 },
  { id: "cancelled", label: "Cancelled", count: 5 },
] as const;

const incomingOrders = [
  {
    id: "GD-2026-10245",
    time: "Today, 10:45 AM",
    customer: "Amrita Pokhrel",
    phone: "98510XXXXX",
    address: "Maitidevi, Kathmandu, Ward 30",
    items: "Fresh Red Apple (Mustang) x 2kg, Cherry Tomatoes x 1kg",
    total: "1,150",
    payment: "Cash On Delivery (COD)",
  },
  {
    id: "GD-2026-10242",
    time: "Today, 09:12 AM",
    customer: "Rajesh Gurung",
    phone: "98012XXXXX",
    address: "Lalitpur, Jhamsikhel, Ward 2",
    items: "Organic Potatoes x 5kg, Spinach x 2 bundles",
    total: "680",
    payment: "Cash On Delivery (COD)",
  },
];

export function VendorOrders() {
  const [tab, setTab] = useState<(typeof vendorOrderTabs)[number]["id"]>("incoming");
  const { data: serverVendorOrders } = useGetVendorOrdersQuery();
  const [localOrders, setLocalOrders] = useState<any[] | null>(null);

  const orders = useMemo(() => {
    if (localOrders !== null) return localOrders;
    if (serverVendorOrders && serverVendorOrders.length > 0) {
      return serverVendorOrders.map((o: any) => ({
        id: o.id,
        time: o.date || new Date(o.createdAt || Date.now()).toLocaleDateString(),
        customer: o.recipientName || "Customer",
        phone: o.recipientPhone || "98XXXXXXXX",
        address: o.deliveryAddress || "Kathmandu",
        items: Array.isArray(o.items)
          ? o.items.map((it: any) => `${it.name} x ${it.quantity}`).join(", ")
          : "Fresh Harvest Produce",
        total: Number(o.total || 0).toLocaleString(),
        payment: `${o.paymentMethod || "COD"} (${o.paymentStatus || "Pending"})`,
      }));
    }
    return incomingOrders;
  }, [serverVendorOrders, localOrders]);

  return (
    <div className="vd-orders">
      <div className="vd-products-head">
        <div>
          <h1>Vendor Orders Triage</h1>
          <p>Fulfill incoming orders and update state for clients.</p>
        </div>
      </div>

      <div className="vd-order-tabs" role="tablist">
        {vendorOrderTabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={tab === item.id ? "active" : ""}
            onClick={() => setTab(item.id)}
          >
            {item.label}
            <b>{item.count}</b>
          </button>
        ))}
      </div>

      {tab === "incoming" ? (
        <>
          <p className="vd-order-alert">
            <Bell size={16} />
            3 Pending Review Orders Need Immediate Action
          </p>

          <div className="vd-order-list">
            {orders.map((order) => (
              <article className="vd-card vd-order-card" key={order.id}>
                <header>
                  <div>
                    <strong>{order.id}</strong>
                    <span className="vd-incoming-tag">NEW INCOMING</span>
                  </div>
                  <time>{order.time}</time>
                </header>

                <div className="vd-order-grid">
                  <div>
                    <small>CUSTOMER &amp; CONTACT</small>
                    <strong>{order.customer}</strong>
                    <p>
                      Phone: {order.phone} | Address: {order.address}
                    </p>
                  </div>
                  <div>
                    <small>ITEMS REQUESTED</small>
                    <p>{order.items}</p>
                  </div>
                  <div className="vd-order-total">
                    <small>TOTAL VALUE</small>
                    <strong>Rs. {order.total}</strong>
                    <p>{order.payment}</p>
                  </div>
                </div>

                <footer>
                  <p>Estimated Dispatch Target: Within 4 hours</p>
                  <div>
                    <button
                      type="button"
                      className="vd-decline"
                      onClick={() =>
                        setLocalOrders((current) =>
                          (current || orders).filter((item) => item.id !== order.id),
                        )
                      }
                    >
                      Decline Order
                    </button>
                    <button
                      type="button"
                      className="vd-add-btn"
                      onClick={() => setTab("preparing")}
                    >
                      Accept &amp; Mark Preparing
                    </button>
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </>
      ) : (
        <section className="vd-card">
          <p>
            {tab === "all"
              ? "124 orders across every fulfillment stage."
              : `No extra ${tab} cards in this view. Incoming orders are shown under New Incoming.`}
          </p>
        </section>
      )}
    </div>
  );
}

const vendorCustomers = [
  {
    id: "c1",
    name: "Amrita Pokhrel",
    email: "amrita.p@email.com",
    phone: "98510XXXXX",
    location: "Kathmandu",
    orders: 6,
    spent: 12450,
    lastOrder: "23 Sep 2026",
    status: "Repeat" as const,
  },
  {
    id: "c2",
    name: "Rajesh Gurung",
    email: "rajesh.g@email.com",
    phone: "98012XXXXX",
    location: "Lalitpur",
    orders: 3,
    spent: 3280,
    lastOrder: "23 Sep 2026",
    status: "Active" as const,
  },
  {
    id: "c3",
    name: "Ramesh Thapa",
    email: "ramesh.t@email.com",
    phone: "98411XXXXX",
    location: "Pokhara",
    orders: 8,
    spent: 18900,
    lastOrder: "30 Aug 2026",
    status: "Repeat" as const,
  },
  {
    id: "c4",
    name: "Sabina Shrestha",
    email: "sabina.s@email.com",
    phone: "98130XXXXX",
    location: "Bhaktapur",
    orders: 2,
    spent: 1890,
    lastOrder: "29 Aug 2026",
    status: "New" as const,
  },
  {
    id: "c5",
    name: "Anil Shrestha",
    email: "anil.s@email.com",
    phone: "98620XXXXX",
    location: "Kathmandu",
    orders: 5,
    spent: 7540,
    lastOrder: "28 Aug 2026",
    status: "Repeat" as const,
  },
  {
    id: "c6",
    name: "Sneha Malla",
    email: "sneha.m@email.com",
    phone: "98080XXXXX",
    location: "Kathmandu",
    orders: 4,
    spent: 4320,
    lastOrder: "21 Sep 2026",
    status: "Repeat" as const,
  },
  {
    id: "c7",
    name: "Arjun Karki",
    email: "arjun.k@email.com",
    phone: "98210XXXXX",
    location: "Pokhara",
    orders: 2,
    spent: 1180,
    lastOrder: "18 Sep 2026",
    status: "New" as const,
  },
  {
    id: "c8",
    name: "Pooja Rai",
    email: "pooja.r@email.com",
    phone: "98180XXXXX",
    location: "Bhaktapur",
    orders: 6,
    spent: 7540,
    lastOrder: "16 Sep 2026",
    status: "Repeat" as const,
  },
];

const customerMetrics = [
  { label: "Total Customers", value: "86", note: "↑ 8% vs last month", icon: Users, tone: "green" },
  { label: "Repeat Buyers", value: "54", note: "62% of your list", icon: Users, tone: "blue" },
  { label: "New This Month", value: "12", note: "↑ 3 vs last month", icon: UserPlus, tone: "lilac" },
  { label: "Avg Lifetime Spend", value: "Rs. 7,140", note: "↑ 5% vs last month", icon: Wallet, tone: "pink" },
];

function customerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? "");
  return `${first}${last}`.toUpperCase();
}

export function VendorCustomers() {
  const { showToast } = useAccount();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<(typeof vendorCustomers)[number] | null>(null);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const filtered = useMemo(() => {
    return vendorCustomers.filter((item) => {
      const haystack = `${item.name} ${item.email} ${item.phone} ${item.location}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesLocation = location === "All Locations" || item.location === location;
      const matchesStatus = status === "All Status" || item.status === status;
      return matchesQuery && matchesLocation && matchesStatus;
    });
  }, [location, query, status]);

  function exportCustomers() {
    const header = "Name,Email,Phone,Location,Orders,Total Spent,Last Order,Status";
    const rows = filtered.map(
      (item) =>
        `"${item.name}","${item.email}","${item.phone}","${item.location}",${item.orders},${item.spent},"${item.lastOrder}","${item.status}"`,
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "googledoko-customers.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Customer list exported");
  }

  return (
    <div className="vd-customers">
      <div className="vd-products-head">
        <div>
          <h1>Customer Insights</h1>
          <p>See who buys from your farm and how often they come back.</p>
        </div>
        <button type="button" className="vd-add-btn" onClick={exportCustomers}>
          Export Customers
        </button>
      </div>

      <section className="vd-report-metrics">
        {customerMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="vd-report-metric" key={metric.label}>
              <header>
                <span>{metric.label}</span>
                <em className={metric.tone}>
                  <Icon size={14} />
                </em>
              </header>
              <strong>{metric.value}</strong>
              <small>{metric.note}</small>
            </article>
          );
        })}
      </section>

      <section className="vd-card vd-products-card">
        <div className="vd-filters">
          <label className="vd-filter-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search customers..."
              aria-label="Search customers"
            />
          </label>
          <select
            value={location}
            onChange={(event) => {
              setLocation(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by location"
          >
            <option>All Locations</option>
            <option>Kathmandu</option>
            <option>Lalitpur</option>
            <option>Pokhara</option>
            <option>Bhaktapur</option>
          </select>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
          >
            <option>All Status</option>
            <option>Repeat</option>
            <option>Active</option>
            <option>New</option>
          </select>
        </div>

        <div className="vd-table-wrap">
          <table className="vd-table vd-cust-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="vd-cust-name">
                        <b className="vd-cust-avatar" aria-hidden="true">
                          {customerInitials(item.name)}
                        </b>
                        <div className="vd-cust-copy">
                          <strong>{item.name}</strong>
                          <span>{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{item.phone}</td>
                    <td>{item.location}</td>
                    <td>{item.orders}</td>
                    <td>Rs. {item.spent.toLocaleString()}</td>
                    <td>{item.lastOrder}</td>
                    <td>
                      <span className={`vd-status ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="vd-row-actions">
                        <button
                          type="button"
                          className="vd-icon-btn"
                          aria-label={`View ${item.name}`}
                          onClick={() => setSelected(item)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="vd-icon-btn"
                          aria-label={`Message ${item.name}`}
                          onClick={() => {
                            window.location.href = `mailto:${item.email}?subject=${encodeURIComponent(`Hello from GoogleDoko`)}`;
                            showToast(`Opening message to ${item.name}`);
                          }}
                        >
                          <Mail size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>No customers match this search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="vd-table-foot">
          <span>
            Showing {filtered.length} of 86 customers
          </span>
          <div className="vd-pager">
            <button type="button" aria-label="Previous page" onClick={() => setPage(1)}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className={page === 1 ? "active" : ""} onClick={() => setPage(1)}>
              1
            </button>
            <button type="button" className={page === 2 ? "active" : ""} onClick={() => setPage(2)}>
              2
            </button>
            <button type="button" aria-label="Next page" onClick={() => setPage(2)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
      {selected ? (
        <VendorModal title={selected.name} onClose={() => setSelected(null)}>
          <p>
            {selected.email}
            <br />
            {selected.phone}
            <br />
            {selected.location}
          </p>
          <p>
            {selected.orders} orders · Rs. {selected.spent.toLocaleString()} spent
            <br />
            Last order {selected.lastOrder} · {selected.status}
          </p>
          <button
            type="button"
            className="vd-add-btn"
            onClick={() => {
              window.location.href = `mailto:${selected.email}`;
            }}
          >
            Message Customer
          </button>
        </VendorModal>
      ) : null}
    </div>
  );
}

const reportMetrics = [
  {
    label: "Total Revenue",
    value: "Rs. 256,780",
    note: "↑ 15% vs last week",
    icon: Diamond,
    tone: "lilac",
  },
  {
    label: "Avg Order Value",
    value: "Rs. 1,245",
    note: "↑ 5% vs last week",
    icon: Equal,
    tone: "blue",
  },
  {
    label: "Conversion Rate",
    value: "3.2%",
    note: "↑ 1.2% vs last week",
    icon: Activity,
    tone: "green",
  },
  {
    label: "Return Rate",
    value: "0.8%",
    note: "↓ 0.2% vs last week",
    icon: RotateCcw,
    tone: "pink",
    down: true,
  },
];

const reportBars = [
  { day: "M", height: 58 },
  { day: "T", height: 78 },
  { day: "W", height: 64 },
  { day: "T", height: 88 },
  { day: "F", height: 72 },
  { day: "S", height: 52 },
  { day: "S", height: 42 },
];

const reportCategories = [
  { name: "Fruits", share: "54%", amount: "Rs. 138,661", color: "#176136", width: "54%" },
  { name: "Vegetables", share: "28%", amount: "Rs. 71,898", color: "#e3942d", width: "28%" },
  { name: "Local Honey & Honey Jars", share: "12%", amount: "Rs. 30,813", color: "#d4a017", width: "12%" },
  { name: "Grains & Others", share: "6%", amount: "Rs. 15,408", color: "#3f4a43", width: "6%" },
];

const reportTransactions = [
  { id: "#ORD-1042", customer: "Ramesh Thapa", date: "30 Aug 2026", amount: "Rs. 1,250", status: "Delivered" },
  { id: "#ORD-1041", customer: "Sabina Shrestha", date: "29 Aug 2026", amount: "Rs. 890", status: "Processing" },
  { id: "#ORD-1040", customer: "Anil Shrestha", date: "28 Aug 2026", amount: "Rs. 1,560", status: "Shipped" },
];

export function VendorReports() {
  const [range, setRange] = useState("Last 30 Days");

  return (
    <div className="vd-reports">
      <div className="vd-reports-head">
        <h1>Sales Analytics</h1>
      </div>

      <div className="vd-reports-kicker">
        <h2>Performance Metrics</h2>
        <label className="vd-range">
          <span>Date Range: {range}</span>
          <ChevronDown size={14} />
          <select
            aria-label="Date range"
            value={range}
            onChange={(event) => setRange(event.target.value)}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Year</option>
          </select>
        </label>
      </div>

      <section className="vd-report-metrics">
        {reportMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="vd-report-metric" key={metric.label}>
              <header>
                <span>{metric.label}</span>
                <em className={metric.tone}>
                  <Icon size={14} />
                </em>
              </header>
              <strong>{metric.value}</strong>
              <small className={metric.down ? "down" : undefined}>{metric.note}</small>
            </article>
          );
        })}
      </section>

      <div className="vd-report-mid">
        <section className="vd-card vd-report-chart">
          <h2>Revenue Sales Trend</h2>
          <div className="vd-bars" role="img" aria-label="Revenue sales trend for the week">
            {reportBars.map((bar, index) => (
              <div className="vd-bar-col" key={`${bar.day}-${index}`}>
                <span className="vd-bar" style={{ height: `${bar.height}%` }} />
                <small>{bar.day}</small>
              </div>
            ))}
          </div>
        </section>

        <section className="vd-card vd-report-cats">
          <h2>Sales by Category</h2>
          <ul>
            {reportCategories.map((item) => (
              <li key={item.name}>
                <div>
                  <strong>
                    <i style={{ background: item.color }} />
                    {item.name}
                  </strong>
                  <span>
                    {item.share} ({item.amount})
                  </span>
                </div>
                <b style={{ width: item.width, background: item.color }} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="vd-card vd-report-tx">
        <h2>Recent Transactions</h2>
        <div className="vd-table-wrap">
          <table className="vd-table vd-tx-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportTransactions.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.id}</strong>
                  </td>
                  <td>{row.customer}</td>
                  <td>{row.date}</td>
                  <td>{row.amount}</td>
                  <td>
                    <span className={`vd-status ${row.status.toLowerCase()}`}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const vendorSales = [
  {
    id: "#ORD-1048",
    customer: "Amrita Pokhrel",
    items: "Red Apples 2kg, Honey 1 jar",
    amount: 2700,
    payment: "eSewa",
    date: "24 Sep 2026",
    status: "Paid" as const,
  },
  {
    id: "#ORD-1047",
    customer: "Rajesh Gurung",
    items: "Organic Potatoes 5kg",
    amount: 680,
    payment: "Cash On Delivery",
    date: "24 Sep 2026",
    status: "COD Pending" as const,
  },
  {
    id: "#ORD-1046",
    customer: "Sneha Malla",
    items: "Cherry Tomatoes 1kg, Spinach 2 bundles",
    amount: 1480,
    payment: "Khalti",
    date: "23 Sep 2026",
    status: "Paid" as const,
  },
  {
    id: "#ORD-1045",
    customer: "Pooja Rai",
    items: "Local Natural Honey 2 jars",
    amount: 3600,
    payment: "eSewa",
    date: "22 Sep 2026",
    status: "Paid" as const,
  },
  {
    id: "#ORD-1044",
    customer: "Arjun Karki",
    items: "Fresh Red Apples 3kg",
    amount: 1350,
    payment: "Cash On Delivery",
    date: "21 Sep 2026",
    status: "COD Pending" as const,
  },
  {
    id: "#ORD-1043",
    customer: "Anil Shrestha",
    items: "Organic Potatoes 8kg, Spinach 4 bundles",
    amount: 1560,
    payment: "Khalti",
    date: "20 Sep 2026",
    status: "Paid" as const,
  },
  {
    id: "#ORD-1042",
    customer: "Ramesh Thapa",
    items: "Red Apples 1kg",
    amount: 1250,
    payment: "eSewa",
    date: "30 Aug 2026",
    status: "Paid" as const,
  },
  {
    id: "#ORD-1041",
    customer: "Sabina Shrestha",
    items: "Cherry Tomatoes 2kg",
    amount: 890,
    payment: "Khalti",
    date: "29 Aug 2026",
    status: "Refunded" as const,
  },
];

const salesMetrics = [
  { label: "Today's Sales", value: "Rs. 3,380", note: "2 orders today", icon: TrendingUp, tone: "green" },
  { label: "This Week", value: "Rs. 48,200", note: "↑ 8% vs last week", icon: Wallet, tone: "blue" },
  { label: "This Month", value: "Rs. 256,780", note: "124 orders", icon: Diamond, tone: "lilac" },
  { label: "Pending Payout", value: "Rs. 2,030", note: "COD still collecting", icon: RotateCcw, tone: "pink", down: true },
];

export function VendorSales() {
  const { showToast } = useAccount();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [payment, setPayment] = useState("All Payments");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<(typeof vendorSales)[number] | null>(null);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const filtered = useMemo(() => {
    return vendorSales.filter((item) => {
      const haystack = `${item.id} ${item.customer} ${item.items} ${item.payment}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesPayment = payment === "All Payments" || item.payment === payment;
      const matchesStatus = status === "All Status" || item.status === status;
      return matchesQuery && matchesPayment && matchesStatus;
    });
  }, [payment, query, status]);

  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function exportSales() {
    const header = "Order ID,Customer,Items,Amount,Payment,Date,Status";
    const rows = filtered.map(
      (item) =>
        `"${item.id}","${item.customer}","${item.items}",${item.amount},"${item.payment}","${item.date}","${item.status}"`,
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "googledoko-sales.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Sales list exported");
  }

  return (
    <div className="vd-sales">
      <div className="vd-products-head">
        <div>
          <h1>Sales Management</h1>
          <p>Track farm sales, payments, and payouts from marketplace orders.</p>
        </div>
        <button type="button" className="vd-add-btn" onClick={exportSales}>
          Export Sales
        </button>
      </div>

      <section className="vd-report-metrics">
        {salesMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="vd-report-metric" key={metric.label}>
              <header>
                <span>{metric.label}</span>
                <em className={metric.tone}>
                  <Icon size={14} />
                </em>
              </header>
              <strong>{metric.value}</strong>
              <small className={metric.down ? "down" : undefined}>{metric.note}</small>
            </article>
          );
        })}
      </section>

      <section className="vd-card vd-products-card">
        <div className="vd-filters">
          <label className="vd-filter-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search sales..."
              aria-label="Search sales"
            />
          </label>
          <select
            value={payment}
            onChange={(event) => {
              setPayment(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by payment"
          >
            <option>All Payments</option>
            <option>eSewa</option>
            <option>Khalti</option>
            <option>Cash On Delivery</option>
          </select>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
          >
            <option>All Status</option>
            <option>Paid</option>
            <option>COD Pending</option>
            <option>Refunded</option>
          </select>
        </div>

        <div className="vd-table-wrap">
          <table className="vd-table vd-tx-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length ? (
                visible.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.id}</strong>
                    </td>
                    <td>{item.customer}</td>
                    <td>{item.items}</td>
                    <td>Rs. {item.amount.toLocaleString()}</td>
                    <td>{item.payment}</td>
                    <td>{item.date}</td>
                    <td>
                      <span className={`vd-status ${item.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="vd-icon-btn"
                        aria-label={`View ${item.id}`}
                        onClick={() => setSelected(item)}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8}>No sales match this search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="vd-table-foot">
          <span>
            Showing {visible.length} of {filtered.length} sales
          </span>
          <div className="vd-pager">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pages }, (_, index) => (
              <button
                type="button"
                key={index + 1}
                className={currentPage === index + 1 ? "active" : ""}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPage((value) => Math.min(pages, value + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {selected ? (
        <VendorModal title={selected.id} onClose={() => setSelected(null)}>
          <p>
            {selected.customer}
            <br />
            {selected.items}
          </p>
          <p>
            Rs. {selected.amount.toLocaleString()} · {selected.payment}
            <br />
            {selected.date} · {selected.status}
          </p>
          <button type="button" className="vd-add-btn" onClick={() => setSelected(null)}>
            Close
          </button>
        </VendorModal>
      ) : null}
    </div>
  );
}

export function VendorAnalytics() {
  return <VendorReports />;
}

const vendorReviews = [
  {
    id: "r1",
    customer: "Sneha Malla",
    email: "sneha.m@email.com",
    product: "Fresh Red Apples",
    rating: 5,
    comment: "Fresh and sweet. Packed well for the ride from Mustang.",
    date: "22 Sep 2026",
    status: "Published" as const,
    reply: "Thank you Sneha! We pick the apples the same morning.",
  },
  {
    id: "r2",
    customer: "Arjun Karki",
    email: "arjun.k@email.com",
    product: "Local Natural Honey",
    rating: 5,
    comment: "Rich aroma and thick texture. Will order again.",
    date: "19 Sep 2026",
    status: "Pending Reply" as const,
    reply: "",
  },
  {
    id: "r3",
    customer: "Pooja Rai",
    email: "pooja.r@email.com",
    product: "Organic Potatoes",
    rating: 5,
    comment: "Packed well. Potatoes were clean and firm.",
    date: "17 Sep 2026",
    status: "Published" as const,
    reply: "Glad they arrived in good shape, Pooja.",
  },
  {
    id: "r4",
    customer: "Amrita Pokhrel",
    email: "amrita.p@email.com",
    product: "Fresh Red Apples",
    rating: 4,
    comment: "Very good flavour. A few were slightly smaller than expected.",
    date: "16 Sep 2026",
    status: "Published" as const,
    reply: "Thank you for the note. We will sort size more carefully next time.",
  },
  {
    id: "r5",
    customer: "Rajesh Gurung",
    email: "rajesh.g@email.com",
    product: "Cherry Tomatoes",
    rating: 4,
    comment: "Sweet tomatoes. Delivery was a day later than promised.",
    date: "14 Sep 2026",
    status: "Pending Reply" as const,
    reply: "",
  },
  {
    id: "r6",
    customer: "Ramesh Thapa",
    email: "ramesh.t@email.com",
    product: "Fresh Red Apples",
    rating: 5,
    comment: "Best apples we have bought this season.",
    date: "30 Aug 2026",
    status: "Published" as const,
    reply: "Thanks Ramesh. Mustang harvest has been strong this year.",
  },
  {
    id: "r7",
    customer: "Sabina Shrestha",
    email: "sabina.s@email.com",
    product: "Cherry Tomatoes",
    rating: 3,
    comment: "Taste was fine but a few were soft on arrival.",
    date: "29 Aug 2026",
    status: "Hidden" as const,
    reply: "",
  },
  {
    id: "r8",
    customer: "Anil Shrestha",
    email: "anil.s@email.com",
    product: "Organic Potatoes",
    rating: 5,
    comment: "Great for daal bhat. Will keep buying from this farm.",
    date: "28 Aug 2026",
    status: "Published" as const,
    reply: "We appreciate your support, Anil.",
  },
];

const reviewMetrics = [
  { label: "Average Rating", value: "4.8", note: "From 128 reviews", icon: Star, tone: "green" },
  { label: "Total Reviews", value: "128", note: "↑ 12 this month", icon: Users, tone: "blue" },
  { label: "Pending Replies", value: "6", note: "Reply to keep trust high", icon: Mail, tone: "lilac" },
  { label: "5-Star Share", value: "78%", note: "↑ 4% vs last month", icon: TrendingUp, tone: "pink" },
];

export function VendorReviews() {
  const { showToast } = useAccount();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [rating, setRating] = useState("All Ratings");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<(typeof vendorReviews)[number] | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replies, setReplies] = useState<Record<string, string>>(() =>
    Object.fromEntries(vendorReviews.filter((item) => item.reply).map((item) => [item.id, item.reply])),
  );

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const rows = useMemo(() => {
    return vendorReviews.map((item) => {
      const reply = replies[item.id] ?? "";
      return {
        ...item,
        reply,
        status: reply && item.status === "Pending Reply" ? ("Published" as const) : item.status,
      };
    });
  }, [replies]);

  const filtered = useMemo(() => {
    return rows.filter((item) => {
      const haystack = `${item.customer} ${item.product} ${item.comment} ${item.status}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesRating = rating === "All Ratings" || String(item.rating) === rating;
      const matchesStatus = status === "All Status" || item.status === status;
      return matchesQuery && matchesRating && matchesStatus;
    });
  }, [query, rating, rows, status]);

  const pageSize = 6;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function exportReviews() {
    const header = "Customer,Product,Rating,Comment,Date,Status,Reply";
    const csvRows = filtered.map(
      (item) =>
        `"${item.customer}","${item.product}",${item.rating},"${item.comment}","${item.date}","${item.status}","${item.reply}"`,
    );
    const blob = new Blob([[header, ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "googledoko-reviews.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Reviews list exported");
  }

  function openReview(item: (typeof vendorReviews)[number]) {
    const current = rows.find((row) => row.id === item.id) ?? item;
    setSelected(current);
    setReplyDraft(current.reply);
  }

  function saveReply() {
    if (!selected) {
      return;
    }
    const text = replyDraft.trim();
    if (!text) {
      showToast("Write a short reply first");
      return;
    }
    setReplies((current) => ({ ...current, [selected.id]: text }));
    showToast(`Reply saved for ${selected.customer}`);
    setSelected(null);
  }

  return (
    <div className="vd-reviews">
      <div className="vd-products-head">
        <div>
          <h1>Customer Reviews</h1>
          <p>See what buyers say about your farm produce and reply in one place.</p>
        </div>
        <button type="button" className="vd-add-btn" onClick={exportReviews}>
          Export Reviews
        </button>
      </div>

      <section className="vd-report-metrics">
        {reviewMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="vd-report-metric" key={metric.label}>
              <header>
                <span>{metric.label}</span>
                <em className={metric.tone}>
                  <Icon size={14} />
                </em>
              </header>
              <strong>{metric.value}</strong>
              <small>{metric.note}</small>
            </article>
          );
        })}
      </section>

      <section className="vd-card vd-products-card">
        <div className="vd-filters">
          <label className="vd-filter-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search reviews..."
              aria-label="Search reviews"
            />
          </label>
          <select
            value={rating}
            onChange={(event) => {
              setRating(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by rating"
          >
            <option>All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
          </select>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            aria-label="Filter by status"
          >
            <option>All Status</option>
            <option>Published</option>
            <option>Pending Reply</option>
            <option>Hidden</option>
          </select>
        </div>

        <div className="vd-table-wrap">
          <table className="vd-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.length ? (
                visible.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="vd-cust-name">
                        <b className="vd-cust-avatar" aria-hidden="true">
                          {customerInitials(item.customer)}
                        </b>
                        <div className="vd-cust-copy">
                          <strong>{item.customer}</strong>
                          <span>{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>{item.product}</td>
                    <td>
                      <div className="vd-review-stars" aria-label={`${item.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            size={13}
                            fill={index < item.rating ? "#fba719" : "none"}
                            color="#fba719"
                          />
                        ))}
                      </div>
                    </td>
                    <td>
                      <p className="vd-review-comment">{item.comment}</p>
                    </td>
                    <td>{item.date}</td>
                    <td>
                      <span className={`vd-status ${item.status.toLowerCase().replace(/\s+/g, "-")}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="vd-row-actions">
                        <button
                          type="button"
                          className="vd-icon-btn"
                          aria-label={`View review from ${item.customer}`}
                          onClick={() => openReview(item)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="vd-icon-btn"
                          aria-label={`Reply to ${item.customer}`}
                          onClick={() => openReview(item)}
                        >
                          <Mail size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>No reviews match this search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="vd-table-foot">
          <span>
            Showing {visible.length} of {filtered.length} reviews
          </span>
          <div className="vd-pager">
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: pages }, (_, index) => (
              <button
                type="button"
                key={index + 1}
                className={currentPage === index + 1 ? "active" : ""}
                onClick={() => setPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              aria-label="Next page"
              onClick={() => setPage((value) => Math.min(pages, value + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {selected ? (
        <VendorModal title={selected.product} onClose={() => setSelected(null)}>
          <p>
            {selected.customer}
            <br />
            {selected.rating} stars · {selected.date} · {selected.status}
          </p>
          <p>{selected.comment}</p>
          <label className="vd-reply-field">
            Reply to customer
            <textarea
              rows={3}
              value={replyDraft}
              onChange={(event) => setReplyDraft(event.target.value)}
              placeholder="Thank the buyer and mention the harvest..."
            />
          </label>
          <button type="button" className="vd-add-btn" onClick={saveReply}>
            Save Reply
          </button>
        </VendorModal>
      ) : null}
    </div>
  );
}

const categoryOptions = [
  { id: "fruits", label: "Fresh Fruits", checked: true },
  { id: "veg", label: "Organic Vegetables", checked: true },
  { id: "grains", label: "Indigenous Grains & Beans", checked: false },
  { id: "spices", label: "Traditional Spices & Herbs", checked: true },
  { id: "dairy", label: "Local Dairy & Eggs", checked: false },
  { id: "honey", label: "Honey & Natural Jams", checked: true },
];

export function VendorProfile() {
  const { user, updateUser, showToast } = useAccount();
  const bannerInput = useRef<HTMLInputElement>(null);
  const [banner, setBanner] = useState(user.vendor?.banner || bannerImage);
  const [businessName, setBusinessName] = useState(user.vendor?.businessName || "");
  const [bio, setBio] = useState(user.vendor?.description || "");
  const [hours, setHours] = useState(user.vendor?.hours || "7:00 AM - 6:00 PM");
  const [sundayHours, setSundayHours] = useState(user.vendor?.sundayHours || "Closed");
  const [storeEmail, setStoreEmail] = useState(user.vendor?.storeEmail || user.email);
  const [storePhone, setStorePhone] = useState(user.vendor?.storePhone || user.phone);
  const [facebook, setFacebook] = useState(user.vendor?.facebook || "");
  const [instagram, setInstagram] = useState(user.vendor?.instagram || "");
  const [preview, setPreview] = useState(false);
  const [categories, setCategories] = useState(
    () =>
      user.vendor?.servedCategories ||
      Object.fromEntries(categoryOptions.map((item) => [item.id, item.checked])),
  );

  async function changeBanner(file: File | undefined) {
    if (!file) {
      return;
    }
    try {
      const next = await readImageFile(file);
      setBanner(next);
      updateUser({ vendor: { banner: next } });
      showToast("Cover banner updated");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Could not update banner");
    }
  }

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!businessName.trim() || !hours.trim() || !storeEmail.trim() || !storePhone.trim()) {
      showToast("Fill the required storefront fields");
      return;
    }
    updateUser({
      email: storeEmail.trim(),
      phone: storePhone.trim(),
      vendor: {
        businessName: businessName.trim(),
        description: bio.trim(),
        banner,
        hours: hours.trim(),
        sundayHours: sundayHours.trim(),
        storeEmail: storeEmail.trim(),
        storePhone: storePhone.trim(),
        facebook: facebook.trim(),
        instagram: instagram.trim(),
        servedCategories: categories,
      },
    });
    showToast("Store profile saved");
  }

  return (
    <div className="vd-profile">
      <div className="vd-products-head">
        <div>
          <h1>Store / Farm Profile Editor</h1>
          <p>
            Customize your public storefront layout and contact information shown to
            marketplace customers.
          </p>
        </div>
      </div>

      <div className="vd-banner-wrap">
        <span className="vd-banner-label">Storefront Banner</span>
        <div className="vd-banner">
          <img src={banner} alt="Storefront cover banner" />
          <input
            ref={bannerInput}
            className="vd-file-hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-label="Upload cover banner"
            onChange={(event) => {
              void changeBanner(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            className="vd-banner-btn"
            onClick={() => bannerInput.current?.click()}
          >
            <Camera size={14} />
            Change Cover Banner
          </button>
        </div>
      </div>

      <form className="vd-profile-grid" onSubmit={saveProfile}>
        <section className="vd-card">
          <h2>Storefront Details</h2>

          <label className="vd-field">
            <span>Official Registered Business Name <i>*</i></span>
            <input
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="e.g. Himalayan Fresh Farm Pvt. Ltd."
            />
          </label>

          <label className="vd-field">
            <span>Farm / Business Bio (Public)</span>
            <textarea
              rows={4}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Describe your harvesting tradition, pesticide-free products, altitude of farming, organic certifications..."
            />
          </label>

          <div className="vd-two">
            <label className="vd-field">
              <span>Weekly Opening Hours (Mon-Sat) <i>*</i></span>
              <input
                value={hours}
                onChange={(event) => setHours(event.target.value)}
                placeholder="e.g. 7:00 AM - 6:00 PM"
              />
            </label>
            <label className="vd-field">
              <span>Sunday Hours (Optional)</span>
              <input
                value={sundayHours}
                onChange={(event) => setSundayHours(event.target.value)}
                placeholder="e.g. Closed / Holiday"
              />
            </label>
          </div>

          <div className="vd-two">
            <label className="vd-field">
              <span>Public Store Email <i>*</i></span>
              <input
                value={storeEmail}
                onChange={(event) => setStoreEmail(event.target.value)}
                placeholder="e.g. shop@himalayanfresh.com"
              />
            </label>
            <label className="vd-field">
              <span>Public Store Helpline <i>*</i></span>
              <input
                value={storePhone}
                onChange={(event) => setStorePhone(event.target.value)}
                placeholder="e.g. +977-985XXXXXXXX"
              />
            </label>
          </div>
        </section>

        <div className="vd-add-side">
          <section className="vd-card">
            <h2>Market Categorization</h2>
            <p className="vd-check-legend">Categories Served (Select all that apply)</p>
            <ul className="vd-checks">
              {categoryOptions.map((item) => (
                <li key={item.id}>
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(categories[item.id])}
                      onChange={() =>
                        setCategories((current) => ({
                          ...current,
                          [item.id]: !current[item.id],
                        }))
                      }
                    />
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>

            <h2>Social Media Connections</h2>
            <label className="vd-field">
              <span>Facebook Page Link</span>
              <input
                value={facebook}
                onChange={(event) => setFacebook(event.target.value)}
                placeholder="https://facebook.com/yourfarm"
              />
            </label>
            <label className="vd-field">
              <span>Instagram Handle</span>
              <input
                value={instagram}
                onChange={(event) => setInstagram(event.target.value)}
                placeholder="e.g. @himalayan_fresh_nepal"
              />
            </label>
          </section>

          <div className="vd-add-actions">
            <button type="button" className="vd-draft" onClick={() => setPreview(true)}>
              Preview Public Store
            </button>
            <button type="submit" className="vd-add-btn">
              Save Profile Changes
            </button>
          </div>
        </div>
      </form>

      {preview ? (
        <VendorModal title={businessName || "Public store preview"} onClose={() => setPreview(false)}>
          <img className="vd-preview-banner" src={banner} alt="" />
          <p>{bio || "Your farm bio will appear here."}</p>
          <p>
            {hours} · Sunday {sundayHours || "Closed"}
            <br />
            {storeEmail} · {storePhone}
          </p>
          <p>
            {categoryOptions
              .filter((item) => categories[item.id])
              .map((item) => item.label)
              .join(" · ") || "No categories selected"}
          </p>
        </VendorModal>
      ) : null}
    </div>
  );
}

const defaultVendorStoreSettings: VendorStoreSettings = {
  orderAlerts: true,
  stockAlerts: true,
  reviewAlerts: true,
  payoutAlerts: false,
  emailAlerts: true,
  smsAlerts: false,
  publicStore: true,
  autoAccept: false,
  cashOnDelivery: true,
  esewa: true,
  khalti: true,
  fulfillment: "Same-day Bagmati",
};

export function VendorSettings() {
  const { user, updateUser, showToast, language, setLanguage } = useAccount();
  const [settings, setSettings] = useState<VendorStoreSettings>({
    ...defaultVendorStoreSettings,
    ...user.vendor?.settings,
  });
  const [phone, setPhone] = useState(user.phone);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");

  function toggleSetting(key: keyof VendorStoreSettings, title: string) {
    setSettings((current) => {
      const value = current[key];
      if (typeof value !== "boolean") {
        return current;
      }
      const next = { ...current, [key]: !value };
      showToast(`${title} ${!value ? "turned on" : "turned off"}`);
      return next;
    });
  }

  function saveSettings() {
    if (!phone.trim()) {
      showToast("Add a helpline number for customers");
      return;
    }
    updateUser({ phone: phone.trim(), vendor: { settings } });
    showToast(
      settings.publicStore ? "Store settings saved" : "Settings saved. Public store is hidden",
    );
  }

  function updatePassword(event: FormEvent) {
    event.preventDefault();
    if (!currentPassword.trim() || !nextPassword.trim()) {
      showToast("Enter your current and new password");
      return;
    }
    if (currentPassword !== DEMO_PASSWORD) {
      showToast("Current password is incorrect");
      return;
    }
    if (nextPassword.length < 6) {
      showToast("New password must be at least 6 characters");
      return;
    }
    setCurrentPassword("");
    setNextPassword("");
    showToast("Password updated for this session");
  }

  return (
    <div className="vd-settings">
      <div className="vd-products-head">
        <div>
          <h1>Store Settings</h1>
          <p>Control alerts, payments, and how your farm store works on GoogleDoko.</p>
        </div>
        <button type="button" className="vd-add-btn" onClick={saveSettings}>
          Save Settings
        </button>
      </div>

      <div className="vd-profile-grid">
        <div>
          <section className="vd-card">
            <h2>Notifications</h2>
            {(
              [
                ["orderAlerts", "Order alerts", "New orders, cancellations, and COD updates"],
                ["stockAlerts", "Low stock reminders", "When a harvest item drops below 10 units"],
                ["reviewAlerts", "Review alerts", "When a customer rates your produce"],
                ["payoutAlerts", "Payout alerts", "When eSewa or Khalti settlement is ready"],
                ["emailAlerts", "Email notifications", "Send copies to your store email"],
                ["smsAlerts", "SMS notifications", "Short alerts on your registered number"],
              ] as const
            ).map(([key, title, meta]) => (
              <div className="vd-toggle-row" key={key}>
                <div>
                  <strong>{title}</strong>
                  <span>{meta}</span>
                </div>
                <button
                  type="button"
                  className={`vd-switch${settings[key] ? " on" : ""}`}
                  aria-pressed={settings[key]}
                  aria-label={title}
                  onClick={() => toggleSetting(key, title)}
                >
                  <span />
                </button>
              </div>
            ))}
          </section>

          <section className="vd-card">
            <h2>Fulfillment & Payments</h2>
            <label className="vd-field">
              <span>Default delivery promise</span>
              <select
                value={settings.fulfillment}
                onChange={(event) =>
                  setSettings((current) => ({ ...current, fulfillment: event.target.value }))
                }
              >
                <option>Same-day Bagmati</option>
                <option>2-day nationwide</option>
                <option>Farm pickup only</option>
              </select>
            </label>
            {(
              [
                ["publicStore", "Public store page", "Visible on the marketplace after verification"],
                ["autoAccept", "Auto-accept orders", "Skip the incoming queue for prepaid orders"],
                ["cashOnDelivery", "Cash on delivery", "Accept COD within your delivery area"],
                ["esewa", "eSewa payments", "Collect prepaid orders through eSewa"],
                ["khalti", "Khalti payments", "Collect prepaid orders through Khalti"],
              ] as const
            ).map(([key, title, meta]) => (
              <div className="vd-toggle-row" key={key}>
                <div>
                  <strong>{title}</strong>
                  <span>{meta}</span>
                </div>
                <button
                  type="button"
                  className={`vd-switch${settings[key] ? " on" : ""}`}
                  aria-pressed={settings[key]}
                  aria-label={title}
                  onClick={() => toggleSetting(key, title)}
                >
                  <span />
                </button>
              </div>
            ))}
          </section>
        </div>

        <div className="vd-add-side">
          <section className="vd-card">
            <h2>Account</h2>
            <label className="vd-field">
              <span>Login email</span>
              <input value={user.email} readOnly aria-readonly="true" />
            </label>
            <label className="vd-field">
              <span>Helpline number <i>*</i></span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+977-98XXXXXXXX"
              />
            </label>
            <label className="vd-field">
              <span>Dashboard language</span>
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value === "Nepali" ? "Nepali" : "English")
                }
              >
                <option>English</option>
                <option>Nepali</option>
              </select>
            </label>
            <p className="vd-check-legend">
              Store name and banner are edited in Store Profile. This page is for how the farm
              account runs.
            </p>
          </section>

          <section className="vd-card">
            <h2>Security</h2>
            <form onSubmit={updatePassword}>
              <label className="vd-field">
                <span>Current password</span>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </label>
              <label className="vd-field">
                <span>New password</span>
                <input
                  type="password"
                  value={nextPassword}
                  onChange={(event) => setNextPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </label>
              <button type="submit" className="vd-add-btn">
                Update Password
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
