import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiPhone, FiLock, FiRefreshCcw, FiChevronLeft } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const Register = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Step values
  const [mobile, setMobile] = useState("");
  const [income, setIncome] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

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

  const handleSubmit = () => {
    const data = {
      mobile_number: mobile,
      income_monthly: income,
      password: password,
    };

    console.log("REGISTER DATA:", data);
  };

  const inputClass =
    "w-full mt-2 px-4 py-3 pl-12 rounded-xl bg-white/20 border border-white/30 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/40";

  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-white/70 text-lg";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-600 to-blue-800 px-6 relative overflow-hidden">
      {/* Glowing background */}
      <div
        className="absolute -top-36 -right-20 w-[22rem] h-[22rem] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(closest-side, #06B6D4, transparent)",
        }}
      />

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl w-full max-w-md shadow-xl relative z-10 overflow-hidden">
        {/* Title */}
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Create Account
        </h2>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: progressWidth[step] }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>

        {/* Steps */}
        <div className="relative h-64">
          <AnimatePresence mode="wait">
            {/* STEP 1 – Mobile Number */}
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

            {/* STEP 2 – Monthly Income */}
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
                <label className="text-white/90 text-sm">
                  Monthly Income (INR)
                </label>

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

            {/* STEP 3 – Password */}
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
                {/* Password */}
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

                {/* Confirm Password */}
                <label className="text-white/90 text-sm mt-4 block">
                  Confirm Password
                </label>

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

                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 py-2 px-4 text-white/80 border border-white/30 rounded-xl hover:bg-white/20 transition"
                  >
                    <FiChevronLeft /> Back
                  </button>

                  <button
                    onClick={() => {
                      if (password && confirm && password === confirm) {
                        handleSubmit();
                      }
                    }}
                    className={`py-2 px-6 rounded-xl font-bold shadow-md transition 
                        ${
                          password && confirm && password === confirm
                            ? "bg-white text-blue-600 hover:bg-blue-50"
                            : "bg-white/40 text-white/60 cursor-not-allowed"
                        }
                    `}
                  >
                    Create Account
                  </button>
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
    </div>
  );
};

export default Register;
