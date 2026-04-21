import { useContext, useMemo } from "react";
import { FaBell } from "react-icons/fa";
import HeroScoreCard from "../components/home/HeroScoreCard";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import { motion } from "framer-motion";

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const profile = user?.user_profile;

  const {
    score,
    credit_limit: limit,
    credit_balance: balance,
  } = profile || { score: 0, credit_limit: 0, credit_balance: 0 };

  const utilization = useMemo(() => {
    const l = Number(limit) || 0;
    const b = Number(balance) || 0;
    if (l <= 0) return 0;
    return Math.round((b / l) * 100);
  }, [limit, balance]);

  const optimizerTip = useMemo(() => {
    if (utilization <= 30)
      return "Great - keep utilisation below 30% to improve your score.";
    if (utilization <= 50)
      return "You're OK - try reducing balances to get under 30% utilisation.";
    return "High utilisation - paying down balances or increasing limit carefully will help your score.";
  }, [utilization]);

  return (
    <div className="relative w-screen flex flex-col items-center bg-[#f0f4ff] text-white overflow-hidden overflow-y-auto pb-24 min-h-screen">
      <div
        className="absolute top-0 left-0 w-screen z-0"
        style={{
          height: 270,
          background:
            "linear-gradient(160deg, #2563eb 0%, #1d4ed8 60%, #1e40af 100%)",
          borderBottomLeftRadius: "36px",
          borderBottomRightRadius: "36px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -40,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(96,165,250,0.35) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
      </div>

      <div className="relative z-10 w-full flex items-start justify-between px-5 pt-5">
        <div className="flex flex-col">
          <p className="text-xs font-light text-white/70 tracking-wide">
            Welcome back
          </p>
          <p className="text-xl font-bold text-white tracking-tight">
            {profile?.name || "Cred.ly"}
          </p>
        </div>
        <button className="text-white text-lg bg-white/15 backdrop-blur-sm p-2.5 rounded-full border border-white/20 hover:bg-white/25 transition">
          <FaBell />
        </button>
      </div>

      <HeroScoreCard
        score={score ? Math.round(Number(score)) : 0}
        utilization={utilization}
        balance={balance || 0}
        limit={limit || 0}
        optimizerTip={optimizerTip}
      />

      <motion.button
        onClick={() => navigate("/app/cards")}
        whileTap={{ scale: 0.98 }}
        className="relative z-10 w-[90%] mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white text-left shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
      >
        <div className="absolute inset-y-0 right-0 w-28 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),transparent_72%)]" />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2.5,
            py: 2.25,
            position: "relative",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 3,
                background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 22px rgba(30,58,138,0.24)",
                flexShrink: 0,
              }}
            >
              <CreditCardRoundedIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box sx={{ textAlign: "left" }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.2,
                  letterSpacing: "-0.01em",
                }}
              >
                Card overview
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.35 }}>
                See balance, limit, and available credit in one place
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              minWidth: 54,
              height: 34,
              borderRadius: 99,
              bgcolor: "#eff6ff",
              border: "1px solid #bfdbfe",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              px: 1.25,
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 800,
                color: "#2563eb",
                lineHeight: 1,
              }}
            >
              OPEN
            </Typography>
          </Box>
        </Box>
      </motion.button>

      <div className="w-[90%] mt-6 mb-3">
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: "#94a3b8",
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Tools for you
        </Typography>
      </div>

      <div className="w-[90%] flex flex-col gap-3">
        <motion.button
          onClick={() => navigate("/app/simulator")}
          whileTap={{ scale: 0.98 }}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            border: "none",
            borderRadius: 20,
            padding: 0,
            cursor: "pointer",
            boxShadow: "0 8px 28px rgba(37,99,235,0.35)",
            overflow: "hidden",
            display: "block",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2.5,
              py: 2.25,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  bgcolor: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <BoltRoundedIcon sx={{ color: "white", fontSize: 22 }} />
              </Box>
              <Box sx={{ textAlign: "left" }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "white",
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                  }}
                >
                  See what moves the needle
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.75)",
                    mt: 0.3,
                  }}
                >
                  Try our What-If Simulator
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography sx={{ fontSize: 18, color: "white", lineHeight: 1 }}>
                →
              </Typography>
            </Box>
          </Box>
        </motion.button>

        <motion.button
          onClick={() => navigate("/app/target-score")}
          whileTap={{ scale: 0.98 }}
          style={{
            width: "100%",
            background: "white",
            border: "1.5px solid #bfdbfe",
            borderRadius: 20,
            padding: 0,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(37,99,235,0.1)",
            overflow: "hidden",
            display: "block",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2.5,
              py: 2.25,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  bgcolor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <TrackChangesRoundedIcon
                  sx={{ color: "#2563eb", fontSize: 22 }}
                />
              </Box>
              <Box sx={{ textAlign: "left" }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#1e293b",
                    lineHeight: 1.2,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Have a score goal in mind?
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.3 }}>
                  Use the Target Score Advisor
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                bgcolor: "#eff6ff",
                border: "1px solid #bfdbfe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Typography
                sx={{ fontSize: 18, color: "#2563eb", lineHeight: 1 }}
              >
                →
              </Typography>
            </Box>
          </Box>
        </motion.button>
      </div>
    </div>
  );
};

export default Home;
