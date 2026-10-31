export function ProductSkeleton() {
  return (
    <div
      className="product-card"
      style={{
        pointerEvents: "none",
        opacity: 0.7,
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          width: "100%",
          paddingTop: "75%",
          background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
          backgroundSize: "200% 100%",
          animation: "skeleton-shimmer 1.5s infinite",
        }}
      />
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ height: "14px", width: "40%", background: "#e5e7eb", borderRadius: "4px" }} />
        <div style={{ height: "18px", width: "80%", background: "#e5e7eb", borderRadius: "4px" }} />
        <div style={{ height: "16px", width: "30%", background: "#e5e7eb", borderRadius: "4px" }} />
        <div style={{ height: "36px", width: "100%", background: "#e5e7eb", borderRadius: "6px", marginTop: "8px" }} />
      </div>
    </div>
  );
}

export function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <ProductSkeleton key={`skeleton-${idx}`} />
      ))}
    </>
  );
}

export default ProductSkeleton;
