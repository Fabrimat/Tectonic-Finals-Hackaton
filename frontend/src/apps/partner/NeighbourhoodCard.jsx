import { useState } from "react";
import { GROUP_PARTNER, neighbourhoodView, propose } from "./neighbourhood";
import "./neighbourhood.css";

// Anonymous groups only. Proposing a group purchase is a local demo action and sends nothing.
export default function NeighbourhoodCard({ segment }) {
  const [proposed, setProposed] = useState({});
  const { groups, hiddenGroups, min } = neighbourhoodView(undefined, undefined, segment);

  return (
    <section className="nb" aria-labelledby="nb-h">
      <h2 id="nb-h" className="pp-h">{segment === "business" ? "Trade street groups" : "Neighbourhood groups"}</h2>
      <p className="nb-rule">Shown from {min} {segment === "business" ? "shops" : "homes"}</p>
      {groups.length === 0 ? (
        <p className="nb-none">No group is large enough to show yet.</p>
      ) : (
        <ul className="nb-list">
          {groups.map((g) => (
            <li key={g.id} className="nb-item">
              <p className="nb-text">{g.text}</p>
              <p className="nb-intent">Shared interest: {g.intent}</p>
              {proposed[g.id] ? (
                <p className="nb-done" role="status">Proposed to {GROUP_PARTNER} (demo, nothing was sent)</p>
              ) : (
                <div className="nb-act">
                  <button type="button" className="pp-btn" onClick={() => setProposed((p) => propose(p, g.id))}>
                    Propose a group purchase
                  </button>
                  <span className="nb-demo">Demo action</span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {hiddenGroups > 0 && (
        <p className="nb-hidden">{hiddenGroups} {hiddenGroups === 1 ? "group" : "groups"} below the minimum {hiddenGroups === 1 ? "is" : "are"} hidden</p>
      )}
    </section>
  );
}
