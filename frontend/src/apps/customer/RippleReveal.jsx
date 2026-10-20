import { useEffect } from "react";

const SHORT = "(prefers-reduced-motion: reduce)";

export default function RippleReveal({ label, onDone }) {
  useEffect(() => {
    const reduced = window.matchMedia?.(SHORT).matches;
    const timer = setTimeout(onDone, reduced ? 900 : 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <section className="cx-reveal" role="status" aria-label="Building your plan">
      <div className="cx-rings" aria-hidden="true">
        <span className="cx-ring" />
        <span className="cx-ring" />
        <span className="cx-ring" />
        <span className="cx-dot" />
      </div>
      <p className="cx-reveal-label">{label}</p>
      <p className="cx-reveal-sub">Building your plan</p>
    </section>
  );
}
