import { useState } from "react";

// Renders the logo file from public/. If it is missing or broken, plain text stands in.
export default function KbcLogo({ className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed) return <span className={`kbc-logo-text ${className}`.trim()}>KBC</span>;
  return (
    <img
      className={`kbc-logo ${className}`.trim()}
      src="/kbc-logo.svg"
      alt="KBC"
      onError={() => setFailed(true)}
    />
  );
}
