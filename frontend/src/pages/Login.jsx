import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiPhone, FiLock } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();

  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  const inputClass =
    "w-full mt-2 px-4 py-3 pl-12 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/40";

  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-lg";

  const handleLogin = () => {
    const data = {
      mobile_number: mobile,
      password: password,
    };

    console.log("LOGIN DATA:", data);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 px-6 relative overflow-hidden">
      {/* Glow effect */}
      <div
        className="absolute -top-36 -right-20 w-[22rem] h-[22rem] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(closest-side, #06B6D4, transparent)",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-xl relative z-10 overflow-hidden"
      >
        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h2>

        <div className="flex flex-col gap-4">
          {/* Mobile Number */}
          <div className="relative">
            <FiPhone className={iconClass} />
            <input
              type="text"
              value={mobile}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value) && value.length <= 10) {
                  setMobile(value);
                }
              }}
              inputMode="numeric"
              placeholder="Mobile Number"
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FiLock className={iconClass} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={inputClass}
            />
          </div>

          {/* Login Button */}
          <button
            onClick={() => mobile.length === 10 && password && handleLogin()}
            className={`w-full py-3 rounded-xl font-bold shadow-md transition 
              ${
                mobile.length === 10 && password
                  ? "bg-white text-blue-600 hover:bg-blue-50"
                  : "bg-white/40 text-white/60 cursor-not-allowed"
              }
            `}
          >
            Login
          </button>
        </div>

        {/* Footer */}
        <p className="text-white/80 text-sm text-center mt-4">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-white font-semibold underline cursor-pointer"
          >
            Register
          </span>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
