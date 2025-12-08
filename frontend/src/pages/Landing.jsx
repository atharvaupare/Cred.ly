import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/mobile-app.png";

const facts = [
  "Over 160 million Indians are still considered credit underserved, with limited access to formal loans.",
  "Roughly half of Indian adults remain credit unserved, with no formal credit history yet.",
  "Credit card penetration in India is only about 5–6% of the population, far below many developed countries.",
  "A recent survey found that about 45% of Indians have never checked their credit score or are unsure if they have.",
  "More than 100 million Indians now monitor their CIBIL score and report—awareness is rising, but there’s still a long way to go.",
];

const Landing = () => {
  const navigate = useNavigate();

  const [isWarming, setIsWarming] = useState(true);
  const [hasWarmSuccess, setHasWarmSuccess] = useState(false);
  const [progress, setProgress] = useState(100); // 100 → 0
  const [secondsLeft, setSecondsLeft] = useState(40); // Est time
  const [factIndex, setFactIndex] = useState(0);

  // 🔥 Warm backend on landing page load
  useEffect(() => {
    const controller = new AbortController();

    const warm = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + "/db/health", {
          signal: controller.signal,
        });

        if (res.ok) {
          // ✅ Health check success – stop loader and show CTA
          setHasWarmSuccess(true);
          setIsWarming(false);
        } else {
          console.log("Health check failed with status:", res.status);
          // do NOT stop warming here; let timer handle reload
        }
      } catch (err) {
        console.log("Backend cold start warming failed", err);
        // network error: keep warming and let timer decide reload
      }
    };

    warm();

    return () => controller.abort();
  }, []);

  // ⏳ Progress + pseudo “time left” that slows down near the end
  useEffect(() => {
    if (!isWarming) return;

    const totalMs = 40000; // 40s estimate
    const start = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const t = Math.min(elapsed / totalMs, 1); // 0 → 1

      // Ease-out so it slows down visually near the end
      const eased = 1 - Math.pow(1 - t, 2); // easeOutQuad

      // Progress shrinks from 100 → 0
      const newProgress = 100 - eased * 100;
      setProgress(newProgress);

      // Time left (UX hint, not exact)
      const estRemaining = Math.max(1, Math.round(40 * (1 - eased)));
      setSecondsLeft(estRemaining);

      if (t >= 1) {
        clearInterval(timer);

        // If we still don't have a successful warm, reload and try again
        if (!hasWarmSuccess) {
          window.location.reload();
        }
      }
    }, 300);

    return () => clearInterval(timer);
  }, [isWarming, hasWarmSuccess]);

  // 💬 Rotate credit awareness facts while warming
  useEffect(() => {
    if (!isWarming) return;

    const factTimer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 7000);

    return () => clearInterval(factTimer);
  }, [isWarming]);

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center gap-6 text-center px-6">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB] to-[#1D4ED8]" />

      <div
        className="pointer-events-none absolute -top-40 -right-32 w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30"
        style={{
          background: "radial-gradient(closest-side, #06B6D4, transparent 70%)",
        }}
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

      {/* Loader / Button */}
      <AnimatePresence mode="wait">
        {isWarming ? (
          <motion.div
            key="loader"
            className="flex flex-col items-center gap-3 w-full max-w-xs z-10 mt-16"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress bar container (thicker white outline) */}
            <div className="w-full rounded-2xl border-2 border-white/90 bg-white/10 p-[3px]">
              {/* Animated green bar shrinking – thicker */}
              <motion.div
                className="h-6 rounded-2xl bg-green-500"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </div>

            <p className="text-xs md:text-sm text-white/80">
              Preparing your app...{" "}
              <span className="text-[0.7rem] md:text-xs text-white/70">
                Est. ~{secondsLeft}s
              </span>
            </p>

            <AnimatePresence mode="wait">
              <motion.p
                key={factIndex}
                className="text-[0.7rem] md:text-xs text-white/75 max-w-sm"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
              >
                {facts[factIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="cta"
            className="flex flex-col gap-3 w-full max-w-xs z-10 mt-16"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-xl bg-white text-blue-600 font-semibold shadow-lg hover:bg-blue-50 transition"
            >
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white/20 to-transparent" />
    </div>
  );
};

export default Landing;
