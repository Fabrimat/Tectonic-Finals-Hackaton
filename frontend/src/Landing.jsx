import { Link } from "react-router-dom";
import { scenarios, stages, stageOrder, viewOf } from "./data/scenarios";
import { useRipple } from "./lib/store";
import "./Landing.css";

export default function Landing() {
  const { scenarioId, stage, actions } = useRipple();

  const base = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0];

  return (
    <main className="landing">
      <h1>Ripple</h1>
      <p className="landing-lead">Demo controls. Open the customer app and the partner portal side by side.</p>

      <section className="landing-card">
        <h2>Scenario</h2>
        <div className="landing-choices">
          {scenarios.map((s) => (
            <button
              key={s.id}
              className={s.id === scenarioId ? "choice active" : "choice"}
              onClick={() => actions.selectScenario(s.id)}
            >
              {s.person.name}
              <span>{s.domain}</span>
            </button>
          ))}
        </div>
        <h2>Stage</h2>
        <div className="landing-stages">
          {stageOrder.map((key) => (
            <button key={key} className={key === stage ? "choice active" : "choice"} onClick={() => actions.selectStage(key)}>
              {stages[key].label}
              <span>{viewOf(base, key).window}</span>
            </button>
          ))}
        </div>
        <button className="landing-reset" onClick={actions.reset}>
          Reset decisions
        </button>
      </section>

      <nav className="landing-links">
        <Link to="/app">Customer app</Link>
        <Link to="/partner">Partner portal</Link>
        <Link to="/map">Ecosystem map</Link>
      </nav>
    </main>
  );
}
