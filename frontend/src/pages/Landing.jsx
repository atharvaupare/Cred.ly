import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../assets/mobile-app.png";

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center gap-6 text-center px-6">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB] to-[#1D4ED8]" />

            <div
                className="pointer-events-none absolute -top-40 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
                style={{ background: "radial-gradient(closest-side, #06B6D4, transparent 70%)" }}
            />

            {/* Floating Logo */}
            <motion.img
                src={logo}
                alt="Cred.ly"
                className="w-[70%] max-w-[18rem] md:w-[18rem] z-10 drop-shadow-xl"
                initial={{ y: -10 }}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2.3, ease: "easeInOut" }}
            />

            {/* Tagline */}
            <motion.div
                className="z-10"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 text-white/90 backdrop-blur-sm px-3 py-1 text-xs md:text-sm border border-white/20">
                    <span className="inline-block w-2 h-2 rounded-full bg-white" />
                    ML Credit Scoring • AI Insights
                </span>
            </motion.div>

            {/* Title */}
            <motion.h1
                className="text-4xl md:text-5xl font-bold text-white z-10 drop-shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
            >
                Cred.ly
            </motion.h1>

            {/* Subtitle */}
            <motion.p
                className="text-lg md:text-xl z-10 text-white/90"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.33 }}
            >
                Your Gateway to Smart Credit Solutions
            </motion.p>

            {/* Buttons */}
            <div className="flex flex-col gap-3 w-full max-w-xs z-10 mt-16">
                <button
                    onClick={() => navigate("/register")}
                    className="w-full py-3 rounded-xl bg-white text-blue-600 font-semibold shadow-lg hover:bg-blue-50 transition"
                >
                    Create Account
                </button>

                <button
                    onClick={() => navigate("/login")}
                    className="w-full py-3 rounded-xl bg-white/20 text-white border border-white/40 backdrop-blur-sm font-semibold hover:bg-white/30 transition"
                >
                    Already a user? Log in
                </button>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
    );
};

export default Landing;
