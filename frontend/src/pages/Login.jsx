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

  const [mobile] = useState("9991112222");
  const [password] = useState("password");
  const [submitting, setSubmitting] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const inputClass =
    "w-full mt-2 px-4 py-3 pl-12 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/40";

  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-lg";

  // 🔒 Disable scroll when modal is open
  useEffect(() => {
    if (showCongrats) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showCongrats]);

  const handleLoginClick = async () => {
    if (submitting) return;
    setSubmitting(true);

    const ok = await login(mobile, password);
    setSubmitting(false);

    if (ok) {
      setShowCongrats(true);

      setTimeout(() => {
        navigate("/app/home", { replace: true });
      }, 5000);
    }
  };

  // 🚫 ONLY auto-redirect if modal is NOT visible
  useEffect(() => {
    if (!initializing && isAuthenticated && !showCongrats) {
      navigate("/app/home", { replace: true });
    }
  }, [initializing, isAuthenticated, showCongrats, navigate]);

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
              onKeyDown={(e) => e.preventDefault()}
              placeholder="Mobile Number"
              className={inputClass}
              style={{ cursor: "not-allowed" }}
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
                !submitting
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
        </div>
      </motion.div>

      {/* 🎉 Congratulations Modal */}

      {showCongrats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-[90%] text-center"
          >
            {/* Icon */}
            <div className="text-green-600 text-5xl mb-4">🎉</div>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Login Successful!
            </h2>

            {/* Subtitle */}
            <p className="text-gray-700 text-sm">
              Congratulations! You're now logged in as a user with a strong,
              simulated credit profile.
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-6 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-green-500"
              />
            </div>

            {/* Auto-close text */}
            <p className="text-gray-500 text-xs mt-3">
              Redirecting in 5 seconds...
            </p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Login;
