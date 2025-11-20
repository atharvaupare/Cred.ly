// src/pages/ScenarioHistory.jsx
import { useContext, useMemo } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function formatDateParts(d) {
  try {
    const dt = new Date(d);
    const date = dt.toLocaleDateString();
    const time = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { date, time };
  } catch {
    return { date: d, time: "" };
  }
}

const Row = ({ entry, onOpen }) => {
  const { date, time } = formatDateParts(entry.created_at);

  const baseScore =
    typeof entry.base?.score === "number" ? Math.round(entry.base.score) : null;
  const newScore =
    typeof entry.scenario?.score === "number" ? Math.round(entry.scenario.score) : null;

  let newScoreClass = "text-gray-500";
  if (baseScore !== null && newScore !== null) {
    newScoreClass = newScore >= baseScore ? "text-green-600" : "text-red-600";
  }

  return (
    <button
      onClick={onOpen}
      className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-xl shadow-sm hover:shadow-md transition text-left"
      aria-label={`Open scenario from ${date} ${time}`}
    >
      <div className="flex gap-4 items-center min-w-0">
        <div className="text-sm">
          <div className="font-medium text-gray-800">{date}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
      </div>

      {/* NEW: Old score → New score */}
      <div className="text-sm font-semibold flex items-center gap-1">
        <span className="text-gray-700">
          {baseScore !== null ? baseScore : "—"}
        </span>

        <span className="text-gray-400">→</span>

        <span className={newScoreClass}>
          {newScore !== null ? newScore : "—"}
        </span>
      </div>
    </button>
  );
};


const ScenarioHistory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const scenarios = user?.scenarios || [];

  const sorted = useMemo(() => {
    return [...scenarios].sort((a, b) => {
      const ta = new Date(a.created_at).getTime() || 0;
      const tb = new Date(b.created_at).getTime() || 0;
      return tb - ta;
    });
  }, [scenarios]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] p-5 text-white">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/app/profile")} className="text-white/90">
            ← Back
          </button>
          <h2 className="text-lg font-semibold">Scenario history</h2>
        </div>
        <p className="text-sm mt-2 text-white/80">All your saved what-if simulations</p>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {sorted.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No scenarios yet — run a simulation to see results here.
          </div>
        )}

        {sorted.map((entry, idx) => {
          const id = entry._id || entry.id || idx;
          return (
            <Row
              key={id}
              entry={entry}
              onOpen={() => navigate(`/app/scenario/${encodeURIComponent(id)}`)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ScenarioHistory;
