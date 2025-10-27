import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FixedAmt from "./FixedAmt";
import RoundAmt from "./RoundAmt";

const SavingOptions = ({
  savingsValue,
  setSavingsValue,
  setSliderDragging,
  savingsType,
  amount,
  calculatedSavings,
}) => {
  const sliderRef = useRef(null);
  const percentageSnapPoints = [5, 10, 15, 20, 25, 30, 50, 75, 100];
  const handleSliderChange = (e) => {
    setSavingsValue(e.target.value);
  };

  const handleSliderEnd = () => {
    setSliderDragging(false);

    const currentValue = parseFloat(savingsValue);
    const closest = percentageSnapPoints.reduce((prev, curr) => {
      return Math.abs(curr - currentValue) < Math.abs(prev - currentValue)
        ? curr
        : prev;
    });

    if (Math.abs(closest - currentValue) < 5) {
      setSavingsValue(closest);
    }
  };

  return (
    <AnimatePresence>
      {savingsType === "Percentage" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="bg-[#F8FCFC] p-4 rounded-lg border border-[#E0F0EF] mb-4">
            <div className="flex justify-between items-center mb-3">
              <label className="text-gray-600 font-medium">
                Percentage to Save
              </label>
              <span className="text-[#2A7C76] font-bold text-lg">
                {Math.round(savingsValue)}%
              </span>
            </div>

            {/* Slider container */}
            <div className="relative mt-4 mb-6">
              {/* Background track */}
              <div className="w-full h-2 bg-gray-200 rounded-full" />

              {/* Active track */}
              <div
                className="absolute top-0 left-0 h-2 bg-[#2A7C76] rounded-full transition-all duration-200"
                style={{ width: `${Math.min(savingsValue, 100)}%` }}
              />

              {/* Hidden range input */}
              <input
                ref={sliderRef}
                type="range"
                min="0"
                max="100"
                step="1"
                value={savingsValue}
                onChange={handleSliderChange}
                onMouseDown={() => setSliderDragging(true)}
                onTouchStart={() => setSliderDragging(true)}
                onMouseUp={handleSliderEnd}
                onTouchEnd={handleSliderEnd}
                className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
                style={{ opacity: 0 }}
              />

              {/* Custom thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                style={{
                  left: `${Math.min(savingsValue, 100)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div className="w-5 h-5 rounded-full bg-[#2A7C76] ring-2 ring-white shadow-md"></div>
              </div>
            </div>

            {/* Quick preset buttons */}
            <div className="flex justify-between gap-2 mt-3">
              {[10, 25, 50, 100].map((percent) => (
                <div
                  key={percent}
                  onClick={() => setSavingsValue(percent)}
                  className={`flex-1 py-2 rounded-lg text-center cursor-pointer transition-all duration-200 text-sm font-medium ${
                    Math.round(savingsValue) === percent
                      ? "bg-[#2A7C76] text-white"
                      : "bg-white border border-gray-300 text-gray-700"
                  }`}
                >
                  {percent}%
                </div>
              ))}
            </div>

            {/* Calculation display */}
            <div className="text-sm text-gray-500 mt-4">
              {amount
                ? `₹${parseFloat(amount).toFixed(2)} × ${
                    parseFloat(savingsValue) || 0
                  }% = ₹${(calculatedSavings.toFixed(2))}`
                : "Enter an amount to calculate savings"}
            </div>
          </div>
        </motion.div>
      )}

      {savingsType === "Round-Up" && (
        <RoundAmt savingsValue={savingsValue} setSavingsValue={setSavingsValue} amount={amount} calculatedSavings={calculatedSavings}/>
      )}

      {savingsType === "Fixed Amount" && (
        <FixedAmt savingsValue={savingsValue} setSavingsValue={setSavingsValue} amount={amount}/>
      )}
    </AnimatePresence>
  );
};

export default SavingOptions;
