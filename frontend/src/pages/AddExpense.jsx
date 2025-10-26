import { FaPercentage, FaCoins, FaRupeeSign } from "react-icons/fa";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { addTransaction } from "../reducers/todoSlice";
import SavingOptions from "../components/newTransaction/SavingOptions";
import Categories from "../components/newTransaction/Categories";
import { useDispatch } from "react-redux";

const AddExpense = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [savingsType, setSavingsType] = useState("None");
  const [savingsValue, setSavingsValue] = useState(0);
  const [calculatedSavings, setCalculatedSavings] = useState(0);
  const [sliderDragging, setSliderDragging] = useState(false);

  const options = [
    { name: "None", icon: FaTimes, color: "#429690" },
    { name: "Percentage", icon: FaPercentage, color: "#429690" },
    { name: "Round-Up", icon: FaCoins, color: "#429690" },
    { name: "Fixed Amount", icon: FaRupeeSign, color: "#429690" },
  ];

  useEffect(() => {
    calculateSavings();
  }, [amount, savingsType, savingsValue]);

  const calculateSavings = () => {
    let baseAmount = parseFloat(amount) || 0;
    let savings = 0;

    if (savingsType === "Percentage") {
      savings = (parseFloat(savingsValue) / 100) * baseAmount;
    } else if (savingsType === "Round-Up") {
      const roundValue = parseInt(savingsValue) || 10;
      savings = Math.ceil(baseAmount / roundValue) * roundValue - baseAmount;
    } else if (savingsType === "Fixed Amount") {
      savings = parseFloat(savingsValue) || 0;
    }

    setCalculatedSavings(savings);
    return savings.toFixed(2);
  };

  const handleSubmit = () => {
    dispatch(
      addTransaction({
        transaction_title: name,
        amount: parseFloat(amount), // ensure this is a number
        category: category,
        savingOption: savingsType,
        savingAmount: parseFloat(calculatedSavings), // dispatch the computed savings
      })
    );

    navigate("/app/home");
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center bg-[#E5E5E5] text-black overflow-hidden pb-20 overflow-y-auto">
      <div className="absolute bg-gradient-to-b from-[#429690] to-[#2A7C76] w-screen h-[200px] rounded-b-[20%] flex items-start justify-between p-5 text-white">
        <MdOutlineKeyboardArrowLeft
          className="text-3xl cursor-pointer"
          onClick={() => navigate("/app/home")}
        />
        <p className="text-xl font-semibold">Make a Payment</p>
        <BsThreeDots className="text-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute w-[90%] max-w-md bg-white p-6 rounded-xl top-[6rem] shadow-xl"
      >
        <div className="mb-5">
          <label className="text-gray-500 font-medium block mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#2A7C76]"
            placeholder="Transaction Title"
          />
        </div>

        <div className="mb-5">
          <label className="text-gray-500 font-medium block mb-2">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-600 font-semibold">
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 pl-8 border rounded-lg text-base font-semibold focus:outline-none focus:ring-2 focus:ring-[#2A7C76]"
              placeholder="0.00"
            />
          </div>
        </div>

        <Categories category={category} setCategory={setCategory} />

        <div className="my-10 border-b">
          <div className="text-gray-500 font-medium mb-2 flex justify-between">
            <label>Add a Note</label>
            <button>+</button>
          </div>
        </div>

        <div className="mb-6 mt-6">
          <div className="flex justify-between items-center mb-4">
            <label className="text-gray-600 font-semibold">
              Save for Future
            </label>
            {savingsType !== "None" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-[#E8F5F4] px-3 py-1 rounded-full flex items-center"
              >
                <span className="text-[#2A7C76] text-sm font-medium">
                  Saving: ₹{calculatedSavings.toFixed(2)}
                </span>
              </motion.div>
            )}
          </div>

          <div className="flex justify-between gap-2 mb-4">
            {options.map(({ name, icon: Icon, color }) => (
              <motion.div
                key={name}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSavingsType(name);
                  if (name === "None") setSavingsValue(0);
                  else if (name === "Round-Up") setSavingsValue(10);
                  else if (name === "Percentage") setSavingsValue(10);
                }}
                className="relative group"
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    savingsType === name
                      ? `bg-gradient-to-br from-[${color}] to-[#2A7C76]`
                      : "bg-white"
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center ${
                      savingsType === name
                        ? `bg-gradient-to-br from-[${color}] to-[#2A7C76]`
                        : "bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`text-2xl transition-all ${
                        savingsType === name ? "text-white" : "text-gray-600"
                      }`}
                    />
                  </div>
                </div>
                <div
                  className={`mt-2 text-xs font-medium text-center transition-all duration-300 ${
                    savingsType === name
                      ? "text-[#2A7C76] font-semibold"
                      : "text-gray-500"
                  }`}
                >
                  {name}
                </div>
                {savingsType === name && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#2A7C76] rounded-full flex items-center justify-center"
                  >
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          <SavingOptions
            savingsValue={savingsValue}
            setSavingsValue={setSavingsValue}
            setSliderDragging={setSliderDragging}
            savingsType={savingsType}
            amount={amount}
            calculatedSavings={calculatedSavings}
          />
        </div>

        <div className="flex gap-4 mt-6">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex-1 py-3 rounded-lg font-semibold border border-[#2A7C76] text-[#2A7C76] hover:bg-[#F0F9F9] transition-all"
            onClick={() => navigate("/app/home")}
          >
            Cancel
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            className="flex-1 bg-gradient-to-r from-[#429690] to-[#2A7C76] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-md"
            onClick={handleSubmit}
          >
            Confirm
          </motion.button>
        </div>

        {savingsType !== "None" && parseFloat(calculatedSavings) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg bg-[#E8F5F4] border border-[#C5E6E4]"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-[#2A7C76] flex items-center justify-center mr-3">
                <FaCoins className="text-white text-sm" />
              </div>
              <div>
                <p className="text-[#2A7C76] font-medium">
                  You'll save ₹{calculatedSavings.toFixed(2)} with this
                  transaction
                </p>
                <p className="text-xs text-gray-600">
                  This will be added to your savings goal
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default AddExpense;
