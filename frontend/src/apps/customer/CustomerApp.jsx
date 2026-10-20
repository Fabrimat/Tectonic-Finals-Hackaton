import { useState } from "react";
import { scenarios, stages, stageOrder } from "../../data/scenarios";
import { useRipple } from "../../lib/store";
import { view } from "../../lib/params";
import ConfirmCard from "./ConfirmCard";
import RippleReveal from "./RippleReveal";
import StageTag from "./StageTag";
import InsightCard from "./InsightCard";
import ActionCard from "./ActionCard";
import HoldCard from "./HoldCard";
import PlanBoard from "./PlanBoard";
import SummaryBar from "./SummaryBar";
import HomeScreen from "./HomeScreen";
import TabBar from "./TabBar";
import Icon from "./icons";
import KbcLogo from "../../components/KbcLogo";
import "./customer.css";
import "./home.css";

export default function CustomerApp() {
  const { scenario, confirmed, decisions, choices, actions } = useRipple();
  const [rippling, setRippling] = useState(false);
  const [open, setOpen] = useState(view.open);
  const { stage } = scenario;
  const ready = stage === "ready";
  const planShown = confirmed && !rippling && scenario.allowedActions.some((a) => a.kind === "plan");

  function confirm() {
    setRippling(true);
    actions.confirmSignal();
  }

  const tools = view.tools && (
    <div className="cx-tools">
      <p className="cx-tools-title">Demo tools</p>
      <div className="cx-switch">
        <label htmlFor="cx-scenario">Customer</label>
        <select id="cx-scenario" value={scenario.id} onChange={(e) => actions.selectScenario(e.target.value)}>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.person.name}
            </option>
          ))}
        </select>
      </div>
      <div className="cx-switch cx-demo" role="group" aria-label="Demo control, ladder stage">
        <span>Demo control, stage</span>
        {stageOrder.map((key) => (
          <button
            key={key}
            type="button"
            className={key === stage ? "cx-stage-btn is-active" : "cx-stage-btn"}
            aria-pressed={key === stage}
            onClick={() => actions.selectStage(key)}
          >
            {stages[key].label}
          </button>
        ))}
      </div>
    </div>
  );

  if (!open) {
    return (
      <div className="cx cx-is-home">
        <HomeScreen scenario={scenario} confirmed={confirmed} decisions={decisions} onOpen={() => setOpen(true)} tools={tools} />
        <TabBar onStart={() => setOpen(false)} />
      </div>
    );
  }

  return (
    <div className="cx">
      <header className="cx-top">
        <button type="button" className="cx-back" aria-label="Back to start" onClick={() => setOpen(false)}>
          <Icon name="back" size={26} />
        </button>
        <p className="cx-top-title">Energy radar</p>
        <KbcLogo className="cx-logo" />
      </header>

      <main className="cx-main">
        <StageTag scenario={scenario} />
        {scenario.allowedActions.map((action) => {
          switch (action.kind) {
            case "awareness":
              return (
                <InsightCard
                  key="awareness"
                  scenario={scenario}
                  confirmed={confirmed}
                  onConfirm={actions.confirmSignal}
                  onDecline={actions.declineSignal}
                />
              );
            case "question":
              if (confirmed) return stage === "forming" ? <HoldCard key="question" scenario={scenario} /> : null;
              return (
                <ConfirmCard
                  key="question"
                  scenario={scenario}
                  onConfirm={ready ? confirm : actions.confirmSignal}
                  onDecline={actions.declineSignal}
                />
              );
            case "optional":
            case "opportunity":
            case "introduction":
              if (action.kind !== "optional" && !confirmed) return null;
              return (
                <ActionCard
                  key={action.id}
                  action={action}
                  enabled={confirmed}
                  chosen={Boolean(choices[action.id])}
                  onChoose={() => actions.choose(action.id)}
                  onUndo={() => actions.unchoose(action.id)}
                />
              );
            case "plan":
              if (!confirmed) return null;
              return rippling ? (
                <RippleReveal key="plan" label={scenario.signal.question} onDone={() => setRippling(false)} />
              ) : (
                <PlanBoard key="plan" scenario={scenario} decisions={decisions} actions={actions} />
              );
            default:
              return null;
          }
        })}
      </main>

      {planShown && <SummaryBar scenario={scenario} decisions={decisions} onReset={actions.reset} />}
      <TabBar onStart={() => setOpen(false)} />
    </div>
  );
}
