import { FaBell } from "react-icons/fa";
import HeroScoreCard from "../components/home/HeroScoreCard";

const Home = () => {
  return (
    <div className="relative w-screen flex flex-col items-center bg-white text-white overflow-hidden overflow-y-auto pb-20">
      <div className="absolute bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] w-screen h-[250px] rounded-b-[20%] flex items-start justify-between p-5 z-0">
        <div className="flex flex-col">
          <p className="text-sm font-light">Good Evening,</p>
          <p className="text-xl font-semibold">Agney Komath</p>
        </div>
        <button className="text-white text-xl bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
          <FaBell />
        </button>
      </div>

    <HeroScoreCard />
    </div>
  );
};

export default Home;
