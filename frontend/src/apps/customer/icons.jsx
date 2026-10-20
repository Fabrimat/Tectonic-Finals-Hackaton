// Simple line icons drawn for this app. All share one stroke style.
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };

const paths = {
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3l1.6 2.4 2.8-.6.9 2.7 2.7.9-.6 2.8L21 12l-2.4 1.6.6 2.8-2.7.9-.9 2.7-2.8-.6L12 21l-1.6-2.4-2.8.6-.9-2.7-2.7-.9.6-2.8L3 12l2.4-1.6-.6-2.8 2.7-.9.9-2.7 2.8.6z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </>
  ),
  bell: (
    <>
      <path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 1.5h-15z" />
      <path d="M10 21h4" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H17v3" />
      <rect x="3.5" y="8" width="17" height="11.5" rx="2.5" />
      <circle cx="16.5" cy="13.7" r="1" fill="currentColor" />
    </>
  ),
  pencil: <path d="M4 20l1-4L16.5 4.5l3 3L8 19zM14 7l3 3" />,
  chevronDown: <path d="M5 9l7 7 7-7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  document: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 11h6M9 14h6M9 17h4" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="M3 10h18M6.5 15h3M13 15h1" />
    </>
  ),
  chart: (
    <>
      <path d="M3 10l4-4 3 3 5-6" />
      <path d="M12 3h3v3" />
      <ellipse cx="15" cy="15" rx="4" ry="1.8" />
      <path d="M11 15v3.5c0 1 1.8 1.8 4 1.8s4-.8 4-1.8V15M11 17.2c0 1 1.8 1.8 4 1.8s4-.8 4-1.8" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </>
  ),
  list: (
    <>
      <circle cx="5" cy="7" r="1.6" />
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="5" cy="17" r="1.6" />
      <path d="M10 7h10M10 12h10M10 17h10" />
    </>
  ),
  piggy: (
    <>
      <path d="M5 13c0-3.5 3-6 7-6h3l2-2v3c1.5 1 2 2.200 2 3.500v3.500h-2.500l-.5 2h-3l-.5-1.500h-3l-.5 1.500H6.500v-3C5.500 14.500 5 13.800 5 13z" />
      <circle cx="15" cy="11.200" r=".7" fill="currentColor" />
      <path d="M2.500 11.500c0 1 .8 1.500 2 1.500" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.500" y="7.500" width="17" height="12" rx="2" />
      <path d="M9 7.500V5.500h6v2M3.500 13h17M11 13v1.500h2V13" />
    </>
  ),
  layers: (
    <>
      <path d="M12 4l9 4.500-9 4.500-9-4.500z" />
      <path d="M3 12.500l9 4.500 9-4.500M3 16.500l9 4.500 9-4.500" />
    </>
  ),
  swap: <path d="M4 8h15m-4-4l4 4-4 4M20 16H5m4-4l-4 4 4 4" />,
};

export default function Icon({ name, size = 24, className = "" }) {
  return (
    <svg {...base} width={size} height={size} className={className}>
      {paths[name]}
    </svg>
  );
}
