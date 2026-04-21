import { motion } from "framer-motion";

const HeroScoreCard = ({
  score = 725,
  utilization = 38,
  balance = 45200,
  limit = 120000,
  optimizerTip = "Keep utilization below 30% to boost your credit score.",
}) => {
  const numericBalance = Number(balance) || 0;
  const numericLimit = Number(limit) || 0;
  const usedPercent = Math.min(Math.max(Number(utilization) || 0, 0), 100);
  const usedRatio = numericLimit > 0 ? Math.min(numericBalance / numericLimit, 1) : 0;

  const getUtilizationColor = (value) => {
    if (value <= 30) return "#22C55E";
    if (value <= 50) return "#EAB308";
    return "#EF4444";
  };

  const utilizationColor = getUtilizationColor(usedPercent);
  const utilizationLabel =
    usedPercent <= 30 ? "Low" : usedPercent <= 50 ? "Moderate" : "High";

  return (
    <motion.div
      className="mt-[100px] bg-white shadow-lg rounded-2xl w-[90%] p-5 flex flex-col items-center z-10"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-40 h-40 flex items-center justify-center mb-3">
        <svg className="absolute w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r="70" stroke="#E5E7EB" strokeWidth="12" fill="none" />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="#2563EB"
            strokeWidth="12"
            strokeDasharray={`${(score / 900) * 440}, 440`}
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <div className="text-center">
          <p className="text-3xl text-[#2563EB] font-bold">{score}</p>
          <p className="text-sm text-gray-500">Credit Score</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-[#2563EB] mb-2 mt-4 pt-5">
        Utilisation
      </h2>

      <div className="w-full mb-4">
        <div className="flex items-end justify-between gap-3 mb-2">
          <div>
            <p
              className="text-lg font-semibold mt-2"
              style={{ color: utilizationColor }}
            >
              {usedPercent}% Used
            </p>
            <p className="text-sm text-gray-500">
              Rs. {numericBalance.toLocaleString()} / Rs. {numericLimit.toLocaleString()}
            </p>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{
              color: utilizationColor,
              backgroundColor: `${utilizationColor}1A`,
            }}
          >
            {utilizationLabel}
          </span>
        </div>

        <div className="relative pt-2">
          <div className="h-4 rounded-full overflow-hidden">
            <div className="flex h-full w-full">
              <div className="h-full bg-[#22C55E]" style={{ width: "30%" }} />
              <div className="h-full bg-[#EAB308]" style={{ width: "20%" }} />
              <div className="h-full bg-[#EF4444]" style={{ width: "50%" }} />
            </div>
          </div>

          <div
            className="absolute top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full shadow-sm"
            style={{
              left: `calc(${usedRatio * 100}% - 2px)`,
              backgroundColor: "#111827",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.9), 0 4px 10px rgba(15,23,42,0.3)",
            }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs font-medium text-gray-500">
          <span>Rs. 0</span>
          <span>Limit: Rs. {numericLimit.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded-lg text-sm text-gray-700">
        <span className="font-medium">Tip:</span> {optimizerTip}
      </div>
    </motion.div>
  );
};

export default HeroScoreCard;
