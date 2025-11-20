import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPhone,
  FiLock,
  FiRefreshCcw,
  FiChevronLeft,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

import * as api from "../api/index.js";

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Input states
  const [mobile, setMobile] = useState("");
  const [income, setIncome] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const progressWidth = {
    1: "33%",
    2: "66%",
    3: "100%",
  };

  const variants = {
    initial: { opacity: 0, x: 80 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -80 },
  };

  const inputClass =
    "w-full mt-2 px-4 py-3 pl-12 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/40";

  const iconClass = "absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-lg";

  // ---------------------------------------------------------
  // SUCCESS POPUP COMPONENT
  // ---------------------------------------------------------
  const SuccessPopup = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
    >
      <div className="bg-white text-blue-600 rounded-2xl p-6 shadow-xl flex flex-col items-center w-[85%] max-w-xs">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
          <FiCheck className="text-green-600 text-3xl" />
        </div>
        <h3 className="text-xl font-semibold mb-1">Account Created!</h3>
        <p className="text-sm text-gray-600 text-center">
          Your account has been successfully created. Please login to continue.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 w-full bg-blue-600 text-white rounded-xl py-2 font-semibold hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    </motion.div>
  );

  // ---------------------------------------------------------
  // HANDLE SUBMIT
  // ---------------------------------------------------------
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      const data = await api.auth.onboard(mobile, Number(income), password);
      // onboarding returns token etc. (server responds as your backend does)
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------
  // RETURN UI
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 px-6 relative overflow-hidden">
      {/* Glow background */}
      <div
        className="absolute -top-36 -right-20 w-[22rem] h-[22rem] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(closest-side, #06B6D4, transparent)",
        }}
      />

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-xl relative z-10 overflow-hidden">
        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-4">Create Account</h2>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: progressWidth[step] }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* Form Steps */}
        <div className="relative h-64">
          <AnimatePresence mode="wait">
            {/* STEP 1: Mobile */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="absolute w-full"
              >
                <label className="text-white/90 text-sm">Mobile Number</label>
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
                    placeholder="Enter your mobile number"
                    className={inputClass}
                  />
                </div>

                <button
                  onClick={() => mobile.length === 10 && setStep(2)}
                  className={`mt-6 w-full py-3 rounded-xl font-bold shadow-md transition 
                    ${
                      mobile.length === 10
                        ? "bg-white text-blue-600 hover:bg-blue-50"
                        : "bg-white/40 text-white/60 cursor-not-allowed"
                    }
                  `}
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* STEP 2: Income */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="absolute w-full"
              >
                <label className="text-white/90 text-sm">Monthly Income (INR)</label>
                <div className="relative">
                  <FaRupeeSign className={iconClass} />
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="Enter monthly income"
                    className={inputClass}
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 py-2 px-4 text-white/80 border border-white/30 rounded-xl hover:bg-white/20 transition"
                  >
                    <FiChevronLeft /> Back
                  </button>

                  <button
                    onClick={() => income && setStep(3)}
                    className={`py-2 px-6 rounded-xl font-bold shadow-md transition 
                      ${
                        income
                          ? "bg-white text-blue-600 hover:bg-blue-50"
                          : "bg-white/40 text-white/60 cursor-not-allowed"
                      }
                    `}
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Password */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.45, ease: "easeInOut" }}
                className="absolute w-full"
              >
                <label className="text-white/90 text-sm">Create Password</label>
                <div className="relative">
                  <FiLock className={iconClass} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={inputClass}
                  />
                </div>

                <label className="text-white/90 text-sm mt-4 block">Confirm Password</label>
                <div className="relative">
                  <FiRefreshCcw className={iconClass} />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    className={inputClass}
                  />
                </div>

                <div className="flex flex-col gap-3 mt-6">
                  <div className="flex justify-between">
                    <button
                      onClick={() => setStep(2)}
                      className="flex items-center gap-2 py-2 px-4 text-white/80 border border-white/30 rounded-xl hover:bg-white/20 transition"
                    >
                      <FiChevronLeft /> Back
                    </button>

                    <button
                      onClick={() => {
                        if (password && confirm && password === confirm && !submitting) {
                          handleSubmit();
                        }
                      }}
                      className={`py-2 px-6 rounded-xl font-bold shadow-md transition flex items-center justify-center
                        ${
                          password && confirm && password === confirm && !submitting
                            ? "bg-white text-blue-600 hover:bg-blue-50"
                            : "bg-white/40 text-white/60 cursor-not-allowed"
                        }
                      `}
                    >
                      {submitting ? (
                        <span className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>

                  {error && (
                    <p className="text-red-300 text-sm flex items-center gap-2">
                      <FiAlertCircle />
                      {error}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-white/80 text-sm text-center mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-white font-semibold underline cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>

      {/* SUCCESS POPUP */}
      <AnimatePresence>{success && <SuccessPopup />}</AnimatePresence>
    </div>
  );
};

export default Register;
