import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mobile-app.png";

const Landing = () => {
    const [clicked, setClicked] = useState(false);
    const navigate = useNavigate();

    const handleClick = () => {
        if (!clicked) {
            setClicked(true);
            setTimeout(() => navigate("/app/home"), 800);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center gap-6 text-center px-6"
            aria-label="Landing screen. Tap anywhere to continue."
        >
            <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB] to-[#1D4ED8]" />
            <div
                className="pointer-events-none absolute -top-40 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
                style={{ background: "radial-gradient(closest-side, #06B6D4, transparent 70%)" }}
            />

            <motion.img
                src={logo}
                alt="Save.ly logo"
                className="w-[70%] max-w-[18rem] md:w-[18rem] z-10 drop-shadow-xl"
                initial={{ y: -10 }}
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            />

            <motion.div
                className="z-10"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
            >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 text-white/90 backdrop-blur-sm px-3 py-1 text-xs md:text-sm border border-white/20">
                    <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: "#FFFFFF" }}
                    />
                    ML Credit Scoring • AI-Driven Insights
                </span>
            </motion.div>

            <motion.h1
                className="text-4xl md:text-5xl font-bold text-white z-10 drop-shadow-sm"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45 }}
            >
                Cred.ly
            </motion.h1>
            <motion.p
                className="text-lg md:text-xl z-10 text-white/90"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.45 }}
            >
                Your Gateway to Smart Credit Solutions
            </motion.p>

            {!clicked && (
                <motion.p
                    className="absolute bottom-16 text-white text-sm md:text-base opacity-80 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    Tap anywhere to continue
                </motion.p>
            )}

            {clicked && (
                <motion.div
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 20, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute w-32 h-32 bg-white rounded-full"
                />
            )}

            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
    );
};

export default Landing;
