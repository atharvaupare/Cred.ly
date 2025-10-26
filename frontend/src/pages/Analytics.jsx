import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Line } from "react-chartjs-2";
import { FaShoppingCart, FaUtensils, FaCar, FaHeartbeat, FaGamepad } from "react-icons/fa";
import { MdHome, MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import dayjs from "dayjs";
import "chart.js/auto";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const navigate = useNavigate();
  const transactions = useSelector((state) => state.trxns.transactions);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const today = dayjs().format("YYYY-MM-DD");
  const currentMonth = dayjs().format("YYYY-MM");
  const currentYear = dayjs().format("YYYY");

  useEffect(() => {
    const filterByPeriod = transactions.filter(({ date }) => {
      if (selectedPeriod === "today") return date === today;
      if (selectedPeriod === "month") return date.startsWith(currentMonth);
      if (selectedPeriod === "year") return date.startsWith(currentYear);
      return true;
    });
    setFilteredTransactions(filterByPeriod);
  }, [selectedPeriod, transactions]);

  const aggregateData = () => {
    let grouped = {};
    filteredTransactions.forEach(({ date, amount }) => {
      const key =
        selectedPeriod === "year" ? dayjs(date).format("MMM") : dayjs(date).format("YYYY-MM-DD");
      grouped[key] = (grouped[key] || 0) + amount;
    });
    return Object.entries(grouped).sort(([a], [b]) => (a > b ? 1 : -1));
  };

  const aggregatedData = aggregateData();
  const labels = aggregatedData.map(([key]) => key);
  const values = aggregatedData.map(([, value]) => value);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Expenses",
        data: values,
        borderColor: "#2563EB",
        backgroundColor: "rgba(37, 99, 235, 0.2)",
        fill: true,
      },
    ],
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Food & Dining":
        return <FaUtensils />;
      case "Entertainment":
        return <FaGamepad />;
      case "Shopping":
        return <FaShoppingCart />;
      case "Transport":
        return <FaCar />;
      case "Healthcare":
        return <FaHeartbeat />;
      case "Household":
        return <MdHome />;
      default:
        return <FaShoppingCart />;
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center bg-gray-100 overflow-hidden overflow-y-auto pb-20 text-black">
      <div className="absolute bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] w-screen h-[180px] rounded-b-[20%] flex items-start justify-between p-5 text-white">
        <div className="w-full h-[60%] flex items-center justify-between">
          <MdOutlineKeyboardArrowLeft
            className="text-3xl cursor-pointer"
            onClick={() => navigate("/app/home")}
          />
          <p className="text-xl font-medium">Statistics</p>
          <BsThreeDots className="text-3xl" />
        </div>
      </div>

      <div className="flex gap-2 mt-[7rem] z-10">
        {["today", "month", "year"].map((period) => (
          <button
            key={period}
            className={`w-24 px-4 py-2 rounded-full ${
              selectedPeriod === period ? "bg-[#60A5FA] text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => setSelectedPeriod(period)}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>

      <div className="w-full h-full mt-[5rem] flex justify-center">
        <Line data={chartData} />
      </div>

      <div className="mt-5 w-full px-4">
        <h3 className="text-lg font-semibold">Top Spending</h3>
        <div className="flex flex-col gap-3 mt-3">
          {filteredTransactions
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((trx, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white p-3 rounded-lg shadow-md cursor-pointer"
                onClick={() => navigate("/app/trxn_details", { state: trx })}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl text-[#1D4ED8]">{getCategoryIcon(trx.category)}</span>
                  <div>
                    <p className="text-base font-normal">{trx.transaction_title}</p>
                    <p className="text-sm text-gray-500">
                      {dayjs(trx.date).format("MMM DD, YYYY")}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-[#1D4ED8]">₹{trx.amount}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
