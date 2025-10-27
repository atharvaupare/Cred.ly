import {
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaCalendar,
} from "react-icons/fa";

const StatsCard = ({total, selectedPeriod, setSelectedPeriod, savings, carbon}) => {
  const periodLabels = {
    year: "This Year",
    month: "This Month",
    week: "This Week",
    today: "Today",
  };

  return (
    <div className="bg-[#2F7E79] w-[80%] h-[200px] absolute mt-[7rem] rounded-3xl mx-auto flex flex-col justify-between p-6 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <p className="text-sm opacity-80">Total Expense</p>
          <p className="text-2xl font-semibold">₹ {total}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-center text-xl font-thin opacity-90">
            {periodLabels[selectedPeriod]}
          </p>
          <div className="flex gap-2">
            {Object.keys(periodLabels).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`p-2 rounded-full transition ${
                  selectedPeriod === period
                    ? "bg-white text-[#2F7E79] shadow-md"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                {period === "year" && <FaCalendar className="text-sm" />}
                {period === "month" && <FaCalendarAlt className="text-sm" />}
                {period === "week" && <FaCalendarWeek className="text-sm" />}
                {period === "today" && <FaCalendarDay className="text-sm" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <div className="flex flex-col">
          <p className="text-sm opacity-80">Total Saved</p>
          <p className="text-xl font-semibold">₹ {savings}</p>
        </div>
        <div className="flex flex-col">
          <p className="text-sm opacity-80">Carbon Footprint</p>
          <p className="text-xl font-semibold">{carbon} Kg</p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
