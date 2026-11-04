import { useRef, useCallback, useState, useEffect } from "react";

export function useSideScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 8);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 8);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      const scrollAmount = Math.max(scrollRef.current.clientWidth * 0.75, 300);
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      if (scrollLeft >= scrollWidth - clientWidth - 12) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const scrollAmount = Math.max(clientWidth * 0.75, 300);
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  }, []);

  return { scrollRef, scrollLeft, scrollRight, canScrollLeft, canScrollRight };
}
