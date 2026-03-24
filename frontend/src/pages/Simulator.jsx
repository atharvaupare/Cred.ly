// src/pages/Simulator.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  Slider,
  Switch,
  FormControlLabel,
  Typography,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";

import { motion, AnimatePresence } from "framer-motion";
import * as api from "../api/index.js";

const formatINR = (v) => "₹ " + Math.round(v ?? 0).toLocaleString("en-IN");

const sliderSx = {
  color: "#2563eb",
  "& .MuiSlider-track": { border: "none", height: 5 },
  "& .MuiSlider-rail": { opacity: 0.15, height: 5, bgcolor: "#94a3b8" },
  "& .MuiSlider-thumb": {
    width: 18, height: 18,
    bgcolor: "white",
    border: "2px solid #2563eb",
    boxShadow: "0 0 0 0 rgba(37,99,235,0)",
    "&:hover, &.Mui-focusVisible, &.Mui-active": {
      boxShadow: "0 0 0 8px rgba(37,99,235,0.12)",
    },
  },
};

/* ── Util ring ── */
function UtilCircle({ label, value }) {
  const color = value <= 30 ? "#16a34a" : value <= 50 ? "#d97706" : "#dc2626";
  const trackColor = value <= 30 ? "#dcfce7" : value <= 50 ? "#fef3c7" : "#fee2e2";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75 }}>
      <Box sx={{ position: "relative", display: "inline-flex" }}>
        {/* Background track */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={72}
          thickness={5}
          sx={{ color: trackColor, position: "absolute", top: 0, left: 0 }}
        />
        <CircularProgress
          variant="determinate"
          value={Math.min(Math.max(value, 0), 100)}
          size={72}
          thickness={5}
          sx={{ color }}
        />
        <Box sx={{
          top: 0, left: 0, bottom: 0, right: 0,
          position: "absolute",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <Typography sx={{ fontWeight: 800, fontSize: 14, color, lineHeight: 1 }}>
            {Math.round(value)}%
          </Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 10, fontWeight: 600, color: "#64748b", letterSpacing: 0.5, textTransform: "uppercase" }}>
        {label}
      </Typography>
    </Box>
  );
}

/* ── Section card ── */
function SectionCard({ icon, title, children }) {
  return (
    <Box sx={{
      borderRadius: 3.5,
      border: "1px solid #e5e7eb",
      bgcolor: "white",
      overflow: "hidden",
      boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
    }}>
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1,
        px: 2, py: 1.5,
        borderBottom: "1px solid #f1f5f9",
        bgcolor: "#fafbff",
      }}>
        <Box sx={{ color: "#2563eb", display: "flex", fontSize: 18 }}>{icon}</Box>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{title}</Typography>
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
  );
}

/* ── Snapshot row ── */
function SnapRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.9, borderBottom: "1px solid #f1f5f9", "&:last-child": { borderBottom: "none" } }}>
      <Typography sx={{ fontSize: 12, color: "#64748b" }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{value}</Typography>
    </Box>
  );
}

export default function Simulator() {
  const { user } = useContext(AuthContext);
  const profile = user?.user_profile;
  const mobileNumber = user?.mobile_number || profile?.mobile_number;

  const currentLimit = profile?.credit_limit ?? 0;
  const currentBalance = profile?.credit_balance ?? 0;
  const income = profile?.income_monthly ?? 0;
  const currentScore = profile?.score ?? null;

  const [form, setForm] = useState({
    current_limit: currentLimit,
    current_balance: currentBalance,
    new_limit: currentLimit,
    new_balance: currentBalance,
    missed_payment: false,
    add_enquiry: false,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      current_limit: currentLimit,
      current_balance: currentBalance,
      new_limit: currentLimit,
      new_balance: currentBalance,
      missed_payment: false,
      add_enquiry: false,
    });
  }, [profile, currentLimit, currentBalance]);

  const oldUtil = useMemo(
    () => (currentLimit > 0 ? Math.round((currentBalance / currentLimit) * 100) : 0),
    [currentLimit, currentBalance]
  );

  const newUtil = useMemo(
    () => (form.new_limit > 0 ? Math.round((form.new_balance / form.new_limit) * 100) : 0),
    [form.new_balance, form.new_limit]
  );

  const handleSliderChange = (name) => (_, value) => {
    setForm((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "new_limit" && prev.new_balance > value) updated.new_balance = value;
      return updated;
    });
  };

  const handleNumericChange = (name, min, max) => (e) => {
    let value = Number(String(e.target.value).replace(/,/g, ""));
    if (Number.isNaN(value)) value = min;
    value = Math.max(min, Math.min(max, value));
    setForm((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "new_limit" && prev.new_balance > value) updated.new_balance = value;
      return updated;
    });
  };

  const handleToggle = (e) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const runSimulation = async () => {
    setLoading(true);
    setResult(null);
    setShowResultModal(false);
    try {
      const data = await api.scenario.run({ mobile_number: mobileNumber, ...form });
      setResult(data);
      setShowResultModal(true);
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">Please log in to access the What-If Simulator.</p>
      </div>
    );
  }

  const scoreDelta = result ? Math.round(result.new_score) - Math.round(result.old_score) : 0;
  const scoreUp = scoreDelta >= 0;

  return (
    <>
      {/* ── Full-screen loader ── */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ background: "rgba(15,23,42,0.4)", backdropFilter: "blur(6px)" }}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl px-8 py-6 shadow-2xl flex flex-col items-center gap-3"
            >
              <CircularProgress sx={{ color: "#2563eb" }} />
              <p className="text-sm font-medium text-gray-700">Running simulation…</p>
              <p className="text-xs text-gray-400">Crunching your credit scenario</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Result modal ── */}
      <Dialog
        open={!!result && showResultModal}
        onClose={() => setShowResultModal(false)}
        fullWidth maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        {/* Modal header strip */}
        <Box sx={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", px: 3, py: 2.5 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 800, color: "white" }}>Simulation Result</Typography>
          <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.7)", mt: 0.3 }}>Here's how your credit score would change</Typography>
        </Box>

        <DialogContent sx={{ p: 2.5, bgcolor: "#f8fafc" }}>
          {result && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

              {/* Score impact card */}
              <Box sx={{
                borderRadius: 3,
                bgcolor: "white",
                border: "1px solid #e5e7eb",
                p: 2.5,
                boxShadow: "0 4px 16px rgba(15,23,42,0.07)",
              }}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, mb: 1.5 }}>
                  Score Impact
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, mb: 0.5 }}>BEFORE</Typography>
                    <Typography sx={{ fontSize: 32, fontWeight: 900, color: "#1e293b", lineHeight: 1, letterSpacing: "-0.03em" }}>
                      {Math.round(result.old_score)}
                    </Typography>
                  </Box>

                  <Box sx={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5,
                    px: 2, py: 1, borderRadius: 999,
                    bgcolor: scoreUp ? "#dcfce7" : "#fee2e2",
                  }}>
                    {scoreUp
                      ? <TrendingUpIcon sx={{ color: "#16a34a", fontSize: 22 }} />
                      : <TrendingDownIcon sx={{ color: "#dc2626", fontSize: 22 }} />
                    }
                    <Typography sx={{ fontSize: 12, fontWeight: 800, color: scoreUp ? "#16a34a" : "#dc2626" }}>
                      {scoreUp ? "+" : ""}{scoreDelta}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600, mb: 0.5 }}>AFTER</Typography>
                    <Typography sx={{ fontSize: 32, fontWeight: 900, color: scoreUp ? "#16a34a" : "#dc2626", lineHeight: 1, letterSpacing: "-0.03em" }}>
                      {Math.round(result.new_score)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "center" }}>
                  <Typography sx={{ fontSize: 12, color: "#64748b" }}>
                    Utilisation: <strong>{Math.round(result.old_util * 100)}%</strong> → <strong style={{ color: Math.round(result.new_util * 100) <= 30 ? "#16a34a" : Math.round(result.new_util * 100) <= 50 ? "#d97706" : "#dc2626" }}>{Math.round(result.new_util * 100)}%</strong>
                  </Typography>
                </Box>
              </Box>

              {/* Accordions */}
              {[
                { title: "Why did my score change?", key: "why_change" },
                { title: "Do's and Don'ts", key: "do_dont" },
                { title: "Affordability", key: "affordability" },
              ].map(({ title, key }) => (
                <Accordion key={key} disableGutters elevation={0} sx={{ border: "1px solid #e5e7eb", borderRadius: "12px !important", "&:before": { display: "none" }, overflow: "hidden" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18 }} />} sx={{ bgcolor: "white", minHeight: 44, "& .MuiAccordionSummary-content": { my: 1 } }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ bgcolor: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
                    <Typography sx={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>
                      {result.advice?.[key] || "Not available for this scenario."}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e5e7eb" }}>
          <Button
            onClick={() => setShowResultModal(false)}
            variant="contained"
            sx={{ borderRadius: 2.5, textTransform: "none", fontWeight: 700, bgcolor: "#2563eb", "&:hover": { bgcolor: "#1d4ed8" }, px: 3 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Main page ── */}
      <div
        className="min-h-screen flex justify-center px-4 pt-6 pb-24"
        style={{ background: "linear-gradient(160deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)", overflowY: "auto" }}
      >
        {/* Ambient blobs */}
        <div style={{ position: "fixed", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(96,165,250,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "fixed", bottom: 40, left: -60, width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(59,130,246,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md flex flex-col gap-4"
        >
          {/* ── Page header ── */}
          <Box sx={{ px: 0.5, mb: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{
                width: 40, height: 40, borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <BoltRoundedIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                  What-If Simulator
                </Typography>
                <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                  Preview score changes before they happen
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* ── Current score banner ── */}
          <Box sx={{
            borderRadius: 3.5, bgcolor: "white",
            p: 2, display: "flex", alignItems: "center", justifyContent: "space-between",
            boxShadow: "0 12px 40px rgba(15,23,42,0.18)",
          }}>
            <Box>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, mb: 0.4 }}>
                Current Score
              </Typography>
              <Typography sx={{ fontSize: 34, fontWeight: 900, color: "#1d4ed8", letterSpacing: "-0.04em", lineHeight: 1 }}>
                {Math.round(currentScore ?? 0)}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#64748b", mt: 0.4 }}>
                Utilisation: <strong>{oldUtil}%</strong>
              </Typography>
            </Box>

            <Button
              size="small"
              variant="outlined"
              startIcon={showResultModal ? <VisibilityOffIcon sx={{ fontSize: "15px !important" }} /> : <VisibilityIcon sx={{ fontSize: "15px !important" }} />}
              disabled={!result}
              onClick={() => setShowResultModal((v) => !v)}
              sx={{
                textTransform: "none", fontSize: 11, py: 0.6, px: 1.5,
                borderRadius: 2, borderColor: "#bfdbfe", color: "#2563eb",
                "&:hover": { bgcolor: "#eff6ff", borderColor: "#93c5fd" },
                "&.Mui-disabled": { opacity: 0.35 },
              }}
            >
              {showResultModal ? "Hide result" : "Last result"}
            </Button>
          </Box>

          {/* ── Snapshot ── */}
          <SectionCard icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />} title="Current Snapshot">
            <SnapRow label="Credit Limit" value={formatINR(currentLimit)} />
            <SnapRow label="Credit Balance" value={formatINR(currentBalance)} />
            <SnapRow label="Monthly Income" value={formatINR(income)} />
          </SectionCard>

          {/* ── New Credit Limit ── */}
          <SectionCard icon={<CreditCardRoundedIcon sx={{ fontSize: 18 }} />} title="New Credit Limit">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography sx={{ fontSize: 12, color: "#64748b" }}>Adjust your credit limit</Typography>
              <TextField
                size="small"
                value={form.new_limit.toLocaleString("en-IN")}
                onChange={handleNumericChange("new_limit", currentLimit || 10000, currentLimit ? currentLimit * 2 : 400000)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 12, color: "#94a3b8" }}>₹</Typography></InputAdornment>,
                  sx: { borderRadius: 2, "& input": { textAlign: "right", fontSize: 13, fontWeight: 700 }, "& fieldset": { borderColor: "#e5e7eb" } },
                }}
                sx={{ width: 130 }}
              />
            </Box>
            <Slider
              size="small"
              value={form.new_limit}
              min={currentLimit || 10000}
              max={currentLimit ? currentLimit * 2 : 400000}
              step={5000}
              onChange={handleSliderChange("new_limit")}
              sx={sliderSx}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{formatINR(currentLimit || 10000)}</Typography>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{formatINR(currentLimit ? currentLimit * 2 : 400000)}</Typography>
            </Box>
          </SectionCard>

          {/* ── New Credit Balance ── */}
          <SectionCard icon={<AccountBalanceWalletRoundedIcon sx={{ fontSize: 18 }} />} title="New Credit Balance">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
              <Typography sx={{ fontSize: 12, color: "#64748b" }}>Adjust outstanding balance</Typography>
              <TextField
                size="small"
                value={form.new_balance.toLocaleString("en-IN")}
                onChange={handleNumericChange("new_balance", 0, form.new_limit || 1)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 12, color: "#94a3b8" }}>₹</Typography></InputAdornment>,
                  sx: { borderRadius: 2, "& input": { textAlign: "right", fontSize: 13, fontWeight: 700 }, "& fieldset": { borderColor: "#e5e7eb" } },
                }}
                sx={{ width: 130 }}
              />
            </Box>
            <Slider
              size="small"
              value={form.new_balance}
              min={0}
              max={form.new_limit || 1}
              step={2000}
              onChange={handleSliderChange("new_balance")}
              sx={sliderSx}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>₹ 0</Typography>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{formatINR(form.new_limit)}</Typography>
            </Box>
          </SectionCard>

          {/* ── Utilisation circles ── */}
          <Box sx={{
            borderRadius: 3.5, bgcolor: "white",
            border: "1px solid #e5e7eb",
            p: 2.5,
            boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
          }}>
            <Typography sx={{ fontSize: 12, color: "#64748b", mb: 2, textAlign: "center" }}>
              Utilisation preview:{" "}
              <strong style={{ color: "#1e293b" }}>{oldUtil}%</strong>
              {" → "}
              <strong style={{ color: newUtil <= 30 ? "#16a34a" : newUtil <= 50 ? "#d97706" : "#dc2626" }}>
                {newUtil}%
              </strong>
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 5 }}>
              <UtilCircle label="Current" value={oldUtil} />
              <UtilCircle label="Simulated" value={newUtil} />
            </Box>
          </Box>

          {/* ── Toggles ── */}
          <Box sx={{
            borderRadius: 3.5, bgcolor: "white",
            border: "1px solid #e5e7eb",
            px: 2.5, py: 1.5,
            display: "flex", justifyContent: "space-between",
            boxShadow: "0 2px 12px rgba(15,23,42,0.05)",
          }}>
            {[
              { name: "missed_payment", label: "Missed payment" },
              { name: "add_enquiry", label: "Add enquiry" },
            ].map(({ name, label }) => (
              <FormControlLabel
                key={name}
                control={
                  <Switch
                    size="small"
                    name={name}
                    checked={form[name]}
                    onChange={handleToggle}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#2563eb" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "#93c5fd" },
                    }}
                  />
                }
                label={<Typography sx={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{label}</Typography>}
              />
            ))}
          </Box>

          {/* ── Run button ── */}
          <motion.button
            onClick={runSimulation}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            style={{
              width: "100%",
              background: "white",
              color: "#1d4ed8",
              fontSize: 15,
              fontWeight: 800,
              padding: "16px",
              borderRadius: 16,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(15,23,42,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              letterSpacing: "-0.01em",
            }}
          >
            <BoltRoundedIcon sx={{ fontSize: 20, color: "#2563eb" }} />
            Run Simulation
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}