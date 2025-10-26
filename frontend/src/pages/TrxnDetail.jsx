import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import { MdHome } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaUtensils,
  FaCar,
  FaHeartbeat,
  FaGamepad,
} from "react-icons/fa";
import { IoIosArrowUp } from "react-icons/io";

const TrxnDetail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

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

  return (
    <div className="relative w-screen h-screen flex flex-col items-center bg-gray-100 text-white overflow-hidden overflow-y-auto pb-20">
      <div className="absolute bg-gradient-to-b from-[#429690] to-[#2A7C76] w-screen h-[200px] flex items-start justify-between p-5">
        <div className="flex justify-between w-full">
          <MdOutlineKeyboardArrowLeft
            className="text-3xl cursor-pointer"
            onClick={() => navigate("/app/home")}
          />
          <p className="text-xl font-semibold">Transaction Details</p>
          <BsThreeDots className="text-3xl" />
        </div>
      </div>
      <div className="bg-white text-black w-screen pb-10 absolute top-[7rem] rounded-t-[9%] z-10 flex flex-col items-center">
        <div className="flex flex-col items-center gap-5">
          <div className="w-full flex justify-center text-[#2F7E79] text-5xl mt-5">
            {getCategoryIcon(state.category)}
          </div>

          <div className="w-full flex flex-col items-center">
            <span className="text-2xl font-semibold">₹ {state.amount}</span>
            <span className="text-xl font-light">
              {state.transaction_title}
            </span>
          </div>
        </div>

        <div className="w-screen mt-10 flex flex-col items-center">
          <div className="w-screen flex justify-between items-center px-5 pb-2">
            <span className="font-medium">Transaction details</span>
            <IoIosArrowUp />
          </div>

          <div className="w-full mt-5 flex flex-col gap-3">
            <div className="flex justify-between px-6">
              <span className="font-light">Status</span>
              <span className="text-green-400">Success</span>
            </div>
            <div className="flex justify-between px-6">
              <span className="font-light">Date</span>
              <span className="">{state.date}</span>
            </div>
            <div className="flex justify-between px-6">
              <span className="font-light">Amount</span>
              <span className="text-red-500">- ₹ {state.amount}</span>
            </div>
            <div className="flex justify-between px-6">
              <span className="font-light">Saving</span>
              <span className="text-green-500">- ₹ {state.savingAmount}</span>
            </div>

            <div className="flex justify-between px-6 border-t pt-1">
              <span className="font-light">Total</span>
              <span className="text-red-500">- ₹ {state.amount + state.savingAmount}</span>
            </div>
          </div>

          <button className="p-5 border-[#2F7E79] text-[#2F7E79] border rounded-full font-bold mt-10">Download Receipt</button>
        </div>
      </div>
    </div>
  );
};

export default TrxnDetail;
