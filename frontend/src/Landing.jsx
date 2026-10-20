import { Link } from "react-router-dom";
import { scenarios, stages, stageOrder, viewOf } from "./data/scenarios";
import { useRipple } from "./lib/store";
import KbcLogo from "./components/KbcLogo";
import "./Landing.css";

export default function Landing() {
  const { scenarioId, stage, actions } = useRipple();
  const base = scenarios.find((s) => s.id === scenarioId) ?? scenarios[0];
  return (
    <main className="landing">
      <div className="landing-brand">
        <KbcLogo />
      </div>
      <h1>KBC energy transition</h1>
      <section className="landing-card">
        <div className="landing-choices" role="group" aria-label="Scenario">
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
        <div className="landing-stages" role="group" aria-label="Stage">
          {stageOrder.map((key) => (
            <button key={key} className={key === stage ? "choice active" : "choice"} onClick={() => actions.selectStage(key)}>
              {stages[key].label}
              <span>{viewOf(base, key).window}</span>
            </button>
          ))}
        </div>
        <button className="landing-reset" onClick={actions.reset}>
          Reset
        </button>
      </section>
      <nav className="landing-links">
        <Link to="/app">Customer app</Link>
        <Link to="/partner">Advisor dashboard</Link>
        <Link to="/partner/numbers">Numbers</Link>
        <Link to="/map">Ecosystem map</Link>
      </nav>
    </main>
  );
}
