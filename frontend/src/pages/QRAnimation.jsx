import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import qrImage from "../assets/qr-code.png"; // High-quality QR code image

const ScanQR = () => {
  const navigate = useNavigate();
  const [scanState, setScanState] = useState("entering"); // entering → adjusting → focusing → scanned
  const [entrySide] = useState(Math.random() > 0.5 ? "left" : "right"); // Random entry side

  useEffect(() => {
    const sequence = [
      { state: "adjusting", delay: 1000 }, // Moves into frame, slight correction
      { state: "focusing", delay: 800 }, // Focuses properly
      { state: "scanned", delay: 500 }, // Scan complete
    ];

    let timeouts = sequence.map(({ state, delay }, index) =>
      setTimeout(
        () => setScanState(state),
        sequence.slice(0, index).reduce((acc, cur) => acc + cur.delay, 0)
      )
    );

    setTimeout(() => navigate("/app/new_transaction"), 2300); // Navigate after scanning

    return () => timeouts.forEach(clearTimeout);
  }, [navigate]);

  return (
    <div className="relative w-screen h-screen flex flex-col items-center bg-[#E5E5E5] text-white overflow-hidden">
      {/* Header */}
      <div className="absolute bg-gradient-to-b from-[#429690] to-[#2A7C76] w-screen h-[200px] rounded-b-[20%] flex items-start justify-between p-5 pt-5">
        <MdOutlineKeyboardArrowLeft className="text-3xl" />
        <p className="text-xl font-semibold">Scan QR Code</p>
        <BsThreeDots className="text-3xl" />
      </div>

      {/* Scanner UI (Google Pay Style) */}
      <div className="absolute top-[10rem] w-[300px] h-[300px] flex items-center justify-center">
        {/* Outer White Box */}
        <div className="relative w-full h-full border-[6px] border-white rounded-lg flex items-center justify-center">
          {/* QR Code with Realistic Motion */}
          <motion.div
            className="w-[200px] h-[200px] flex items-center justify-center overflow-hidden"
            initial={{
              scale: 1.6,
              opacity: 0.6,
              x: entrySide === "left" ? "-120%" : "120%", // Starts completely out of frame
              y: -50,
              rotate: 8,
            }}
            animate={{
              scale: scanState === "entering" ? 1.4 : scanState === "adjusting" ? 1.1 : 1,
              opacity: scanState === "focusing" ? 1 : 0.8,
              x: scanState === "entering"
                ? entrySide === "left"
                  ? ["-120%", "-40%", "-10%", "0%"]
                  : ["120%", "40%", "10%", "0%"]
                : scanState === "adjusting"
                ? [-8, 6, -3, 2, 0] // Small realistic hand adjustments
                : 0,
              y: scanState === "adjusting" ? [-12, 6, -4, 2, 0] : 0,
              rotate: scanState === "adjusting" ? [3, -2, 1, 0] : 0,
              filter: `blur(${scanState === "focusing" ? "0px" : "2px"})`,
            }}
            transition={{
              duration: scanState === "entering" ? 1.2 : scanState === "adjusting" ? 0.8 : 0.5,
              ease: "easeOut",
              times: scanState === "entering" ? [0, 0.3, 0.6, 1] : undefined,
            }}
          >
            <img src={qrImage} alt="QR Code" className="w-full h-full object-cover" />
          </motion.div>

          {/* Scan Line Animation */}
          {scanState === "focusing" && (
            <motion.div
              className="absolute w-[200px] h-[5px] bg-[#2A7C76] rounded"
              initial={{ y: -90, opacity: 0 }}
              animate={{ y: [90, -90], opacity: 1 }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          )}
        </div>
      </div>

      {/* Subtle Camera Overlay Effect */}
      <motion.div
        className="absolute w-full h-full bg-black opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: scanState === "focusing" ? 0.15 : 0 }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
};

export default ScanQR;

