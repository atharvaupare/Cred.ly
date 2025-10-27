import { motion } from "framer-motion";

const RoundAmt = ({savingsValue, setSavingsValue, amount, calculatedSavings}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-[#F8FCFC] p-4 rounded-lg border border-[#E0F0EF] mb-4">
        <label className="text-gray-600 font-medium block mb-2">
          Round-Up to
        </label>
        <div className="flex gap-3">
          {[10, 50, 100].map((value) => (
            <motion.div
              key={value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSavingsValue(value)}
              className={`flex-1 p-3 rounded-lg ${
                parseInt(savingsValue) === value
                  ? "bg-[#2A7C76] text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              } text-center cursor-pointer transition-all duration-200`}
            >
              ₹{value}
            </motion.div>
          ))}
        </div>
        {amount && (
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Original amount:</span>
              <span>₹{parseFloat(amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Rounded to:</span>
              <span>
                ₹
                {Math.ceil(parseFloat(amount) / parseInt(savingsValue)) *
                  parseInt(savingsValue) || 0}
              </span>
            </div>
            <div className="flex justify-between mt-1 font-medium text-[#2A7C76]">
              <span>You save:</span>
              <span>₹{(calculatedSavings || 0).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RoundAmt;
