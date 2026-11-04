import { ChevronLeft, ChevronRight } from "lucide-react";

interface SectionScrollControlsProps {
  onScrollLeft: () => void;
  onScrollRight: () => void;
  canScrollLeft?: boolean;
  canScrollRight?: boolean;
  ariaLabel?: string;
}

export default function SectionScrollControls({
  onScrollLeft,
  onScrollRight,
  canScrollLeft = true,
  canScrollRight = true,
  ariaLabel = "Scroll carousel",
}: SectionScrollControlsProps) {
  return (
    <div className="section-scroll-controls" aria-label={ariaLabel}>
      <button
        type="button"
        onClick={onScrollLeft}
        className={`section-scroll-btn ${!canScrollLeft ? "is-disabled" : ""}`}
        aria-label="Scroll left"
        disabled={!canScrollLeft}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={onScrollRight}
        className={`section-scroll-btn ${!canScrollRight ? "is-disabled" : ""}`}
        aria-label="Scroll right"
        disabled={!canScrollRight}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
