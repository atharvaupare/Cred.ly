import { FaBell } from "react-icons/fa";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import {
  HiUser,
  HiUsers,
  HiMail,
  HiShieldCheck,
  HiLockClosed,
} from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import profile from "../assets/profile.png";

const Profile = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: <HiUser className="text-gray-600 text-2xl" />, label: "Account info" },
    { icon: <HiUsers className="text-gray-600 text-2xl" />, label: "Personal profile" },
    { icon: <HiMail className="text-gray-600 text-2xl" />, label: "Message center" },
    {
      icon: <HiShieldCheck className="text-gray-600 text-2xl" />,
      label: "Login and security",
    },
    {
      icon: <HiLockClosed className="text-gray-600 text-2xl" />,
      label: "Data and privacy",
    },
  ];

  return (
    <div className="relative w-screen h-screen flex flex-col items-center overflow-hidden pb-20 text-black">
      <div className="absolute bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] w-screen h-[230px] rounded-b-[40%] flex flex-col items-center justify-between p-5 text-white">
        <div className="h-[45%] w-full flex items-center justify-between">
          <MdOutlineKeyboardArrowLeft
            className="text-3xl cursor-pointer"
            onClick={() => navigate("/app/home")}
          />
          <p className="text-xl font-medium">Profile</p>
          <button className="text-white text-xl bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
            <FaBell />
          </button>
        </div>

        <img
          src={profile}
          alt=""
          className="absolute mt-[9rem] size-[110px] rounded-full shadow-lg"
        />
      </div>
      <div className="w-screen bg-white mt-[230px] flex flex-col items-center">
        <div className="flex flex-col mt-12 items-center">
          <span className="text-xl font-semibold">Agney Komath</span>
          <span>@AgneyK</span>
        </div>

        <div className="w-full flex flex-col mt-3 items-center border-t pt-3">
          <div className="w-80">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 py-3 px-4 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                {item.icon}
                <span className="text-gray-800">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
