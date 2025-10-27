import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BsCheck } from "react-icons/bs";

const TrxnFinish = () => {
  const navigate = useNavigate();
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShowGlow(true), 500);
    setTimeout(() => navigate("/app/home"), 2200); // Redirect after animation
  }, [navigate]);

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center bg-[#E5E5E5] text-white overflow-hidden">
      {/* Success Circle */}
      <motion.div
        className="relative w-[120px] h-[120px] flex items-center justify-center bg-[#2A7C76] rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Tick Mark Animation */}
        <motion.div
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
        >
          <BsCheck className="text-white text-6xl" />
        </motion.div>

        {/* Glow Effect */}
        {showGlow && (
          <motion.div
            className="absolute w-full h-full bg-[#2A7C76] rounded-full opacity-30"
            initial={{ scale: 1 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
      </motion.div>
    </div>
  );
};

export default TrxnFinish;
