import { motion } from "framer-motion";

const FixedAmt = ({savingsValue, setSavingsValue, amount}) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="bg-[#F8FCFC] p-4 rounded-lg border border-[#E0F0EF] mb-4">
        <label className="text-gray-600 font-medium block mb-2">
          Fixed Amount to Save
        </label>
        <div className="relative">
          <span className="absolute left-3 top-3 text-gray-600 font-semibold">
            ₹
          </span>
          <input
            type="number"
            value={savingsValue}
            onChange={(e) => setSavingsValue(e.target.value)}
            className="w-full p-3 pl-8 border rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#2A7C76]"
            placeholder="Enter amount"
          />
        </div>

        <div className="flex justify-between gap-2 mt-4">
          {[50, 100, 500, 1000].map((value) => (
            <motion.div
              key={value}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSavingsValue(value)}
              className={`flex-1 py-2 rounded-lg ${
                parseInt(savingsValue) === value
                  ? "bg-[#2A7C76] text-white"
                  : "bg-white border border-gray-300 text-gray-700"
              } text-center cursor-pointer transition-all duration-200 text-xs md:text-sm font-medium`}
            >
              ₹{value}
            </motion.div>
          ))}
        </div>

        {amount && parseFloat(amount) > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            <div className="flex justify-between font-medium text-[#2A7C76]">
              <span>Saving fixed amount:</span>
              <span>₹{(parseFloat(savingsValue) || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between mt-1">
              <span>That's approximately:</span>
              <span>
                {(
                  (parseFloat(savingsValue) / parseFloat(amount)) *
                  100
                ).toFixed(1)}
                % of your expense
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FixedAmt;
