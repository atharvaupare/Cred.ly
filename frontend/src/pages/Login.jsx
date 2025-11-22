import { useState, useContext, useEffect } from "react";
import { motion } from "framer-motion";
import { FiPhone, FiLock, FiAlertCircle } from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const {
    login,
    error: authError,
    isAuthenticated,
    initializing,
  } = useContext(AuthContext);

  const navigate = useNavigate();

  const [mobile, setMobile] = useState("9991112222");
  const [password, setPassword] = useState("password");
  const [submitting, setSubmitting] = useState(false);

  const inputClass =
    "w-full mt-2 px-4 py-3 pl-12 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/40";

  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-lg";

  const handleLoginClick = async () => {
    if (mobile.length !== 10 || !password || submitting) return;
    setSubmitting(true);

    const ok = await login(mobile, password);

    setSubmitting(false);

    // ❌ DO NOT navigate here — causes race condition
    // Profile might not be loaded yet
  };

  // ⭐ AUTO REDIRECT WHEN LOGGED IN
  useEffect(() => {
    if (!initializing && isAuthenticated) {
      navigate("/app/home", { replace: true });
    }
  }, [initializing, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 px-6 relative overflow-hidden">
      {/* Glow */}
      <div
        className="absolute -top-36 -right-20 w-[22rem] h-[22rem] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(closest-side, #06B6D4, transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-xl relative z-10"
      >
        <h2 className="text-3xl font-bold text-white text-center mb-6">
          Welcome Back
        </h2>

        <div className="flex flex-col gap-4">
          {/* Mobile */}
          <div className="relative">
            <FiPhone className={iconClass} />
            <input
              type="text"
              value={mobile}
              readOnly
              onKeyDown={(e) => e.preventDefault()} // block keyboard input
              onChange={() => {}} // ignore changes
              placeholder="Mobile Number"
              className={inputClass}
              style={{ cursor: "not-allowed" }} // optional
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FiLock className={iconClass} />
            <input
              type="password"
              value={password}
              readOnly
              onKeyDown={(e) => e.preventDefault()}
              onChange={() => {}}
              placeholder="Password"
              className={inputClass}
              style={{ cursor: "not-allowed" }}
            />
          </div>

          {/* Error */}
          {authError && (
            <p className="text-red-300 text-sm flex items-center gap-2">
              <FiAlertCircle /> {authError}
            </p>
          )}

          {/* Login Button */}
          <button
            onClick={handleLoginClick}
            className={`w-full py-3 rounded-xl font-bold shadow-md flex items-center justify-center transition 
              ${
                mobile.length === 10 && password && !submitting
                  ? "bg-white text-blue-600 hover:bg-blue-50"
                  : "bg-white/40 text-white/60 cursor-not-allowed"
              }
            `}
          >
            {submitting ? (
              <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              "Login"
            )}
          </button>

          {/* <p className="text-white/80 text-sm text-center mt-4">
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/register")}
              className="text-white font-semibold underline cursor-pointer"
            >
              Register
            </span>
          </p> */}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
