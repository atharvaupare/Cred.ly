// src/pages/Simulator.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Switch,
  FormControlLabel,
  Card,
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
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

import { motion, AnimatePresence } from "framer-motion";

const formatINR = (value) =>
  "₹ " + Math.round(value ?? 0).toLocaleString("en-IN");

// common slider styling (same look as affordability calculator)
const sliderSx = {
  "& .MuiSlider-track": {
    border: "none",
    height: 6,
  },
  "& .MuiSlider-rail": {
    opacity: 0.25,
    height: 6,
  },
  "& .MuiSlider-thumb": {
    width: 16,
    height: 16,
    "&:hover, &.Mui-focusVisible, &.Mui-active": {
      boxShadow: "0 0 0 6px rgba(37,99,235,0.18)",
    },
  },
};

// circular utilisation viz
function UtilCircle({ label, value }) {
  const color = value <= 30 ? "success" : value <= 50 ? "warning" : "error";

  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress
        variant="determinate"
        value={Math.min(Math.max(value, 0), 100)}
        size={64}
        color={color}
        thickness={4.5}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{ fontWeight: 600, fontSize: 12 }}
        >
          {`${Math.round(value)}%`}
        </Typography>
        <Typography
          variant="caption"
          sx={{ fontSize: 9, color: "text.secondary" }}
        >
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

export default function Simulator() {
  const { user, token } = useContext(AuthContext);

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

  // sync with profile
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
    () =>
      currentLimit > 0 ? Math.round((currentBalance / currentLimit) * 100) : 0,
    [currentLimit, currentBalance]
  );

  const newUtil = useMemo(
    () =>
      form.new_limit > 0
        ? Math.round((form.new_balance / form.new_limit) * 100)
        : 0,
    [form.new_balance, form.new_limit]
  );

  // slider change
  const handleSliderChange = (name) => (_, value) => {
    setForm((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "new_limit" && prev.new_balance > value) {
        updated.new_balance = value;
      }
      return updated;
    });
  };

  // numeric text input change (clamped)
  const handleNumericChange = (name, min, max) => (e) => {
    let value = Number(String(e.target.value).replace(/,/g, ""));
    if (Number.isNaN(value)) value = min;
    value = Math.max(min, Math.min(max, value));

    setForm((prev) => {
      let updated = { ...prev, [name]: value };
      if (name === "new_limit" && prev.new_balance > value) {
        updated.new_balance = value;
      }
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
      const res = await fetch("http://localhost:8000/api/scenario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          mobile_number: mobileNumber,
          ...form,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(
          payload.detail || payload.message || "Simulation failed."
        );
      }

      const data = await res.json();
      setResult(data);
      setShowResultModal(true); // auto-open modal when new result is ready
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-blue-100 flex items-center justify-center">
        <p className="text-sm text-gray-700">
          Please log in to access the What-If Simulator.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* FULL-SCREEN LOADER OVERLAY */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: "rgba(15,23,42,0.35)",
              backdropFilter: "blur(4px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl px-6 py-5 shadow-2xl flex flex-col items-center gap-3"
            >
              <CircularProgress />
              <p className="text-xs text-gray-600">
                Running what-if simulation…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RESULT MODAL */}
      <Dialog
        open={!!result && showResultModal}
        onClose={() => setShowResultModal(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: "18px" } }}
      >
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600 }}>
          Simulation Result
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 1.5 }}>
          {result && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* SCORE IMPACT */}
              <Card
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: "18px",
                  backgroundColor: "#eff6ff",
                }}
              >
                <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                  Score Impact
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ display: "flex", gap: 1, alignItems: "center" }}
                >
                  {result.new_score >= result.old_score ? (
                    <TrendingUpIcon className="text-green-600" />
                  ) : (
                    <TrendingDownIcon className="text-red-600" />
                  )}
                  Old: <strong>{Math.round(result.old_score)}</strong> → New:{" "}
                  <strong
                    className={
                      result.new_score >= result.old_score
                        ? "text-green-700"
                        : "text-red-700"
                    }
                  >
                    {Math.round(result.new_score)}
                  </strong>
                </Typography>
                <Typography variant="caption" sx={{ color: "gray" }}>
                  Utilisation: {Math.round(result.old_util * 100)}% →{" "}
                  {Math.round(result.new_util * 100)}%
                </Typography>
              </Card>

              {/* ACCORDIONS */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Why did my score change?
                </AccordionSummary>
                <AccordionDetails>
                  {result.advice?.why_change ||
                    "Explanation not available for this scenario."}
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Do’s and Don’ts
                </AccordionSummary>
                <AccordionDetails>
                  {result.advice?.do_dont ||
                    "No specific do/don't advice returned."}
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  Affordability
                </AccordionSummary>
                <AccordionDetails>
                  {result.advice?.affordability ||
                    "Affordability description not available."}
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ pr: 2, py: 1.5 }}>
          <Button onClick={() => setShowResultModal(false)} size="small">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* MAIN PAGE */}
      <div
        className="min-h-screen flex justify-center px-4 pt-8 pb-20"
        style={{
          background: "linear-gradient(to bottom, #3b82f6, #1e40af)",
          overflowY: "auto",
        }}
      >
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6 space-y-6"
        >
          {/* HEADER */}
          <div className="flex flex-col gap-4 justify-between items-start">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                What-If Simulator
              </h1>
              <p className="text-xs text-gray-500">
                Adjust your credit behaviour & preview score changes.
              </p>
            </div>

            <div className="flex flex-row items-end justify-between w-full">
              {/* Show / Hide Result button */}
              <Button
                size="small"
                variant="outlined"
                startIcon={
                  showResultModal ? <VisibilityOffIcon /> : <VisibilityIcon />
                }
                disabled={!result}
                onClick={() => setShowResultModal((v) => !v)}
                sx={{ textTransform: "none", fontSize: 11, py: 0.3 }}
              >
                {showResultModal ? "Hide result" : "View last result"}
              </Button>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-blue-50 px-4 py-2 rounded-2xl text-right w-[50%]"
              >
                <p className="text-[10px] text-gray-500">Current Score</p>
                <p className="text-lg font-bold text-blue-700">
                  {Math.round(currentScore ?? 0)}
                </p>
                <p className="text-[10px] text-gray-500">
                  Utilisation: {oldUtil}%
                </p>
              </motion.div>
            </div>
          </div>

          {/* SNAPSHOT */}
          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: "18px",
              backgroundColor: "#f8fafc",
            }}
          >
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ display: "flex", gap: 1, alignItems: "center" }}
            >
              <InfoOutlinedIcon fontSize="small" /> Current Snapshot
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Credit Limit: <strong>{formatINR(currentLimit)}</strong>
            </Typography>
            <Typography variant="body2">
              Credit Balance: <strong>{formatINR(currentBalance)}</strong>
            </Typography>
            <Typography variant="body2">
              Income (Monthly): <strong>{formatINR(income)}</strong>
            </Typography>
          </Card>

          {/* NEW CREDIT LIMIT (card + slider + input) */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              p: 2,
              borderColor: "grey.200",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontSize: 13, fontWeight: 600, color: "grey.700" }}
              >
                New Credit Limit
              </Typography>
              <TextField
                size="small"
                value={form.new_limit.toLocaleString("en-IN")}
                onChange={handleNumericChange(
                  "new_limit",
                  currentLimit || 10000,
                  currentLimit ? currentLimit * 2 : 400000
                )}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                  sx: { "& input": { textAlign: "right", fontSize: 12 } },
                }}
                sx={{ width: 140 }}
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

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 0.5,
                color: "text.disabled",
                fontSize: 10,
              }}
            >
              <span>{formatINR(currentLimit || 10000)}</span>
              <span>{formatINR(currentLimit ? currentLimit * 2 : 400000)}</span>
            </Box>
          </Card>

          {/* NEW CREDIT BALANCE (card + slider + input) */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              p: 2,
              borderColor: "grey.200",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontSize: 13, fontWeight: 600, color: "grey.700" }}
              >
                New Credit Balance
              </Typography>
              <TextField
                size="small"
                value={form.new_balance.toLocaleString("en-IN")}
                onChange={handleNumericChange(
                  "new_balance",
                  0,
                  form.new_limit || 1
                )}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                  sx: { "& input": { textAlign: "right", fontSize: 12 } },
                }}
                sx={{ width: 140 }}
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

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 0.5,
                color: "text.disabled",
                fontSize: 10,
              }}
            >
              <span>₹0</span>
              <span>{formatINR(form.new_limit)}</span>
            </Box>
          </Card>

          {/* UTILISATION + CIRCLES */}
          <div className="space-y-2">
            <p className="text-xs text-gray-700">
              Utilisation: <span className="font-semibold">{oldUtil}%</span> →{" "}
              <span
                className={`font-semibold ${
                  newUtil <= 30
                    ? "text-green-600"
                    : newUtil <= 50
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {newUtil}%
              </span>
            </p>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 3,
                mt: 0.5,
              }}
            >
              <UtilCircle label="Current" value={oldUtil} />
              <UtilCircle label="Simulated" value={newUtil} />
            </Box>
          </div>

          {/* TOGGLES */}
          <div className="flex justify-between px-1">
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  name="missed_payment"
                  checked={form.missed_payment}
                  onChange={handleToggle}
                />
              }
              label={
                <span className="text-xs text-gray-700">Missed payment</span>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  name="add_enquiry"
                  checked={form.add_enquiry}
                  onChange={handleToggle}
                />
              }
              label={<span className="text-xs text-gray-700">Add enquiry</span>}
            />
          </div>

          {/* RUN BUTTON */}
          <motion.button
            onClick={runSimulation}
            whileTap={{ scale: 0.96 }}
            className="w-full bg-blue-600 text-white text-sm font-semibold py-3 rounded-2xl shadow-md"
          >
            Run Simulation
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
