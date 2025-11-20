import { useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell } from "recharts";

const HeroScoreCard = ({
  score = 725,
  utilization = 38,
  balance = 45200,
  limit = 120000,
  optimizerTip = "Keep utilization below 30% to boost your credit score.",
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const utilizationData = [
    { name: "Used", value: utilization },
    { name: "Remaining", value: 100 - utilization },
  ];

  const getUtilizationColor = (value) => {
    if (value < 60) return "#22C55E"; // green
    if (value < 80) return "#FB923C"; // orange
    return "#EF4444"; // red
  };
  const COLORS = [getUtilizationColor(utilization), "#E5E7EB"];

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

      {/* Period toggles */}
      <div className="flex justify-center gap-3 mb-5">
        {["day", "week", "month"].map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            className={`px-4 py-1 rounded-full text-sm capitalize border transition ${
              selectedPeriod === p ? "bg-[#2563EB] text-white" : "border-gray-300 text-gray-600"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Utilization donut */}
      <div className="flex flex-col items-center mb-4">
        <PieChart width={150} height={150}>
          <Pie
            data={utilizationData}
            innerRadius={50}
            outerRadius={70}
            paddingAngle={4}
            dataKey="value"
          >
            {utilizationData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
        </PieChart>
        <p
          className="text-lg font-semibold mt-2"
          style={{ color: getUtilizationColor(utilization) }}
        >
          {utilization}% Used
        </p>
        <p className="text-sm text-gray-500">
          ₹{balance.toLocaleString()} / ₹{limit.toLocaleString()}
        </p>
      </div>

      {/* Optimizer tip */}
      <div className="bg-blue-50 border-l-4 border-blue-500 px-4 py-3 rounded-lg text-sm text-gray-700">
        💡 <span className="font-medium">Tip:</span> {optimizerTip}
      </div>
    </motion.div>
  );
};

export default HeroScoreCard;
