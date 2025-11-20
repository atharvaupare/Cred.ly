// src/pages/ScenarioDetail.jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";

function prettyDateTime(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

const safeRound = (v) => (typeof v === "number" ? Math.round(v) : v ?? "—");

const ScenarioDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const scenarios = user?.scenarios || [];

  // try: exact id match (_id or id), numeric index fallback, iso-created_at fallback
  let entry =
    scenarios.find((s) => String(s._id ?? s.id ?? "") === id) ||
    (Number.isFinite(Number(id)) && scenarios[Number(id)]) ||
    scenarios.find((s) => {
      try {
        // compare ISO form so different local formats don't break
        return new Date(s.created_at).toISOString() === new Date(id).toISOString();
      } catch {
        return false;
      }
    });

  // final fallback: maybe the router encoded a URI component of created_at
  if (!entry) {
    entry = scenarios.find((s) => String(s.created_at) === id);
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto">
          <button className="text-sm text-blue-600 mb-4" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="bg-white rounded-xl p-6 shadow">
            <h3 className="text-lg font-semibold mb-2">Scenario not found</h3>
            <p className="text-sm text-gray-600">We couldn't find that scenario in your account.</p>
          </div>
        </div>
      </div>
    );
  }

  const baseScore = entry.base?.score ?? null;
  const newScore = entry.scenario?.score ?? null;
  const modified = (entry.features_modified || []).join(", ") || "—";
  const advice = entry.advice || {};

  return (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-3xl mx-auto">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[#2563EB] hover:text-[#1E3A8A] mb-4 font-medium"
      >
        <MdOutlineKeyboardArrowLeft size={20} />
        <span>Back</span>
      </button>

      <div className="bg-white rounded-xl p-6 shadow-md">

        {/* Date */}
        <div className="text-sm text-gray-500">
          {prettyDateTime(entry.created_at)}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold mt-2 text-gray-800">
          Scenario Details
        </h2>

        {/* Scores */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="text-xs font-semibold text-blue-700">Base Score</div>
            <div className="text-xl font-semibold text-blue-900 mt-1">
              {safeRound(baseScore)}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="text-xs font-semibold text-blue-700">New Score</div>
            <div className="text-xl font-semibold text-blue-900 mt-1">
              {safeRound(newScore)}
            </div>
          </div>
        </div>

        {/* Modified Features */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Modified Features
          </h3>
          <p className="mt-2 text-gray-800">{modified}</p>
        </div>

        {/* Advice Section */}
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Why Change
            </h3>
            <p className="mt-2 text-gray-800">{advice.why_change || "—"}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Do / Don’t
            </h3>
            <p className="mt-2 text-gray-800">{advice.do_dont || "—"}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Affordability
            </h3>
            <p className="mt-2 text-gray-800">{advice.affordability || "—"}</p>
          </div>
        </div>

        {/* Raw Data */}
        <details className="mt-6 text-sm text-gray-600">
          <summary className="cursor-pointer text-[#2563EB] hover:text-[#1E3A8A] font-medium">
            Show raw data
          </summary>
          <pre className="mt-2 whitespace-pre-wrap text-xs bg-gray-100 p-3 rounded-lg">
            {JSON.stringify(entry, null, 2)}
          </pre>
        </details>

      </div>
    </div>
  </div>
);

};

export default ScenarioDetail;
