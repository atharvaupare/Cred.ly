import { useContext, useMemo } from "react";
import { FaBell } from "react-icons/fa";
import HeroScoreCard from "../components/home/HeroScoreCard";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user, initializing } = useContext(AuthContext);
  const navigate = useNavigate();
  const profile = user?.user_profile;

  const {
    score,
    credit_limit: limit,
    credit_balance: balance,
  } = profile || {
    score: 0,
    credit_limit: 0,
    credit_balance: 0,
  };

  const utilization = useMemo(() => {
    const l = Number(limit) || 0;
    const b = Number(balance) || 0;
    if (l <= 0) return 0;
    return Math.round((b / l) * 100);
  }, [limit, balance]);

  const optimizerTip = useMemo(() => {
    if (utilization <= 30)
      return "Great — keep utilisation below 30% to improve your score.";
    if (utilization <= 50)
      return "You're OK — try reducing balances to get under 30% utilisation.";
    return "High utilisation — paying down balances or increasing limit (carefully) will help your score.";
  }, [utilization]);

  return (
    <div className="relative w-screen flex flex-col items-center bg-white text-white overflow-hidden overflow-y-auto pb-20">
      <div className="absolute bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] w-screen h-[250px] rounded-b-[20%] flex items-start justify-between p-5 z-0">
        <div className="flex flex-col">
          <p className="text-sm font-light">Welcome to</p>
          <p className="text-xl font-semibold">
            {profile?.name || "Cred.ly"}
          </p>
        </div>
        <button className="text-white text-xl bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
          <FaBell />
        </button>
      </div>

      <HeroScoreCard
        score={score ? Math.round(Number(score)) : 0}
        utilization={utilization}
        balance={balance || 0}
        limit={limit || 0}
        optimizerTip={optimizerTip}
      />

      <div className="w-[90%] mt-6">
        <button
          onClick={() => navigate("/app/simulator")}
          className="w-full bg-[#2563EB] hover:bg-[#1E3A8A] text-white py-4 px-6 rounded-2xl shadow-lg transition flex items-center justify-between"
        >
          <div className="flex flex-col text-left">
            <span className="text-lg font-semibold">
              Not sure how to improve your score?
            </span>
            <span className="text-sm opacity-90">
              Try our What-If Simulator ⚡
            </span>
          </div>
          <div className="w-10 h-10 bg-white justify-center items-center rounded-xl ">
            <span className="text-2xl text-black">→</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Home;
