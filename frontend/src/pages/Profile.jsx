// src/pages/Profile.jsx
import { FaBell } from "react-icons/fa";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { HiUser, HiUsers, HiMail, HiShieldCheck, HiLockClosed } from "react-icons/hi";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import profile from "../assets/profile.png";

const Profile = () => {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);


  const mobile = user?.mobile_number || user?.user_profile?.mobile_number || "Unknown";

  const menuItems = [
    {
      icon: <HiUser className="text-gray-600 text-2xl" />,
      label: "Account info",
    },
    {
      icon: <HiUsers className="text-gray-600 text-2xl" />,
      label: "Personal profile",
    },
    {
      icon: <HiMail className="text-gray-600 text-2xl" />,
      label: "Message center",
    },
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

        {/* profile image: primary uses imported asset, fallback to uploaded path */}
        <img
          src={profile}
          alt="profile"
          className="absolute mt-[9rem] w-[110px] h-[110px] rounded-full shadow-lg object-cover"
        />
      </div>

      <div className="w-screen bg-white mt-[230px] flex flex-col items-center">
        <div className="flex flex-col mt-12 items-center">
          <span className="text-xl font-semibold">{mobile}</span>
          {/* <span className="text-sm text-gray-500">@{mobile.slice(-6)}</span> */}
        </div>

        <div className="w-full flex flex-col mt-3 items-center border-t pt-3">
          <div className="w-80">
            {/* {menuItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 py-3 px-4 hover:bg-gray-100 rounded-lg cursor-pointer"
              >
                {item.icon}
                <span className="text-gray-800">{item.label}</span>
              </div>
            ))} */}

            {/* Scenario history CTA */}
            <div
              onClick={() => navigate("/app/scenarios")}
              className="flex items-center justify-between gap-4 py-3 px-4 mt-4 rounded-lg cursor-pointer border border-gray-100 bg-gray-50 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-4">
                <svg
                  className="w-7 h-7 rounded-md bg-[#2563EB] text-white flex items-center justify-center p-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 6v6l4 2"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">Scenario history</span>
                  <span className="text-xs text-gray-500">View your past what-if simulations</span>
                </div>
              </div>
              <span className="text-gray-400">→</span>
            </div>

            {/* LOGOUT BUTTON */}
            <div
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
              className="flex items-center gap-4 py-3 px-4 mt-4 rounded-lg cursor-pointer text-red-600 font-semibold hover:bg-red-50 transition"
            >
              <FiLogOut className="text-2xl" />
              <span>Logout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
