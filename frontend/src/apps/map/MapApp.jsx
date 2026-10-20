import { Link } from "react-router-dom";
import { hub, roles, flowKinds, status } from "../../data/partners";
import "./map.css";

const W = 1300;
const H = 900;
const CX = W / 2;
const CY = H / 2;
const HUB_R = 72;
const BOX_W = 300;

const external = roles.filter((r) => !r.inHouse);
const inHouse = roles.filter((r) => r.inHouse);

function boxHeight(role) {
  return 48 + role.partners.length * 22;
}

function place(index, total) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / total;
  return { x: CX + Math.cos(angle) * 470, y: CY + Math.sin(angle) * 340 };
}

// Point where the line from the centre to (x, y) enters a box of size w by h around (x, y).
function edgePoint(x, y, w, h) {
  const dx = x - CX;
  const dy = y - CY;
  const t = Math.min(w / 2 / Math.abs(dx || 1e-6), h / 2 / Math.abs(dy || 1e-6));
  return { x: x - dx * t, y: y - dy * t };
}

function Flow({ x, y, h, flow, slot, slots }) {
  const dx = x - CX;
  const dy = y - CY;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const nx = -uy;
  const ny = ux;
  const off = (slot - (slots - 1) / 2) * 40;
  const end = edgePoint(x, y, BOX_W + 8, h + 8);
  const start = { x: CX + ux * (HUB_R + 4), y: CY + uy * (HUB_R + 4) };
  const [a, b] = flow.direction === "out" ? [start, end] : [end, start];
  const color = flowKinds[flow.kind].color;
  const t = flow.direction === "out" ? 0.66 : 0.34;
  const mid = { x: start.x + (end.x - start.x) * t + nx * off, y: start.y + (end.y - start.y) * t + ny * off };
  return (
    <g>
      <line
        x1={a.x + nx * off}
        y1={a.y + ny * off}
        x2={b.x + nx * off}
        y2={b.y + ny * off}
        stroke={color}
        strokeWidth="2.5"
        strokeDasharray={flow.consent ? "7 5" : undefined}
        markerEnd={`url(#arrow-${flow.kind})`}
      />
      <text x={mid.x} y={mid.y + (slot === 0 ? -7 : 17)} textAnchor="middle" className="map-flow-label">
        {flow.label}
      </text>
    </g>
  );
}

export default function MapApp() {
  return (
    <div className="map">
      <header className="map-bar">
        <h1>Ecosystem map</h1>
        <p className="map-status">{status}</p>
        <Link to="/">Back to start</Link>
      </header>

      <main className="map-main">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="KBC in the centre with partners grouped by role and the flows between them">
          <defs>
            {Object.entries(flowKinds).map(([kind, { color }]) => (
              <marker key={kind} id={`arrow-${kind}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0L10 5L0 10z" fill={color} />
              </marker>
            ))}
          </defs>

          {external.map((role, i) => {
            const { x, y } = place(i, external.length);
            return (
              <g key={role.id}>
                {role.flows.map((flow, k) => (
                  <Flow key={`${flow.kind}-${flow.direction}`} x={x} y={y} h={boxHeight(role)} flow={flow} slot={k} slots={role.flows.length} />
                ))}
              </g>
            );
          })}

          <circle cx={CX} cy={CY} r={HUB_R} className="map-hub" />
          <text x={CX} y={CY - 2} textAnchor="middle" className="map-hub-name">{hub.name}</text>
          <text x={CX} y={CY + 20} textAnchor="middle" className="map-hub-sub">orchestrator</text>

          {external.map((role, i) => {
            const { x, y } = place(i, external.length);
            const h = boxHeight(role);
            return (
              <g key={role.id} transform={`translate(${x - BOX_W / 2} ${y - h / 2})`}>
                <rect width={BOX_W} height={h} rx="12" className="map-role" />
                <text x="14" y="27" className="map-role-label">{role.label}</text>
                {role.partners.map((p, k) => (
                  <text key={p.name} x="14" y={50 + k * 22} className={p.proposed ? "map-partner map-proposed" : "map-partner"}>
                    {p.name}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>

        <section className="map-side" aria-label="Details">
          <h2>{hub.name}</h2>
          <p>{hub.tagline}</p>
          {inHouse.map((role) => (
            <p key={role.id}>
              In house: {role.label.toLowerCase()}. {role.brings}.
            </p>
          ))}

          <h2>Roles</h2>
          <ul className="map-roles">
            {external.map((role) => (
              <li key={role.id}>
                <strong>{role.label}</strong>
                <span>{role.brings}</span>
                <span>
                  {role.partners
                    .map((p) => (p.proposed ? `${p.name}, proposed` : p.name))
                    .join(", ")}
                </span>
              </li>
            ))}
          </ul>

          <p>Names in italics are proposed, not yet in the KBC catalogue. All names are demo assumptions, not agreements.</p>

          <h2>Flows</h2>
          <ul className="map-legend">
            {Object.entries(flowKinds).map(([kind, { label, color }]) => (
              <li key={kind}>
                <span className={kind === "data" ? "map-swatch dashed" : "map-swatch"} style={{ "--c": color }} />
                {label}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
