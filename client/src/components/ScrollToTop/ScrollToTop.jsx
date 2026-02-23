import { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import "./ScrollToTop.css";

const SCROLL_THRESHOLD_PX = 300;

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > SCROLL_THRESHOLD_PX);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleClick() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Back to top"
      className="scroll-to-top-btn"
    >
      <ChevronUp size={22} strokeWidth={2.5} />
    </button>
  );
}
