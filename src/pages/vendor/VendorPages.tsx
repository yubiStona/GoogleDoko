import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Activity,
  Bell,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Diamond,
  Equal,
  Eye,
  EyeOff,
  AlertCircle,
  ImagePlus,
  Mail,
  Package,
  Pencil,
  RotateCcw,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { useAccount } from "../../context/AccountContext";
import { type VendorStoreSettings } from "../../data/authOptions";
import {
  api,
  type VendorOrder,
  type VendorSalesData,
  type VendorReportsData,
  type VendorCustomer,
  type VendorReviewsData,
  type VendorReviewItem,
} from "../../api/client";
import { getFormErrorScrollHandler } from "../../utils/formErrorNavigation";
import { useGetVendorOrdersQuery } from "../../store/api/apiSlice";
import { getAllowedUnitsForCategory } from "../../utils/productUnits";
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

export function VendorProducts() {
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("Active Status");
  const [sort, setSort] = useState("price-high");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useAccount();

  const loadProducts = () => {
    setLoading(true);
    api.vendorProducts()
      .then((res) => {
        if (Array.isArray(res)) {
          setItems(
            res.map((p: any) => ({
              id: p.id,
              name: p.name,
              detail: p.description || p.origin || "Local harvest",
              category: p.category || "General",
              price: Number(p.price || 0),
              stock: `${p.stock ?? 0} ${p.weight || "kg"}`,
              status: p.active === 1 ? "Active" : "Inactive",
              image: p.image || "/src/frontend/assets/images/organic-vegetables.jpg",
            }))
          );
        } else {
          setItems([]);
        }
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    try {
      await api.vendorRemoveProduct(productId);
      showToast("Product removed successfully");
      loadProducts();
    } catch (err: any) {
      showToast(err.message || "Failed to remove product");
    }
  };

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

      {!loading && items.length === 0 ? (
        <section
          className="vd-card vd-empty-card"
          style={{ padding: "50px 24px", textAlign: "center" }}
        >
          <Package size={48} color="#168d51" style={{ margin: "0 auto 12px" }} />
          <h3>You haven't added any products yet</h3>
          <p style={{ color: "#6b7280", margin: "8px 0 20px" }}>
            Start listing your organic produce, spices, dairy, or artisanal crafts for customers across Nepal.
          </p>
          <Link to="/vendor/products/new" className="vd-add-btn">
            + Add First Product
          </Link>
        </section>
      ) : (
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
                          to={`/vendor/products/${item.id}/edit`}
                          className="vd-icon-btn"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          type="button"
                          className="vd-icon-btn danger"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => handleDelete(item.id)}
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
            <span>Showing {filtered.length} products</span>
            <div className="vd-pager">
              <button
                type="button"
                aria-label="Previous page"
                onClick={() => setPage(1)}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className={page === 1 ? "active" : ""}
                onClick={() => setPage(1)}
              >
                1
              </button>
            </div>
          </div>
        </section>
      )}
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
  unit: yup.string().required("Selling unit is required").trim(),
  physicalWeight: yup.string().default("").trim(),
  sku: yup.string().default("").trim(),
  origin: yup.string().default("Mustang District, Nepal"),
  freshness: yup.string().default("").trim(),
  delivery: yup.string().default("").trim(),
});

type AddProductFormData = yup.InferType<typeof addProductSchema>;

export function VendorAddProduct() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useAccount();
  const [publish, setPublish] = useState(true);
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [availableLifestyles, setAvailableLifestyles] = useState<any[]>([]);
  const [selectedLifestyles, setSelectedLifestyles] = useState<string[]>([]);
  const [lifestyleSubcat, setLifestyleSubcat] = useState<string>("");

  useEffect(() => {
    api.lifestyles()
      .then((res) => {
        if (Array.isArray(res)) setAvailableLifestyles(res);
      })
      .catch(() => {});
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
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
      unit: "kg",
      physicalWeight: "",
      sku: "",
      origin: "Mustang District, Nepal",
      freshness: "",
      delivery: "",
    },
  });

  const selectedCategory = watch("category");
  const allowedUnits = useMemo(() => {
    return getAllowedUnitsForCategory(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    api.vendorProductById(id)
      .then((p: any) => {
        if (!active) return;
        const unit = p.sellingUnit || (p.weight || "1 kg").split(" ").pop() || "piece";
        reset({
          name: p.name || "",
          description: p.description || "",
          category: p.category || "Fruits",
          price: String(p.price || ""),
          stock: String(p.stock ?? 100),
          unit,
          physicalWeight: p.weight || "",
          origin: p.origin || "Mustang District, Nepal",
          sku: "",
          discount: "",
          freshness: "",
          delivery: "",
        });
        if (p.image) setUploadedImageUrl(p.image);
        if (p.lifestyleIds && Array.isArray(p.lifestyleIds)) {
          setSelectedLifestyles(p.lifestyleIds);
        }
        if (p.subcategory) {
          setLifestyleSubcat(p.subcategory);
        }
        setPublish(p.active === 1);
      })
      .catch((err) => {
        showToast(err.message || "Failed to load product details");
        navigate("/vendor/products");
      });

    return () => {
      active = false;
    };
  }, [id, reset, navigate, showToast]);

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
    const category = data.category || "Others";
    const sellingUnit = data.unit || "piece";
    const weight = data.physicalWeight?.trim() || `${data.stock} ${sellingUnit}`;
    const payload: any = {
      name: data.name.trim(),
      description: data.description || "",
      category,
      sellingUnit,
      weight,
      price: Number(data.price),
      stock: Number(data.stock) || 0,
      origin: data.origin,
      image: uploadedImageUrl || "",
      active: asDraft ? 0 : (publish ? 1 : 0),
      lifestyleIds: selectedLifestyles,
      lifestyleSubcategory: lifestyleSubcat.trim() || undefined,
    };
    try {
      await api.vendorSaveProduct(id || null, payload);
      showToast(
        isEdit
          ? `${data.name.trim()} updated successfully`
          : asDraft
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
          <h1>{isEdit ? "Edit Product Listing" : "Add New Product"}</h1>
          <p>
            {isEdit
              ? "Update your produce details, pricing, inventory or description."
              : "Enter all details to list your fresh agricultural yield on the public marketplace."}
          </p>
        </div>
      </div>

      <form className="vd-add-grid" onSubmit={handleSubmit((data) => onSaveProduct(data, !publish), getFormErrorScrollHandler())} noValidate>
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
                <option value="Fruits">Fruits</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Spices">Spices</option>
                <option value="Dairy & Eggs">Dairy &amp; Eggs</option>
                <option value="Grains">Grains &amp; Rice</option>
                <option value="Honey">Honey &amp; Preserves</option>
                <option value="Furniture">Furniture</option>
                <option value="Home & Living">Home &amp; Living</option>
                <option value="Kitchen & Dining">Kitchen &amp; Dining</option>
                <option value="Fashion & Accessories">Fashion &amp; Accessories</option>
                <option value="Garden & Outdoor">Garden &amp; Outdoor</option>
                <option value="Beauty & Personal Care">Beauty &amp; Personal Care</option>
                <option value="Others">Others</option>
              </select>
            </label>
            <label className="vd-field">
              <span>Subcategory</span>
              <input
                {...register("subcategory")}
                placeholder="e.g. Tables, Chairs, Apples, Dinnerware"
              />
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
              <span>Selling Unit <i>*</i></span>
              <select {...register("unit")}>
                <option value="">Select Selling Unit</option>
                {allowedUnits.map((u) => (
                  <option key={u} value={u}>
                    Per {u} ({u.charAt(0).toUpperCase() + u.slice(1)})
                  </option>
                ))}
              </select>
              {errors.unit?.message && (
                <span style={{ color: "#ef4444", fontSize: 11, display: "block" }}>
                  {errors.unit.message}
                </span>
              )}
            </label>
          </div>

          <div className="vd-two">
            <label className="vd-field">
              <span>SKU (Stock Keeping Unit)</span>
              <input {...register("sku")} placeholder="e.g. HFF-APP-MUSTANG-01" />
            </label>
            <label className="vd-field">
              <span>Physical Weight / Dimensions (Optional)</span>
              <input
                {...register("physicalWeight")}
                placeholder="e.g. 35 kg net, or 120x80 cm"
              />
            </label>
          </div>

          {/* Shop by Lifestyle Collection selector */}
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#1f2937", display: "block", marginBottom: 4 }}>
              Shop by Lifestyle Collections (Optional)
            </span>
            <small style={{ fontSize: 12, color: "#6b7280", display: "block", marginBottom: 12 }}>
              Select which lifestyle collections this product belongs to (e.g. Furniture, Home & Living, Kitchen, Fashion).
            </small>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8, marginBottom: 14 }}>
              {availableLifestyles.map((ls) => {
                const checked = selectedLifestyles.includes(ls.id);
                return (
                  <label
                    key={ls.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      borderRadius: 8,
                      border: checked ? "1.5px solid #168d51" : "1px solid #e5e7eb",
                      background: checked ? "#edf8f0" : "#ffffff",
                      cursor: "pointer",
                      fontSize: 12.5,
                      fontWeight: checked ? 600 : 400,
                      color: checked ? "#0f5431" : "#374151",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLifestyles((prev) => [...prev, ls.id]);
                        } else {
                          setSelectedLifestyles((prev) => prev.filter((id) => id !== ls.id));
                        }
                      }}
                      style={{ accentColor: "#168d51", width: 15, height: 15 }}
                    />
                    <span>{ls.name}</span>
                  </label>
                );
              })}
            </div>

            {selectedLifestyles.length > 0 && (
              <label className="vd-field" style={{ marginBottom: 0 }}>
                <span>Lifestyle Subcategory (Optional)</span>
                <input
                  type="text"
                  value={lifestyleSubcat}
                  onChange={(e) => setLifestyleSubcat(e.target.value)}
                  placeholder="e.g. Tables, Rugs, Dinnerware, Plants, Skincare, Bags"
                />
              </label>
            )}
          </div>
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
                <option value="Bhaktapur, Nepal">Bhaktapur, Nepal</option>
                <option value="Chitwan, Nepal">Chitwan, Nepal</option>
                <option value="Damak, Nepal">Damak, Nepal</option>
                <option value="Dang, Nepal">Dang, Nepal</option>
                <option value="Ilam, Nepal">Ilam, Nepal</option>
                <option value="Jhapa, Nepal">Jhapa, Nepal</option>
                <option value="Kathmandu, Nepal">Kathmandu, Nepal</option>
                <option value="Kavre, Nepal">Kavre, Nepal</option>
                <option value="Kullu, HP">Kullu, HP</option>
                <option value="Mustang, Nepal">Mustang, Nepal</option>
                <option value="Nepalgunj, Nepal">Nepalgunj, Nepal</option>
                <option value="Nuwakot, Nepal">Nuwakot, Nepal</option>
                <option value="Palpa, Nepal">Palpa, Nepal</option>
                <option value="Siraha, Nepal">Siraha, Nepal</option>
                <option value="Sunsari, Nepal">Sunsari, Nepal</option>
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
              {isEdit ? "Update Listing" : publish ? "Publish Product Live" : "Save Inactive Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

const vendorOrderTabs = [
  { id: "all", label: "All Orders" },
  { id: "incoming", label: "New Incoming" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;

export function VendorOrders() {
  const { showToast } = useAccount();
  const [tab, setTab] = useState<(typeof vendorOrderTabs)[number]["id"]>("incoming");
  const { data: serverVendorOrders, refetch } = useGetVendorOrdersQuery();
  const [orders, setOrders] = useState<VendorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      try {
        setLoading(true);
        const data = await api.vendorOrders();
        if (active) {
          setOrders(data || []);
        }
      } catch {
        if (active && serverVendorOrders) {
          setOrders(serverVendorOrders as unknown as VendorOrder[]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadOrders();
    return () => {
      active = false;
    };
  }, [serverVendorOrders]);

  const counts = useMemo(() => {
    const c = { all: orders.length, incoming: 0, preparing: 0, ready: 0, shipped: 0, delivered: 0, cancelled: 0 };
    for (const o of orders) {
      const s = (o.status || "").toLowerCase();
      if (s === "pending" || s === "incoming") c.incoming++;
      else if (s === "preparing") c.preparing++;
      else if (s === "ready") c.ready++;
      else if (s === "shipped") c.shipped++;
      else if (s === "delivered" || s === "completed") c.delivered++;
      else if (s === "cancelled" || s === "declined") c.cancelled++;
    }
    return c;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (tab === "all") return orders;
    return orders.filter((o) => {
      const s = (o.status || "").toLowerCase();
      if (tab === "incoming") return s === "pending" || s === "incoming";
      if (tab === "preparing") return s === "preparing";
      if (tab === "ready") return s === "ready";
      if (tab === "shipped") return s === "shipped";
      if (tab === "delivered") return s === "delivered" || s === "completed";
      if (tab === "cancelled") return s === "cancelled" || s === "declined";
      return true;
    });
  }, [orders, tab]);

  async function handleUpdateStatus(orderId: string, nextStatus: string) {
    try {
      setUpdatingId(orderId);
      const res = await api.vendorUpdateOrderStatus(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: res.status || nextStatus,
                paymentStatus: res.paymentStatus || o.paymentStatus,
              }
            : o,
        ),
      );
      if (refetch) refetch();
      showToast(`Order #${orderId} marked as ${nextStatus}`);
    } catch (err: any) {
      showToast(err.message || `Failed to update status to ${nextStatus}`);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="vd-orders">
      <div className="vd-products-head">
        <div>
          <h1>Vendor Orders Triage</h1>
          <p>Fulfill incoming orders and update state for clients in real-time.</p>
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
            <b>{counts[item.id as keyof typeof counts] ?? 0}</b>
          </button>
        ))}
      </div>

      {loading ? (
        <section className="vd-card">
          <p>Loading real-time customer orders...</p>
        </section>
      ) : counts.incoming > 0 && tab === "incoming" ? (
        <p className="vd-order-alert">
          <Bell size={16} />
          {counts.incoming} {counts.incoming === 1 ? "Order Needs" : "Orders Need"} Immediate Action
        </p>
      ) : null}

      {!loading && filteredOrders.length > 0 ? (
        <div className="vd-order-list">
          {filteredOrders.map((order) => {
            const rawStatus = (order.status || "Pending").toLowerCase();
            const isUpdating = updatingId === order.id;
            const itemsSummary = Array.isArray(order.items)
              ? order.items.map((it: any) => `${it.name} x ${it.quantity}`).join(", ")
              : "Produce Items";

            return (
              <article className="vd-card vd-order-card" key={order.id}>
                <header>
                  <div>
                    <strong>{order.id}</strong>
                    <span className={`vd-incoming-tag vd-status-${rawStatus}`}>
                      {order.status || "Pending"}
                    </span>
                  </div>
                  <time>{order.date ? new Date(order.date).toLocaleString() : "Recently placed"}</time>
                </header>

                <div className="vd-order-grid">
                  <div>
                    <small>CUSTOMER &amp; CONTACT</small>
                    <strong>{order.recipientName || "Customer"}</strong>
                    <p>
                      Phone: {order.recipientPhone || "N/A"} | Address: {order.deliveryAddress || "N/A"}
                    </p>
                  </div>
                  <div>
                    <small>ITEMS REQUESTED</small>
                    <p>{itemsSummary}</p>
                  </div>
                  <div className="vd-order-total">
                    <small>TOTAL VALUE</small>
                    <strong>Rs. {Number(order.total || 0).toLocaleString()}</strong>
                    <p>
                      {order.paymentMethod || "COD"} ({order.paymentStatus || "Pending"})
                    </p>
                  </div>
                </div>

                <footer>
                  <div className="vd-stage-selector" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <small style={{ color: "#666" }}>Stage:</small>
                    <select
                      value={order.status || "Pending"}
                      disabled={isUpdating}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      style={{ padding: "0.3rem 0.6rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {(rawStatus === "pending" || rawStatus === "incoming") && (
                      <>
                        <button
                          type="button"
                          className="vd-decline"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, "Cancelled")}
                        >
                          Decline Order
                        </button>
                        <button
                          type="button"
                          className="vd-add-btn"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, "Preparing")}
                        >
                          Accept &amp; Mark Preparing
                        </button>
                      </>
                    )}

                    {rawStatus === "preparing" && (
                      <>
                        <button
                          type="button"
                          className="vd-decline"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, "Cancelled")}
                        >
                          Cancel Order
                        </button>
                        <button
                          type="button"
                          className="vd-add-btn"
                          disabled={isUpdating}
                          onClick={() => handleUpdateStatus(order.id, "Ready")}
                        >
                          Mark Ready for Pickup
                        </button>
                      </>
                    )}

                    {rawStatus === "ready" && (
                      <button
                        type="button"
                        className="vd-add-btn"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order.id, "Shipped")}
                      >
                        Dispatch / Mark Shipped
                      </button>
                    )}

                    {rawStatus === "shipped" && (
                      <button
                        type="button"
                        className="vd-add-btn"
                        disabled={isUpdating}
                        onClick={() => handleUpdateStatus(order.id, "Delivered")}
                      >
                        Confirm Delivery
                      </button>
                    )}
                  </div>
                </footer>
              </article>
            );
          })}
        </div>
      ) : !loading ? (
        <section className="vd-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <Package size={40} style={{ margin: "0 auto 1rem", color: "#888" }} />
          <h3>
            {tab === "all"
              ? "No customer orders yet"
              : `No orders currently in the ${vendorOrderTabs.find((t) => t.id === tab)?.label || tab} stage`}
          </h3>
          <p style={{ color: "#666", maxWidth: 450, margin: "0.5rem auto 0" }}>
            {tab === "all"
              ? "When customers place orders for your farm produce, they will automatically appear here with full customer, delivery, and payment details."
              : `Orders will transition here as you advance them through fulfillment.`}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function customerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : (parts[0]?.[1] ?? "");
  return `${first}${last}`.toUpperCase();
}

export function VendorCustomers() {
  const { showToast } = useAccount();
  const [params] = useSearchParams();
  const [customers, setCustomers] = useState<VendorCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [location, setLocation] = useState("All Locations");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<VendorCustomer | null>(null);

  useEffect(() => {
    let active = true;
    async function loadCustomers() {
      try {
        setLoading(true);
        const data = await api.vendorCustomers();
        if (active) setCustomers(data || []);
      } catch {
        if (active) setCustomers([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadCustomers();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const locations = useMemo(() => {
    const list = Array.from(new Set(customers.map((c) => c.location).filter(Boolean)));
    return ["All Locations", ...list];
  }, [customers]);

  const metrics = useMemo(() => {
    const total = customers.length;
    const repeat = customers.filter((c) => (c.orders || c.ordersCount || 0) > 1).length;
    const newBuyers = customers.filter((c) => (c.orders || c.ordersCount || 0) <= 1).length;
    const totalSpent = customers.reduce((sum, c) => sum + (c.spent || c.totalSpent || 0), 0);
    const avgSpend = total > 0 ? Math.round(totalSpent / total) : 0;
    const repeatPct = total > 0 ? Math.round((repeat / total) * 100) : 0;

    return [
      { label: "Total Customers", value: total.toLocaleString(), note: `${total} unique buyers`, icon: Users, tone: "green" },
      { label: "Repeat Buyers", value: repeat.toLocaleString(), note: `${repeatPct}% repeat rate`, icon: Users, tone: "blue" },
      { label: "New Buyers", value: newBuyers.toLocaleString(), note: `${newBuyers} first-time buyers`, icon: UserPlus, tone: "lilac" },
      { label: "Avg Lifetime Spend", value: `Rs. ${avgSpend.toLocaleString()}`, note: `Based on actual sales`, icon: Wallet, tone: "pink" },
    ];
  }, [customers]);

  const filtered = useMemo(() => {
    return customers.filter((item) => {
      const haystack = `${item.name} ${item.email} ${item.phone} ${item.location}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesLocation = location === "All Locations" || item.location === location;
      const itemStatus = (item.orders || item.ordersCount || 0) > 1 ? "Repeat" : "New";
      const matchesStatus = status === "All Status" || itemStatus === status || item.status === status;
      return matchesQuery && matchesLocation && matchesStatus;
    });
  }, [customers, location, query, status]);

  const pageSize = 8;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function exportCustomers() {
    if (!filtered.length) {
      showToast("No customers available to export");
      return;
    }
    const header = "Name,Email,Phone,Location,Orders,Total Spent,Last Order,Status";
    const rows = filtered.map((item) => {
      const ordersCount = item.orders || item.ordersCount || 0;
      const spent = item.spent || item.totalSpent || 0;
      const lastOrder = item.lastOrder || item.lastOrderDate || "N/A";
      const statusLabel = ordersCount > 1 ? "Repeat" : "New";
      return `"${item.name}","${item.email}","${item.phone}","${item.location}",${ordersCount},${spent},"${lastOrder}","${statusLabel}"`;
    });
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
          <p>See genuine buyers who purchased your produce and their lifetime frequency.</p>
        </div>
        <button type="button" className="vd-add-btn" onClick={exportCustomers}>
          Export Customers
        </button>
      </div>

      <section className="vd-report-metrics">
        {metrics.map((metric) => {
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
              placeholder="Search customers by name, phone, email, or city..."
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
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
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
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                    Loading genuine customer insights...
                  </td>
                </tr>
              ) : visible.length ? (
                visible.map((item) => {
                  const ordersCount = item.orders || item.ordersCount || 0;
                  const spent = item.spent || item.totalSpent || 0;
                  const lastOrder = item.lastOrder || item.lastOrderDate || "N/A";
                  const statusLabel = ordersCount > 1 ? "Repeat" : "New";

                  return (
                    <tr key={item.id || item.email}>
                      <td>
                        <div className="vd-cust-name">
                          <b className="vd-cust-avatar" aria-hidden="true">
                            {customerInitials(item.name || "Customer")}
                          </b>
                          <div className="vd-cust-copy">
                            <strong>{item.name || "Customer"}</strong>
                            <span>{item.email || "No email"}</span>
                          </div>
                        </div>
                      </td>
                      <td>{item.phone || "N/A"}</td>
                      <td>{item.location || "Kathmandu"}</td>
                      <td>{ordersCount}</td>
                      <td>Rs. {Number(spent).toLocaleString()}</td>
                      <td>{lastOrder}</td>
                      <td>
                        <span className={`vd-status ${statusLabel.toLowerCase()}`}>
                          {statusLabel}
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
                          {item.email ? (
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
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2.5rem" }}>
                    {customers.length === 0
                      ? "No customer orders yet. Customers will appear here as soon as orders are placed."
                      : "No customers match this filter criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="vd-table-foot">
          <span>
            Showing {visible.length} of {filtered.length} customers
          </span>
          <div className="vd-pager">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              disabled={currentPage >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
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
            {selected.orders || selected.ordersCount || 0} orders · Rs.{" "}
            {Number(selected.spent || selected.totalSpent || 0).toLocaleString()} spent
            <br />
            Last order: {selected.lastOrder || selected.lastOrderDate || "N/A"}
          </p>
          {selected.email ? (
            <button
              type="button"
              className="vd-add-btn"
              onClick={() => {
                window.location.href = `mailto:${selected.email}`;
              }}
            >
              Message Customer
            </button>
          ) : null}
        </VendorModal>
      ) : null}
    </div>
  );
}

export function VendorReports() {
  const [range, setRange] = useState("Last 30 Days");
  const [reportData, setReportData] = useState<VendorReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function fetchReports() {
      try {
        setLoading(true);
        const data = await api.vendorReports(range);
        if (active) setReportData(data);
      } catch {
        if (active) {
          setReportData({
            range,
            grossRevenue: 0,
            totalOrders: 0,
            avgOrderValue: 0,
            completedOrders: 0,
            bars: [
              { day: "Mon", height: 0, amount: 0, orders: 0 },
              { day: "Tue", height: 0, amount: 0, orders: 0 },
              { day: "Wed", height: 0, amount: 0, orders: 0 },
              { day: "Thu", height: 0, amount: 0, orders: 0 },
              { day: "Fri", height: 0, amount: 0, orders: 0 },
              { day: "Sat", height: 0, amount: 0, orders: 0 },
              { day: "Sun", height: 0, amount: 0, orders: 0 },
            ],
            categories: [],
            transactions: [],
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchReports();
    return () => {
      active = false;
    };
  }, [range]);

  const metrics = useMemo(() => {
    const rev = reportData?.grossRevenue || 0;
    const orders = reportData?.totalOrders || 0;
    const avg = reportData?.avgOrderValue || 0;
    const completed = reportData?.completedOrders || 0;
    const completionRate = orders > 0 ? Math.round((completed / orders) * 100) : 0;

    return [
      {
        label: "Total Revenue",
        value: `Rs. ${rev.toLocaleString()}`,
        note: `${orders} orders received`,
        icon: Diamond,
        tone: "lilac",
      },
      {
        label: "Avg Order Value",
        value: `Rs. ${avg.toLocaleString()}`,
        note: `Across ${orders} sales`,
        icon: Equal,
        tone: "blue",
      },
      {
        label: "Fulfillment Rate",
        value: `${completionRate}%`,
        note: `${completed} orders delivered`,
        icon: Activity,
        tone: "green",
      },
      {
        label: "Completed Orders",
        value: `${completed}`,
        note: `Delivered to customers`,
        icon: RotateCcw,
        tone: "pink",
      },
    ];
  }, [reportData]);

  const bars = reportData?.bars || [];
  const categories = reportData?.categories || [];
  const transactions = reportData?.transactions || [];

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
        {metrics.map((metric) => {
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

      <div className="vd-report-mid">
        <section className="vd-card vd-report-chart">
          <h2>Revenue Sales Trend</h2>
          {bars.length > 0 && bars.some((b) => b.height > 0) ? (
            <div className="vd-bars" role="img" aria-label="Revenue sales trend for the week">
              {bars.map((bar, index) => (
                <div className="vd-bar-col" key={`${bar.day}-${index}`}>
                  <span className="vd-bar" style={{ height: `${Math.max(4, bar.height)}%` }} />
                  <small>{bar.day}</small>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#777" }}>
              <p>No revenue recorded for {range.toLowerCase()}.</p>
              <small>Trend bars will reflect daily revenue as customers buy produce.</small>
            </div>
          )}
        </section>

        <section className="vd-card vd-report-cats">
          <h2>Sales by Category</h2>
          {categories.length > 0 ? (
            <ul>
              {categories.map((item) => (
                <li key={item.name}>
                  <div>
                    <strong>
                      <i style={{ background: item.color || "#176136" }} />
                      {item.name}
                    </strong>
                    <span>
                      {item.share} ({item.amount})
                    </span>
                  </div>
                  <b style={{ width: item.width || item.share, background: item.color || "#176136" }} />
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#777" }}>
              <p>No category breakdown available.</p>
              <small>Category shares are computed dynamically from completed sales.</small>
            </div>
          )}
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
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                    Loading real transactions...
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.id}</strong>
                    </td>
                    <td>{row.customer}</td>
                    <td>{row.date}</td>
                    <td>{row.amount}</td>
                    <td>
                      <span className={`vd-status ${(row.status || "").toLowerCase().replace(/\s+/g, "-")}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#777" }}>
                    No recent transactions in this time window.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function VendorSales() {
  const { showToast } = useAccount();
  const [params] = useSearchParams();
  const [salesData, setSalesData] = useState<VendorSalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [payment, setPayment] = useState("All Payments");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    let active = true;
    async function loadSales() {
      try {
        setLoading(true);
        const data = await api.vendorSales();
        if (active) setSalesData(data);
      } catch {
        if (active) {
          setSalesData({
            todaySales: 0,
            weeklySales: 0,
            monthlySales: 0,
            completedOrders: 0,
            pendingPayout: 0,
            transactions: [],
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadSales();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const transactions = salesData?.transactions || [];

  const metrics = useMemo(() => {
    const today = salesData?.todaySales || 0;
    const week = salesData?.weeklySales || 0;
    const month = salesData?.monthlySales || 0;
    const pending = salesData?.pendingPayout || 0;

    return [
      {
        label: "Today's Sales",
        value: `Rs. ${today.toLocaleString()}`,
        note: today > 0 ? "Real-time today's total" : "No orders today yet",
        icon: TrendingUp,
        tone: "green",
      },
      {
        label: "This Week",
        value: `Rs. ${week.toLocaleString()}`,
        note: "Last 7 days total",
        icon: Wallet,
        tone: "blue",
      },
      {
        label: "This Month",
        value: `Rs. ${month.toLocaleString()}`,
        note: "Current month sales",
        icon: Diamond,
        tone: "lilac",
      },
      {
        label: "Pending COD Payout",
        value: `Rs. ${pending.toLocaleString()}`,
        note: "Awaiting customer delivery",
        icon: RotateCcw,
        tone: "pink",
        down: pending > 0,
      },
    ];
  }, [salesData]);

  const paymentMethods = useMemo(() => {
    const list = Array.from(new Set(transactions.map((t) => t.payment || t.paymentMethod).filter(Boolean)));
    return ["All Payments", ...list];
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter((item) => {
      const pm = item.payment || item.paymentMethod || "COD";
      const haystack = `${item.id} ${item.customer} ${item.items || ""} ${pm}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesPayment = payment === "All Payments" || pm === payment;
      const matchesStatus =
        status === "All Status" ||
        item.status === status ||
        item.paymentStatus === status;
      return matchesQuery && matchesPayment && matchesStatus;
    });
  }, [payment, query, status, transactions]);

  const pageSize = 8;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function exportSales() {
    if (!filtered.length) {
      showToast("No sales transactions to export");
      return;
    }
    const header = "Order ID,Customer,Items,Amount,Payment,Date,Status";
    const rows = filtered.map(
      (item) =>
        `"${item.id}","${item.customer}","${item.items || "Produce Items"}",${item.amount},"${item.payment || item.paymentMethod || "COD"}","${item.date}","${item.status}"`,
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
          <p>Track farm sales, verified payments, and payouts from actual marketplace orders.</p>
        </div>
        <button type="button" className="vd-add-btn" onClick={exportSales}>
          Export Sales
        </button>
      </div>

      <section className="vd-report-metrics">
        {metrics.map((metric) => {
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
              placeholder="Search sales by order ID, customer or items..."
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
            {paymentMethods.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
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
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
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
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2rem" }}>
                    Loading actual sales transactions...
                  </td>
                </tr>
              ) : visible.length ? (
                visible.map((item) => {
                  const payStr = item.payment || item.paymentMethod || "COD";
                  const statusStr = item.status || "Pending";
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.id}</strong>
                      </td>
                      <td>{item.customer}</td>
                      <td>{item.items || "Farm Harvest Items"}</td>
                      <td>Rs. {Number(item.amount || 0).toLocaleString()}</td>
                      <td>{payStr}</td>
                      <td>{item.date}</td>
                      <td>
                        <span className={`vd-status ${statusStr.toLowerCase().replace(/\s+/g, "-")}`}>
                          {statusStr}
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
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: "2.5rem", color: "#777" }}>
                    {transactions.length === 0
                      ? "No sales transactions recorded yet. When customer orders arrive, they will appear here automatically."
                      : "No sales match this search or filter."}
                  </td>
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
              disabled={currentPage <= 1}
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
              disabled={currentPage >= pages}
              onClick={() => setPage((value) => Math.min(pages, value + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {selected ? (
        <VendorModal title={`Order ${selected.id}`} onClose={() => setSelected(null)}>
          <p>
            <strong>Customer:</strong> {selected.customer}
            <br />
            <strong>Items:</strong> {selected.items || "Farm Harvest Items"}
          </p>
          <p>
            <strong>Amount:</strong> Rs. {Number(selected.amount || 0).toLocaleString()}
            <br />
            <strong>Payment:</strong> {selected.payment || selected.paymentMethod || "COD"}
            <br />
            <strong>Date:</strong> {selected.date} · <strong>Status:</strong> {selected.status}
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

export function VendorReviews() {
  const { showToast } = useAccount();
  const [params] = useSearchParams();
  const [reviewsData, setReviewsData] = useState<VendorReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [rating, setRating] = useState("All Ratings");
  const [status, setStatus] = useState("All Status");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<VendorReviewItem | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadReviews() {
      try {
        setLoading(true);
        const data = await api.vendorReviews();
        if (active) setReviewsData(data);
      } catch {
        if (active) {
          setReviewsData({
            averageRating: 0,
            totalReviews: 0,
            pendingReplies: 0,
            fiveStarShare: 0,
            reviews: [],
          });
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    loadReviews();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setQuery(params.get("q") ?? "");
  }, [params]);

  const reviews = reviewsData?.reviews || [];

  const metrics = useMemo(() => {
    const avg = reviewsData?.averageRating || 0;
    const total = reviewsData?.totalReviews || 0;
    const pending = reviewsData?.pendingReplies || 0;
    const share5 = reviewsData?.fiveStarShare || 0;

    return [
      {
        label: "Average Rating",
        value: total > 0 ? avg.toFixed(1) : "0.0",
        note: `From ${total} verified ${total === 1 ? "review" : "reviews"}`,
        icon: Star,
        tone: "green",
      },
      {
        label: "Total Reviews",
        value: `${total}`,
        note: `${total} verified purchases`,
        icon: Users,
        tone: "blue",
      },
      {
        label: "Pending Replies",
        value: `${pending}`,
        note: pending > 0 ? "Requires vendor reply" : "All reviews addressed",
        icon: Mail,
        tone: "lilac",
      },
      {
        label: "5-Star Share",
        value: `${share5}%`,
        note: "Top rating proportion",
        icon: TrendingUp,
        tone: "pink",
      },
    ];
  }, [reviewsData]);

  const filtered = useMemo(() => {
    return reviews.filter((item) => {
      const haystack = `${item.customer} ${item.product} ${item.comment} ${item.status}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());
      const matchesRating = rating === "All Ratings" || String(item.rating) === rating;
      const matchesStatus = status === "All Status" || item.status === status;
      return matchesQuery && matchesRating && matchesStatus;
    });
  }, [query, rating, reviews, status]);

  const pageSize = 8;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function exportReviews() {
    if (!filtered.length) {
      showToast("No reviews to export");
      return;
    }
    const header = "Customer,Product,Rating,Comment,Date,Status,Reply";
    const csvRows = filtered.map(
      (item) =>
        `"${item.customer || item.reviewerName || "Customer"}","${item.product || item.productName || "Product"}",${item.rating},"${(item.comment || item.body || "").replace(/"/g, '""')}","${item.date || ""}","${item.status || "Published"}","${(item.reply || "").replace(/"/g, '""')}"`,
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

  function openReview(item: VendorReviewItem) {
    setSelected(item);
    setReplyDraft(item.reply || "");
  }

  async function saveReply() {
    if (!selected) return;
    const text = replyDraft.trim();
    if (!text) {
      showToast("Write a reply first");
      return;
    }
    try {
      setSubmittingReply(true);
      await api.vendorReplyReview(selected.id, text);
      setReviewsData((prev) => {
        if (!prev) return prev;
        const updatedReviews = prev.reviews.map((r) =>
          r.id === selected.id ? { ...r, reply: text, status: "Published" as const } : r,
        );
        const pendingCount = updatedReviews.filter((r) => !r.reply).length;
        return {
          ...prev,
          pendingReplies: pendingCount,
          reviews: updatedReviews,
        };
      });
      showToast(`Reply published for ${selected.customer || selected.reviewerName || "Customer"}`);
      setSelected(null);
    } catch (err: any) {
      showToast(err.message || "Failed to publish reply");
    } finally {
      setSubmittingReply(false);
    }
  }

  return (
    <div className="vd-reviews">
      <div className="vd-products-head">
        <div>
          <h1>Customer Reviews</h1>
          <p>See genuine reviews from delivered orders and engage directly with buyers.</p>
        </div>
        <button type="button" className="vd-add-btn" onClick={exportReviews}>
          Export Reviews
        </button>
      </div>

      <section className="vd-report-metrics">
        {metrics.map((metric) => {
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
              placeholder="Search reviews by customer, product, or comment..."
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
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
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
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>
                    Loading genuine customer reviews...
                  </td>
                </tr>
              ) : visible.length ? (
                visible.map((item) => {
                  const custName = item.customer || item.reviewerName || "Customer";
                  const prodName = item.product || item.productName || "Product";
                  const statusStr = item.status || "Published";
                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="vd-cust-name">
                          <b className="vd-cust-avatar" aria-hidden="true">
                            {customerInitials(custName)}
                          </b>
                          <div className="vd-cust-copy">
                            <strong>{custName}</strong>
                            <span>{item.email || "Verified Buyer"}</span>
                          </div>
                        </div>
                      </td>
                      <td>{prodName}</td>
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
                        <p className="vd-review-comment">{item.comment || item.body}</p>
                        {item.reply ? (
                          <p style={{ marginTop: "0.3rem", fontSize: "0.8rem", color: "#176136" }}>
                            <strong>Your reply:</strong> {item.reply}
                          </p>
                        ) : null}
                      </td>
                      <td>{item.date}</td>
                      <td>
                        <span className={`vd-status ${statusStr.toLowerCase().replace(/\s+/g, "-")}`}>
                          {statusStr}
                        </span>
                      </td>
                      <td>
                        <div className="vd-row-actions">
                          <button
                            type="button"
                            className="vd-icon-btn"
                            aria-label={`View review from ${custName}`}
                            onClick={() => openReview(item)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="vd-icon-btn"
                            aria-label={`Reply to ${custName}`}
                            onClick={() => openReview(item)}
                          >
                            <Mail size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem", color: "#777" }}>
                    {reviews.length === 0
                      ? "No verified reviews yet. When customers receive their orders and rate your produce, reviews will be displayed here."
                      : "No reviews match this search or rating filter."}
                  </td>
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
              disabled={currentPage <= 1}
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
              disabled={currentPage >= pages}
              onClick={() => setPage((value) => Math.min(pages, value + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {selected ? (
        <VendorModal title={selected.product || selected.productName || "Customer Review"} onClose={() => setSelected(null)}>
          <p>
            <strong>{selected.customer || selected.reviewerName || "Customer"}</strong> ({selected.email || "Verified Buyer"})
            <br />
            {selected.rating} stars · {selected.date} · {selected.status || "Published"}
          </p>
          <p style={{ fontStyle: "italic", background: "#f8f9fa", padding: "0.8rem", borderRadius: "6px" }}>
            "{selected.comment || selected.body}"
          </p>
          <label className="vd-reply-field">
            Reply to customer
            <textarea
              rows={3}
              value={replyDraft}
              disabled={submittingReply}
              onChange={(event) => setReplyDraft(event.target.value)}
              placeholder="Thank the buyer, address any feedback, and mention the harvest..."
            />
          </label>
          <button type="button" className="vd-add-btn" disabled={submittingReply} onClick={saveReply}>
            {submittingReply ? "Saving Reply..." : "Save & Publish Reply"}
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

  // Inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Profile data states
  const [profileImage, setProfileImage] = useState(user.photo || "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [storeLogo, setStoreLogo] = useState(user.vendor?.photo || "");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [banner, setBanner] = useState(user.vendor?.banner || "");
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [accountEmail] = useState(user.email || "");
  const [personalPhone, setPersonalPhone] = useState(user.phone || "");

  const [businessName, setBusinessName] = useState(user.vendor?.businessName || "");
  const [bio, setBio] = useState(user.vendor?.description || "");
  const [hours, setHours] = useState(user.vendor?.hours || "7:00 AM - 6:00 PM");
  const [sundayHours, setSundayHours] = useState(user.vendor?.sundayHours || "Closed");
  const [storeEmail, setStoreEmail] = useState(user.vendor?.storeEmail || user.email);
  const [storePhone, setStorePhone] = useState(user.vendor?.storePhone || user.phone);
  const [facebook, setFacebook] = useState(user.vendor?.facebook || "");
  const [instagram, setInstagram] = useState(user.vendor?.instagram || "");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<string>(user.vendor?.status || "under_review");

  const [categories, setCategories] = useState(
    () =>
      user.vendor?.servedCategories ||
      Object.fromEntries(categoryOptions.map((item) => [item.id, item.checked])),
  );

  // Async / UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [preview, setPreview] = useState(false);

  // Password Security states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Load from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchProfile() {
      try {
        setLoading(true);
        const data = await api.vendorProfile();
        if (!isMounted || !data) return;

        if (data.profileImage !== undefined) {
          setProfileImage(data.profileImage || "");
        } else if (data.photo !== undefined) {
          setProfileImage(data.photo || "");
        }

        if (data.storeLogo !== undefined) {
          setStoreLogo(data.storeLogo || "");
        }
        if (data.storeBanner !== undefined) {
          setBanner(data.storeBanner || "");
        }

        if (data.contact) {
          if (data.contact.firstName) setFirstName(data.contact.firstName);
          if (data.contact.lastName) setLastName(data.contact.lastName);
          if (data.contact.phone) setPersonalPhone(data.contact.phone);
        }

        if (data.businessName) setBusinessName(data.businessName);
        if (data.description) setBio(data.description);
        if (data.storeHours) setHours(data.storeHours);
        if (data.storeEmail) setStoreEmail(data.storeEmail);
        if (data.storePhone) setStorePhone(data.storePhone);
        if (data.status) setStatus(data.status);

        if (data.storeSocials) {
          if (data.storeSocials.facebook) setFacebook(data.storeSocials.facebook);
          if (data.storeSocials.instagram) setInstagram(data.storeSocials.instagram);
          if (data.storeSocials.website) setWebsite(data.storeSocials.website);
        }
      } catch (err) {
        console.warn("Could not load vendor profile from backend, using session fallback:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Avatar Handlers
  async function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    try {
      setUploadingAvatar(true);
      const localUrl = URL.createObjectURL(file);
      setAvatarPreview(localUrl);

      const res = await api.vendorUploadAvatar(file);
      const savedPhoto = res.profileImage || res.photo || localUrl;
      setProfileImage(savedPhoto);
      setAvatarPreview(null);
      await updateUser({ photo: savedPhoto });
      showToast("Profile picture updated successfully");
    } catch (err: any) {
      setAvatarPreview(null);
      showToast(err?.message || "Failed to upload profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleRemoveAvatar() {
    try {
      setUploadingAvatar(true);
      await api.vendorDeleteAvatar();
      setProfileImage("");
      setAvatarPreview(null);
      await updateUser({ photo: "" });
      showToast("Profile picture removed");
    } catch (err: any) {
      showToast(err?.message || "Failed to remove profile picture");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Store Logo Handlers
  async function handleStoreLogoChange(file: File | undefined) {
    if (!file) return;
    try {
      setUploadingLogo(true);
      const localUrl = URL.createObjectURL(file);
      setLogoPreview(localUrl);

      const res = await api.vendorUploadStoreLogo(file);
      const savedLogo = res.storeLogo || localUrl;
      setStoreLogo(savedLogo);
      setLogoPreview(null);
      await updateUser({ vendor: { photo: savedLogo } });
      showToast("Store logo updated successfully");
    } catch (err: any) {
      setLogoPreview(null);
      showToast(err?.message || "Failed to upload store logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleRemoveStoreLogo() {
    try {
      setUploadingLogo(true);
      await api.vendorDeleteStoreLogo();
      setStoreLogo("");
      setLogoPreview(null);
      await updateUser({ vendor: { photo: "" } });
      showToast("Store logo removed");
    } catch (err: any) {
      showToast(err?.message || "Failed to remove store logo");
    } finally {
      setUploadingLogo(false);
    }
  }

  // Banner Handlers
  async function handleBannerChange(file: File | undefined) {
    if (!file) return;
    try {
      setUploadingBanner(true);
      const localUrl = URL.createObjectURL(file);
      setBannerPreview(localUrl);

      const res = await api.vendorUploadStoreBanner(file);
      const savedBanner = res.storeBanner || localUrl;
      setBanner(savedBanner);
      setBannerPreview(null);
      await updateUser({ vendor: { banner: savedBanner } });
      showToast("Cover banner updated successfully");
    } catch (err: any) {
      setBannerPreview(null);
      showToast(err?.message || "Failed to update cover banner");
    } finally {
      setUploadingBanner(false);
    }
  }

  async function handleRemoveBanner() {
    try {
      setUploadingBanner(true);
      await api.vendorDeleteStoreBanner();
      setBanner("");
      setBannerPreview(null);
      await updateUser({ vendor: { banner: "" } });
      showToast("Store banner removed");
    } catch (err: any) {
      showToast(err?.message || "Failed to remove store banner");
    } finally {
      setUploadingBanner(false);
    }
  }

  // Profile Save Handler
  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!businessName.trim()) {
      showToast("Registered business name is required");
      return;
    }
    if (!hours.trim() || !storeEmail.trim() || !storePhone.trim()) {
      showToast("Fill the required storefront contact fields");
      return;
    }

    try {
      setSaving(true);
      await api.vendorUpdateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: personalPhone.trim(),
        businessName: businessName.trim(),
        description: bio.trim(),
        storeHours: hours.trim(),
        storeEmail: storeEmail.trim(),
        storePhone: storePhone.trim(),
        storeSocials: {
          facebook: facebook.trim(),
          instagram: instagram.trim(),
          website: website.trim(),
        },
      });

      await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: personalPhone.trim(),
        vendor: {
          businessName: businessName.trim(),
          description: bio.trim(),
          hours: hours.trim(),
          sundayHours: sundayHours.trim(),
          storeEmail: storeEmail.trim(),
          storePhone: storePhone.trim(),
          facebook: facebook.trim(),
          instagram: instagram.trim(),
          servedCategories: categories,
        },
      });

      showToast("Vendor profile and storefront saved successfully");
    } catch (err: any) {
      showToast(err?.message || "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  }

  // Secure Password Change Handler
  async function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword.trim() || !newPassword.trim()) {
      setPasswordError("Please enter your current and new password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation password do not match.");
      return;
    }

    try {
      setChangingPassword(true);
      await api.vendorChangePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
        confirmPassword: confirmPassword.trim(),
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Your password has been changed successfully.");
      showToast("Password updated successfully");
    } catch (err: any) {
      const msg = err?.message || "Current password is incorrect.";
      setPasswordError(msg);
      showToast(msg);
    } finally {
      setChangingPassword(false);
    }
  }

  const avatarDisplay = avatarPreview || profileImage;
  const logoDisplay = logoPreview || storeLogo;
  const bannerDisplay = bannerPreview || banner;
  const initials = `${firstName ? firstName.charAt(0) : "V"}${lastName ? lastName.charAt(0) : ""}`.toUpperCase() || "V";

  return (
    <div className="vd-profile">
      <div className="vd-products-head">
        <div>
          <h1>Vendor Profile & Store Branding</h1>
          <p>
            Manage your personal profile picture, storefront logo, banner and store information shown across GoogleDoko.
          </p>
        </div>
        {loading ? <span style={{ fontSize: "12px", color: "#6b7c70" }}>Syncing profile...</span> : null}
      </div>

      {/* 1. Profile Overview Header Card */}
      <section className="vd-profile-overview-card">
        <div className="vd-profile-overview-left">
          <div className="vd-avatar-wrap">
            <div className="vd-avatar-circle">
              {avatarDisplay ? (
                <img src={avatarDisplay} alt={`${firstName} ${lastName} avatar`} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              className="vd-file-hidden"
              accept="image/png,image/jpeg,image/webp"
              aria-label="Upload personal profile picture"
              onChange={(e) => {
                void handleAvatarChange(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className="vd-avatar-overlay-btn"
              title="Change Profile Picture"
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
            >
              <Camera size={14} />
            </button>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: "20px", color: "#163526" }}>
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : businessName || "Vendor Account"}
              </h2>
              <span className={`vd-status-badge ${status}`}>
                <ShieldCheck size={14} />
                {status === "approved" ? "Verified Vendor" : "Under Review"}
              </span>
            </div>
            <p style={{ margin: "4px 0 0", color: "#6b7c70", fontSize: "13px" }}>
              {accountEmail} {personalPhone ? `· ${personalPhone}` : ""}
            </p>
            <div className="vd-avatar-actions">
              <button
                type="button"
                className="vd-btn-secondary-sm"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <Upload size={12} />
                {uploadingAvatar ? "Uploading..." : avatarDisplay ? "Change Photo" : "Upload Photo"}
              </button>
              {avatarDisplay ? (
                <button
                  type="button"
                  className="vd-btn-text-sm"
                  onClick={() => void handleRemoveAvatar()}
                  disabled={uploadingAvatar}
                >
                  <Trash2 size={12} />
                  Remove Photo
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Storefront Banner */}
      <div className="vd-banner-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span className="vd-banner-label">Storefront Cover Banner</span>
          {bannerDisplay ? (
            <button
              type="button"
              className="vd-btn-text-sm"
              onClick={() => void handleRemoveBanner()}
              disabled={uploadingBanner}
            >
              <Trash2 size={12} />
              Reset Banner
            </button>
          ) : null}
        </div>
        <div className="vd-banner" style={{ minHeight: "180px", position: "relative" }}>
          {bannerDisplay ? (
            <img src={bannerDisplay} alt="Storefront cover banner" />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "180px",
                background: "#f4f7f5",
                borderRadius: "12px",
                border: "2px dashed #b8d4c3",
                color: "#4f6354",
                padding: "1.5rem",
                textAlign: "center",
              }}
            >
              <ImagePlus size={32} style={{ color: "#2d7a4c", marginBottom: "6px" }} />
              <strong style={{ fontSize: "14px", color: "#163526", marginBottom: "2px" }}>
                No Cover Banner Set
              </strong>
              <span style={{ fontSize: "12px", color: "#6b7c70" }}>
                Upload a 1200x320 banner to customize your farm storefront.
              </span>
            </div>
          )}
          <input
            ref={bannerInputRef}
            className="vd-file-hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            aria-label="Upload cover banner"
            onChange={(event) => {
              void handleBannerChange(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <button
            type="button"
            className="vd-banner-btn"
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
          >
            <Camera size={14} />
            {uploadingBanner ? "Uploading Banner..." : bannerDisplay ? "Change Cover Banner" : "Upload Cover Banner"}
          </button>
        </div>
      </div>

      <form className="vd-profile-grid" onSubmit={saveProfile}>
        <div>
          {/* 3. Personal Account Details */}
          <section className="vd-card" style={{ marginBottom: "20px" }}>
            <h2>Personal Account Information</h2>
            <div className="vd-two">
              <label className="vd-field">
                <span>First Name <i>*</i></span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Ram"
                  required
                />
              </label>
              <label className="vd-field">
                <span>Last Name</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Sharma"
                />
              </label>
            </div>
            <div className="vd-two">
              <label className="vd-field">
                <span>Account Email (Login)</span>
                <input value={accountEmail} disabled style={{ background: "#f8f9fa", cursor: "not-allowed" }} />
              </label>
              <label className="vd-field">
                <span>Personal Contact Phone</span>
                <input
                  value={personalPhone}
                  onChange={(e) => setPersonalPhone(e.target.value)}
                  placeholder="e.g. 98XXXXXXXX"
                />
              </label>
            </div>
          </section>

          {/* 4. Store Branding (Store Logo) */}
          <section className="vd-card" style={{ marginBottom: "20px" }}>
            <h2>Store Branding & Logo</h2>
            <div className="vd-branding-box">
              <div className="vd-branding-header">
                <h3>Store / Brand Logo</h3>
                {storeLogo ? (
                  <button
                    type="button"
                    className="vd-btn-text-sm"
                    onClick={() => void handleRemoveStoreLogo()}
                    disabled={uploadingLogo}
                  >
                    <Trash2 size={12} />
                    Remove Logo
                  </button>
                ) : null}
              </div>
              <div className="vd-logo-preview-box">
                <div className="vd-logo-thumb">
                  {logoDisplay ? (
                    <img src={logoDisplay} alt="Store logo preview" />
                  ) : (
                    <span style={{ fontSize: "11px", color: "#6b7c70", textAlign: "center", padding: "4px" }}>
                      No Logo
                    </span>
                  )}
                </div>
                <div>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#4f6354" }}>
                    Shown on your product cards, store badge and vendor store page. Square format recommended (min 200x200px).
                  </p>
                  <input
                    ref={logoInputRef}
                    type="file"
                    className="vd-file-hidden"
                    accept="image/png,image/jpeg,image/webp"
                    aria-label="Upload store logo"
                    onChange={(e) => {
                      void handleStoreLogoChange(e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    className="vd-btn-secondary-sm"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                  >
                    <Upload size={12} />
                    {uploadingLogo ? "Uploading Logo..." : storeLogo ? "Change Logo" : "Upload Logo"}
                  </button>
                </div>
              </div>
            </div>

            <h2>Storefront Public Details</h2>
            <label className="vd-field">
              <span>Official Registered Business Name <i>*</i></span>
              <input
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                placeholder="e.g. Himalayan Fresh Farm Pvt. Ltd."
                required
              />
            </label>

            <label className="vd-field">
              <span>Farm / Business Bio (Public Description)</span>
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
                  required
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
                  required
                />
              </label>
              <label className="vd-field">
                <span>Public Store Helpline <i>*</i></span>
                <input
                  value={storePhone}
                  onChange={(event) => setStorePhone(event.target.value)}
                  placeholder="e.g. +977-985XXXXXXXX"
                  required
                />
              </label>
            </div>
          </section>

          {/* 5. Account Security (Change Password) */}
          <section className="vd-card">
            <h2>Account Security & Password</h2>
            <p style={{ margin: "0 0 16px", color: "#6b7c70", fontSize: "13px" }}>
              To protect your vendor account and earnings, always choose a strong, unique password.
            </p>

            {passwordSuccess ? (
              <div className="vd-form-alert success">
                <Check size={16} />
                <span>{passwordSuccess}</span>
              </div>
            ) : null}

            {passwordError ? (
              <div className="vd-form-alert error">
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            ) : null}

            <div className="vd-field">
              <span>Current Password</span>
              <div className="vd-pw-field-wrap">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  className="vd-pw-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="vd-two">
              <div className="vd-field">
                <span>New Password</span>
                <div className="vd-pw-field-wrap">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    className="vd-pw-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="vd-field">
                <span>Confirm New Password</span>
                <div className="vd-pw-field-wrap">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                  <button
                    type="button"
                    className="vd-pw-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="vd-btn-secondary-sm"
              style={{ marginTop: "10px", padding: "8px 16px", fontSize: "13px" }}
              onClick={(e) => void handleChangePassword(e)}
              disabled={changingPassword || !currentPassword.trim() || !newPassword.trim()}
            >
              {changingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </section>
        </div>

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

            <h2>Social Media & Web Links</h2>
            <label className="vd-field">
              <span>Official Website</span>
              <input
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                placeholder="https://yourfarm.com"
              />
            </label>
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
            <button type="submit" className="vd-add-btn" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Profile Changes"}
            </button>
          </div>
        </div>
      </form>

      {preview ? (
        <VendorModal title={businessName || "Public Store Preview"} onClose={() => setPreview(false)}>
          <div style={{ position: "relative", marginBottom: "16px" }}>
            <img className="vd-preview-banner" src={bannerDisplay} alt="" />
            {logoDisplay ? (
              <img
                src={logoDisplay}
                alt=""
                style={{
                  position: "absolute",
                  left: "16px",
                  bottom: "-20px",
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  border: "3px solid #fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  background: "#fff",
                  objectFit: "contain",
                }}
              />
            ) : null}
          </div>
          <div style={{ marginTop: logoDisplay ? "24px" : "8px" }}>
            <h3 style={{ margin: "0 0 6px", color: "#163526" }}>{businessName || "Your Farm Name"}</h3>
            <p style={{ margin: "0 0 12px", color: "#4f6354" }}>{bio || "Your farm bio will appear here."}</p>
            <div style={{ background: "#f8fdf9", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#355845" }}>
              <p style={{ margin: "0 0 4px" }}>
                <strong>Operating Hours:</strong> {hours} · Sunday {sundayHours || "Closed"}
              </p>
              <p style={{ margin: "0 0 4px" }}>
                <strong>Store Email:</strong> {storeEmail} · <strong>Helpline:</strong> {storePhone}
              </p>
              {website ? (
                <p style={{ margin: 0 }}>
                  <strong>Website:</strong> {website}
                </p>
              ) : null}
            </div>
            <p style={{ marginTop: "12px", fontSize: "12px", color: "#6b7c70" }}>
              <strong>Categories:</strong>{" "}
              {categoryOptions
                .filter((item) => categories[item.id])
                .map((item) => item.label)
                .join(" · ") || "No categories selected"}
            </p>
          </div>
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

  async function updatePassword(event: FormEvent) {
    event.preventDefault();
    if (!currentPassword.trim() || !nextPassword.trim()) {
      showToast("Enter your current and new password");
      return;
    }
    if (nextPassword.length < 6) {
      showToast("New password must be at least 6 characters");
      return;
    }
    try {
      await api.vendorChangePassword({ currentPassword, newPassword: nextPassword });
      setCurrentPassword("");
      setNextPassword("");
      showToast("Password updated successfully");
    } catch (err: any) {
      showToast(err?.message || "Current password is incorrect");
    }
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
