// src/pages/Profile.jsx
import { FaBell } from "react-icons/fa";
import { MdOutlineKeyboardArrowLeft } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import profile from "../assets/profile.png";

const Profile = () => {
  const navigate = useNavigate();
  const { logout, user } = useContext(AuthContext);

  const mobile = user?.mobile_number || user?.user_profile?.mobile_number || "Unknown";
  const name = user?.user_profile?.name || null;
  const score = user?.user_profile?.score ? Math.round(Number(user.user_profile.score)) : null;

  const menuItems = [
    {
      icon: <HistoryRoundedIcon sx={{ fontSize: 20, color: "#2563eb" }} />,
      label: "Scenario history",
      sub: "View your past what-if simulations",
      onClick: () => navigate("/app/scenarios"),
      color: "#2563eb",
      bg: "#eff6ff",
      border: "#bfdbfe",
    },
  ];

  return (
    <div className="relative w-screen min-h-screen flex flex-col items-center bg-[#f0f4ff] overflow-hidden pb-24 text-black">

      {/* ── Blue header ── */}
      <div
        className="absolute top-0 left-0 w-screen z-0"
        style={{
          height: 220,
          background: "linear-gradient(160deg, #2563eb 0%, #1d4ed8 60%, #1e40af 100%)",
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
        }}
      >
        {/* Glow blob */}
        <div style={{
          position: "absolute", top: -50, right: -40,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(96,165,250,0.3) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
      </div>

      {/* ── Top bar ── */}
      <div className="relative z-10 w-full flex items-center justify-between px-5 pt-5">
        <button
          onClick={() => navigate("/app/home")}
          className="text-white text-2xl bg-white/15 backdrop-blur-sm p-2 rounded-full border border-white/20 hover:bg-white/25 transition"
        >
          <MdOutlineKeyboardArrowLeft />
        </button>
        <Typography sx={{ fontSize: 17, fontWeight: 800, color: "white", letterSpacing: "-0.01em" }}>
          Profile
        </Typography>
        <button className="text-white text-lg bg-white/15 backdrop-blur-sm p-2.5 rounded-full border border-white/20 hover:bg-white/25 transition">
          <FaBell />
        </button>
      </div>

      {/* ── Avatar + name ── */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 flex flex-col items-center"
        style={{ marginTop: 90 }}
      >
        {/* Avatar ring */}
        <Box sx={{
          width: 108, height: 108, borderRadius: "50%",
          background: "linear-gradient(135deg, #2563eb, #60a5fa)",
          p: "3px",
          boxShadow: "0 8px 28px rgba(37,99,235,0.35)",
        }}>
          <Box sx={{ width: "100%", height: "100%", borderRadius: "50%", overflow: "hidden", bgcolor: "white" }}>
            <img src={profile} alt="profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Box>
        </Box>

        {/* Name + mobile */}
        <Box sx={{ mt: 1.75, textAlign: "center" }}>
          {name && (
            <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#1e293b", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              {name}
            </Typography>
          )}
          <Typography sx={{ fontSize: 13, color: "#64748b", mt: name ? 0.3 : 0, fontWeight: 500 }}>
            {mobile}
          </Typography>
        </Box>

        {/* Credit score badge */}
        {score && (
          <Box sx={{
            mt: 1.5,
            px: 2, py: 0.75,
            borderRadius: 999,
            bgcolor: "#eff6ff",
            border: "1px solid #bfdbfe",
            display: "flex", alignItems: "center", gap: 0.75,
          }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#2563eb" }} />
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>
              Credit Score: {score}
            </Typography>
          </Box>
        )}
      </motion.div>

      {/* ── Menu items ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-[90%] mt-8 flex flex-col gap-3"
      >
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: 1, textTransform: "uppercase", mb: 0.5 }}>
          Quick access
        </Typography>

        {menuItems.map((item, i) => (
          <Box
            key={i}
            onClick={item.onClick}
            sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              px: 2, py: 1.75,
              borderRadius: 3.5,
              bgcolor: "white",
              border: "1px solid #e5e7eb",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
              transition: "all 0.18s",
              "&:active": { transform: "scale(0.98)" },
              "&:hover": { bgcolor: "#fafbff", borderColor: "#bfdbfe" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: 2.5,
                bgcolor: item.bg, border: `1px solid ${item.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                {item.icon}
              </Box>
              <Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.2 }}>
                  {item.sub}
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: 18, color: "#94a3b8" }}>→</Typography>
          </Box>
        ))}

        {/* Divider */}
        <Box sx={{ height: 1, bgcolor: "#e5e7eb", my: 1 }} />

        {/* Logout */}
        <Box
          onClick={() => { logout(); navigate("/login", { replace: true }); }}
          sx={{
            display: "flex", alignItems: "center", gap: 1.75,
            px: 2, py: 1.75,
            borderRadius: 3.5,
            bgcolor: "#fff5f5",
            border: "1px solid #fecaca",
            cursor: "pointer",
            boxShadow: "0 2px 10px rgba(15,23,42,0.04)",
            transition: "all 0.18s",
            "&:active": { transform: "scale(0.98)" },
            "&:hover": { bgcolor: "#fee2e2" },
          }}
        >
          <Box sx={{
            width: 40, height: 40, borderRadius: 2.5,
            bgcolor: "#fee2e2", border: "1px solid #fca5a5",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <FiLogOut style={{ color: "#dc2626", fontSize: 18 }} />
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#dc2626" }}>
            Logout
          </Typography>
        </Box>
      </motion.div>
    </div>
  );
};

export default Profile;