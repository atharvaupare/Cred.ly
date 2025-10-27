import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import {
  FaShoppingCart,
  FaUtensils,
  FaCar,
  FaHeartbeat,
  FaGamepad,
} from "react-icons/fa";
import { MdHome } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const TrxHistory = ({ setTotal, selectedPeriod, setSavings, setCarbon }) => {
  const navigate = useNavigate();

  const [fullList, setFullList] = useState(false);
  const transactions = useSelector((state) => state.trxns.transactions);

  const today = dayjs().format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const lastMonday = dayjs().startOf("week").add(1, "day").format("YYYY-MM-DD");
  const currentMonth = dayjs().format("YYYY-MM");
  const currentYear = dayjs().format("YYYY");

  const formatTransactionDate = (date) => {
    if (date === today) return "Today";
    if (date === yesterday) return "Yesterday";
    return date;
  };

  const getCategoryIcon = (categoryName) => {
    switch (categoryName) {
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

  const filteredTransactions = transactions.filter(({ date }) => {
    if (selectedPeriod === "today") return date === today;
    if (selectedPeriod === "week") return date >= lastMonday;
    if (selectedPeriod === "month") return date.startsWith(currentMonth);
    if (selectedPeriod === "year") return date.startsWith(currentYear);
    return true;
  });

  const displayList = fullList
    ? filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    : filteredTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 4);

  useEffect(() => {
    let total = 0;
    let saving = 0;
    filteredTransactions.forEach((element) => {
      total += Number(element.amount);
      saving += Number(element.savingAmount)
    });
    let carbon = 0;
    filteredTransactions.forEach(transaction => {
      switch (transaction.category) {
        case "Food & Dining":
          carbon += transaction.amount * 0.0002; // kg CO2 per rupee
          break;
        case "Transport":
          carbon += transaction.amount * 0.0005; 
          break;
        case "Shopping":
          carbon += transaction.amount * 0.0003;
          break;
        case "Household":
          carbon += transaction.amount * 0.0004;
          break;
        default:
          carbon += transaction.amount * 0.0001;
      }
    });
    setCarbon(Math.round(carbon));
    setTotal(total);
    setSavings(saving);
  }, [filteredTransactions, setTotal]);

  return (
    <div className="relative w-full flex flex-col items-center mt-[20rem] p-5">
      <div className="text-black flex justify-between w-full items-center">
        <h2 className="font-semibold text-base">
          Transaction History ({filteredTransactions.length})
        </h2>
        <button
          className="font-extralight text-sm"
          onClick={() => setFullList((prev) => !prev)}
        >
          {fullList ? "See Less" : "See all"}
        </button>
      </div>
      <table className="w-full text-black border-b border-b-black">
        <tbody>
          {displayList.map((transaction) => (
            <tr
              key={transaction.id}
              className="border-b"
              onClick={() =>
                navigate("/app/trxn_details", { state: transaction })
              }
            >
              <td className="py-3 flex items-center gap-3">
                <span className="text-xl text-[#2A7C76]">
                  {getCategoryIcon(transaction.category)}
                </span>
                <div>
                  <p className="text-base">{transaction.transaction_title}</p>
                  <p className="text-sm font-light">
                    {formatTransactionDate(transaction.date)} ·{" "}
                    {transaction.category}
                  </p>
                </div>
              </td>
              <td className="py-3 text-red-600 text-right">
                - ₹{transaction.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrxHistory;
