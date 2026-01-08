import React, { useEffect, useMemo, useState } from "react";
import "./acheevyBezel.css";

/**
 * ACHEEVY UNIFIED BEZEL — STAGE 2 EXECUTION CONTROL STRIP
 *
 * Contains:
 * - 4 Modes: THE LAB, NURD OUT, THE FORGE, POLISH
 * - FIND/SCOUT button (web crawl with first-time disclaimer)
 * - LUC token quote display
 * - Circuit Box toggles (11 Labs, 12 Labs, SAM, Higgsfield)
 */
export default function AcheevyBezel({
  enabled = true,
  mode,
  onModeChange,
  lucQuoteText = "Tokens: —",
  onFindScout,
  circuitBox = { labs11: false, labs12: false, sam: false, higgsfield: false },
  onCircuitBoxChange,
}) {
  const modes = useMemo(
    () => [
      { id: "lab", label: "THE LAB" },
      { id: "nerdout", label: "NURD OUT" },
      { id: "forge", label: "THE FORGE" },
      { id: "polish", label: "POLISH" },
    ],
    []
  );

  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("acheevy_findscout_seen");
    if (!seen) {
      setShowDisclaimer(false);
    }
  }, []);

  const handleFindScout = async () => {
    const seen = localStorage.getItem("acheevy_findscout_seen");

    if (!seen) {
      setShowDisclaimer(true);
      return;
    }

    if (typeof onFindScout === "function") {
      return onFindScout();
    }
  };

  const handleDisclaimerAccept = () => {
    localStorage.setItem("acheevy_findscout_seen", "1");
    setShowDisclaimer(false);

    if (typeof onFindScout === "function") {
      onFindScout();
    }
  };

  return (
    <div className="acheevy-bezel" role="region" aria-label="ACHEEVY Bezel">
      <div className="acheevy-bezel__left">
        <div className="acheevy-bezel__group" aria-label="Modes">
          <span className="acheevy-bezel__label">Mode</span>
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              className={
                "acheevy-bezel__btn " +
                (mode === m.id ? "acheevy-bezel__btn--active" : "")
              }
              disabled={!enabled}
              onClick={() => onModeChange?.(m.id)}
              aria-pressed={mode === m.id}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="acheevy-bezel__group" aria-label="Web crawl">
          <button
            type="button"
            className="acheevy-bezel__btn"
            disabled={!enabled}
            onClick={handleFindScout}
            title="Activate FIND/SCOUT web crawl"
          >
            FIND/SCOUT
          </button>
        </div>
      </div>

      <div className="acheevy-bezel__right">
        <span className="acheevy-bezel__pill" aria-label="LUC token quote">
          {lucQuoteText}
        </span>

        <div className="acheevy-bezel__group" aria-label="Circuit Box">
          <span className="acheevy-bezel__label">Circuit Box</span>
          <label className="acheevy-bezel__toggle">
            <input
              type="checkbox"
              checked={!!circuitBox.labs11}
              disabled={!enabled}
              onChange={(e) =>
                onCircuitBoxChange?.({ ...circuitBox, labs11: e.target.checked })
              }
            />
            11 Labs
          </label>
          <label className="acheevy-bezel__toggle">
            <input
              type="checkbox"
              checked={!!circuitBox.labs12}
              disabled={!enabled}
              onChange={(e) =>
                onCircuitBoxChange?.({ ...circuitBox, labs12: e.target.checked })
              }
            />
            12 Labs
          </label>
          <label className="acheevy-bezel__toggle">
            <input
              type="checkbox"
              checked={!!circuitBox.sam}
              disabled={!enabled}
              onChange={(e) =>
                onCircuitBoxChange?.({ ...circuitBox, sam: e.target.checked })
              }
            />
            SAM
          </label>
          <label className="acheevy-bezel__toggle">
            <input
              type="checkbox"
              checked={!!circuitBox.higgsfield}
              disabled={!enabled}
              onChange={(e) =>
                onCircuitBoxChange?.({
                  ...circuitBox,
                  higgsfield: e.target.checked,
                })
              }
            />
            Higgsfield
          </label>
        </div>
      </div>

      {showDisclaimer && (
        <div className="acheevy-bezel__disclaimer">
          <p>
            <strong>FIND/SCOUT</strong> activates web crawling capabilities powered by
            Firecrawl. When you send your next prompt, ACHEEVY will crawl the specified
            URL(s) and return structured data directly into this chat—without leaving
            this screen.
          </p>
          <button
            type="button"
            className="acheevy-bezel__disclaimer-close"
            onClick={handleDisclaimerAccept}
          >
            Got it — Activate FIND/SCOUT
          </button>
        </div>
      )}
    </div>
  );
}
