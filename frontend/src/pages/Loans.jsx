import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Slider,
  Container,
  TextField,
  InputAdornment,
} from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PercentRoundedIcon from "@mui/icons-material/PercentRounded";
import CreditScoreRoundedIcon from "@mui/icons-material/CreditScoreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import { motion } from "framer-motion";

const formatINR = (v) => "₹ " + Math.round(v).toLocaleString("en-IN");

const sliderSx = {
  color: "#2563eb",
  "& .MuiSlider-track": { border: "none", height: 5 },
  "& .MuiSlider-rail": { opacity: 0.15, height: 5 },
  "& .MuiSlider-thumb": {
    width: 18, height: 18,
    bgcolor: "white",
    border: "2px solid #2563eb",
    "&:hover, &.Mui-focusVisible, &.Mui-active": {
      boxShadow: "0 0 0 8px rgba(37,99,235,0.12)",
    },
    "&:before": { boxShadow: "none" },
  },
};

/* ── Section card with icon header ── */
function SliderCard({ icon, title, children }) {
  return (
    <Box sx={{
      borderRadius: 3.5,
      border: "1px solid #e5e7eb",
      bgcolor: "white",
      overflow: "hidden",
      boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
    }}>
      <Box sx={{
        display: "flex", alignItems: "center", gap: 1,
        px: 2, py: 1.25,
        borderBottom: "1px solid #f1f5f9",
        bgcolor: "#fafbff",
      }}>
        <Box sx={{ color: "#2563eb", display: "flex", fontSize: 17 }}>{icon}</Box>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{title}</Typography>
      </Box>
      <Box sx={{ px: 2, pt: 1.5, pb: 2 }}>{children}</Box>
    </Box>
  );
}

/* ── Result row ── */
function ResultRow({ label, value, bold, accent }) {
  return (
    <Box sx={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      py: 1, borderBottom: "1px solid #f1f5f9", "&:last-child": { borderBottom: "none" },
    }}>
      <Typography sx={{ fontSize: 12, color: "#64748b" }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: bold ? 800 : 600, color: accent || "#1e293b" }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function AffordabilityCalculator() {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [downPayment, setDownPayment] = useState(100000);
  const [income, setIncome] = useState(25000);
  const [tenureYears, setTenureYears] = useState(10);
  const [interestRate, setInterestRate] = useState(7.9);
  const [otherEmis, setOtherEmis] = useState(0);

  const handleNumericChange = (setter, min, max) => (e) => {
    const raw = (e.target.value || "").replace(/,/g, "");
    let val = Number(raw);
    if (Number.isNaN(val)) val = min;
    val = Math.min(max, Math.max(min, val));
    setter(val);
  };

  const { principal, emi, totalInterest, totalValue, emiToIncomeRatio, tip, tipType } = useMemo(() => {
    const principalAmount = Math.max(loanAmount - downPayment, 0);
    const n = tenureYears * 12;
    const r = interestRate / (12 * 100);
    let emiVal = 0;
    if (n > 0) {
      if (r === 0) emiVal = principalAmount / n;
      else {
        const pow = Math.pow(1 + r, n);
        emiVal = (principalAmount * r * pow) / (pow - 1);
      }
    }
    const totalPaid = emiVal * n;
    const interest = Math.max(totalPaid - principalAmount, 0);
    const totalEMIs = emiVal + Number(otherEmis || 0);
    const ratio = income > 0 ? totalEMIs / income : 0;

    let tipText = "", type = "good";
    if (ratio <= 0.3) {
      type = "good";
      tipText = `This loan looks affordable. EMIs are about ${Math.round(ratio * 100)}% of your monthly income — well within healthy limits.`;
    } else if (ratio <= 0.45) {
      type = "borderline";
      tipText = `EMIs will use ~${Math.round(ratio * 100)}% of your income. Take this loan only if your monthly expenses are low.`;
    } else {
      type = "bad";
      tipText = `EMIs will take around ${Math.round(ratio * 100)}% of your income. This loan is risky at your current salary.`;
    }

    return { principal: principalAmount, emi: emiVal, totalInterest: interest, totalValue: principalAmount + interest, emiToIncomeRatio: ratio, tip: tipText, tipType: type };
  }, [loanAmount, downPayment, income, tenureYears, interestRate, otherEmis]);

  const principalPct = principal + totalInterest > 0 ? (principal / (principal + totalInterest)) * 100 : 0;
  const interestPct = 100 - principalPct;
  const dtiPercent = Math.round(emiToIncomeRatio * 100);

  const recStyle = tipType === "good"
    ? { bg: "#ecfdf5", border: "#6ee7b7", text: "#065f46", chipBg: "#d1fae5", label: "Comfortable", icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> }
    : tipType === "borderline"
    ? { bg: "#fefce8", border: "#fde68a", text: "#78350f", chipBg: "#fef9c3", label: "Borderline", icon: <WarningAmberRoundedIcon sx={{ fontSize: 18 }} /> }
    : { bg: "#fef2f2", border: "#fca5a5", text: "#991b1b", chipBg: "#fee2e2", label: "High Risk", icon: <CancelRoundedIcon sx={{ fontSize: 18 }} /> };

  const dtiColor = tipType === "good" ? "#16a34a" : tipType === "borderline" ? "#d97706" : "#dc2626";
  const dtiTrack = tipType === "good" ? "#dcfce7" : tipType === "borderline" ? "#fef3c7" : "#fee2e2";

  const inputSx = {
    "& input": { textAlign: "right", fontSize: 13, fontWeight: 700 },
    "& fieldset": { borderColor: "#e5e7eb" },
    "& .MuiOutlinedInput-root:hover fieldset": { borderColor: "#93c5fd" },
    "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "#2563eb" },
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)",
      display: "flex", alignItems: "flex-start", justifyContent: "center",
      pt: 3, px: 2, pb: 14,
    }}>
      {/* Ambient blobs */}
      <Box sx={{ position: "fixed", top: -80, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(96,165,250,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
      <Box sx={{ position: "fixed", bottom: 40, left: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(59,130,246,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />

      <Container maxWidth="sm" sx={{ px: 0 }}>

        {/* ── Page header ── */}
        <Box sx={{ mb: 3, px: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2.5,
              bgcolor: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <HomeRoundedIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 22, fontWeight: 800, color: "white", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                Affordability Calculator
              </Typography>
              <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                Check EMI, interest breakup & loan fit
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── EMI summary banner ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Box sx={{
            borderRadius: 3.5, bgcolor: "white", mb: 3,
            p: 2.5, display: "grid", gridTemplateColumns: "1fr 1px 1fr 1px 1fr",
            alignItems: "center",
            boxShadow: "0 12px 40px rgba(15,23,42,0.2)",
          }}>
            {[
              { label: "Monthly EMI", value: formatINR(emi), accent: "#1d4ed8" },
              { label: "Total Interest", value: formatINR(totalInterest), accent: "#dc2626" },
              { label: "Total Value", value: formatINR(totalValue), accent: "#1e293b" },
            ].map(({ label, value, accent }, i) => (
              <React.Fragment key={label}>
                {i > 0 && <Box sx={{ width: 1, height: 36, bgcolor: "#e5e7eb", mx: "auto" }} />}
                <Box sx={{ textAlign: "center", px: 1 }}>
                  <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, mb: 0.4 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 900, color: accent, letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {value}
                  </Typography>
                </Box>
              </React.Fragment>
            ))}
          </Box>
        </motion.div>

        {/* ── Slider inputs ── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>

          {/* Loan Amount */}
          <SliderCard icon={<HomeRoundedIcon sx={{ fontSize: 17 }} />} title="Property / Loan Amount">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
              <Typography sx={{ fontSize: 12, color: "#64748b" }}>Set loan amount</Typography>
              <TextField size="small" value={loanAmount.toLocaleString("en-IN")}
                onChange={handleNumericChange(setLoanAmount, 200000, 20000000)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 12, color: "#94a3b8" }}>₹</Typography></InputAdornment>, sx: { borderRadius: 2, ...inputSx["& .MuiOutlinedInput-root"] } }}
                sx={{ width: 130, ...inputSx }} />
            </Box>
            <Slider size="small" value={loanAmount} min={200000} max={20000000} step={50000} onChange={(_, v) => setLoanAmount(v)} sx={sliderSx} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>₹2L</Typography>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>₹2Cr</Typography>
            </Box>
          </SliderCard>

          {/* Down Payment */}
          <SliderCard icon={<PaymentsRoundedIcon sx={{ fontSize: 17 }} />} title="Down Payment">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
              <Typography sx={{ fontSize: 12, color: "#64748b" }}>Amount you'll pay upfront</Typography>
              <TextField size="small" value={downPayment.toLocaleString("en-IN")}
                onChange={handleNumericChange(setDownPayment, 0, loanAmount || 1)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 12, color: "#94a3b8" }}>₹</Typography></InputAdornment>, sx: { borderRadius: 2 } }}
                sx={{ width: 130, ...inputSx }} />
            </Box>
            <Slider size="small" value={downPayment} min={0} max={loanAmount || 1} step={25000} onChange={(_, v) => setDownPayment(Math.min(v, loanAmount || v))} sx={sliderSx} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>₹0</Typography>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{formatINR(loanAmount)}</Typography>
            </Box>
          </SliderCard>

          {/* Income */}
          <SliderCard icon={<AccountBalanceRoundedIcon sx={{ fontSize: 17 }} />} title="Gross Monthly Income">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
              <Typography sx={{ fontSize: 12, color: "#64748b" }}>Your take-home salary</Typography>
              <TextField size="small" value={income.toLocaleString("en-IN")}
                onChange={handleNumericChange(setIncome, 10000, 1000000)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 12, color: "#94a3b8" }}>₹</Typography></InputAdornment>, sx: { borderRadius: 2 } }}
                sx={{ width: 130, ...inputSx }} />
            </Box>
            <Slider size="small" value={income} min={10000} max={1000000} step={5000} onChange={(_, v) => setIncome(v)} sx={sliderSx} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>₹10K</Typography>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>₹10L</Typography>
            </Box>
          </SliderCard>

          {/* Tenure + Rate — side by side */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <SliderCard icon={<CalendarMonthRoundedIcon sx={{ fontSize: 17 }} />} title="Tenure">
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                <Typography sx={{ fontSize: 11, color: "#64748b" }}>Years</Typography>
                <TextField size="small" value={tenureYears}
                  onChange={handleNumericChange(setTenureYears, 1, 30)}
                  InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 11, color: "#94a3b8" }}>yr</Typography></InputAdornment>, sx: { borderRadius: 2 } }}
                  sx={{ width: 72, ...inputSx }} />
              </Box>
              <Slider size="small" value={tenureYears} min={1} max={30} step={1} onChange={(_, v) => setTenureYears(v)} sx={sliderSx} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>1</Typography>
                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>30</Typography>
              </Box>
            </SliderCard>

            <SliderCard icon={<PercentRoundedIcon sx={{ fontSize: 17 }} />} title="Interest Rate">
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                <Typography sx={{ fontSize: 11, color: "#64748b" }}>Per annum</Typography>
                <TextField size="small" value={interestRate}
                  onChange={handleNumericChange(setInterestRate, 6, 18)}
                  InputProps={{ endAdornment: <InputAdornment position="end"><Typography sx={{ fontSize: 11, color: "#94a3b8" }}>%</Typography></InputAdornment>, sx: { borderRadius: 2 } }}
                  sx={{ width: 72, ...inputSx }} />
              </Box>
              <Slider size="small" value={interestRate} min={6} max={18} step={0.1} onChange={(_, v) => setInterestRate(v)} sx={sliderSx} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>6%</Typography>
                <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>18%</Typography>
              </Box>
            </SliderCard>
          </Box>

          {/* Other EMIs */}
          <SliderCard icon={<CreditScoreRoundedIcon sx={{ fontSize: 17 }} />} title="Other EMIs (Monthly)">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
              <Typography sx={{ fontSize: 12, color: "#64748b" }}>Existing loan repayments</Typography>
              <TextField size="small" value={otherEmis.toLocaleString("en-IN")}
                onChange={handleNumericChange(setOtherEmis, 0, 500000)}
                InputProps={{ startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 12, color: "#94a3b8" }}>₹</Typography></InputAdornment>, sx: { borderRadius: 2 } }}
                sx={{ width: 130, ...inputSx }} />
            </Box>
            <Slider size="small" value={otherEmis} min={0} max={500000} step={2000} onChange={(_, v) => setOtherEmis(v)} sx={sliderSx} />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>₹0</Typography>
              <Typography sx={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>₹5L</Typography>
            </Box>
          </SliderCard>
        </Box>

        {/* ── Breakup + DTI ── */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>

          {/* Breakup card */}
          <Box sx={{ borderRadius: 3.5, bgcolor: "white", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 10px rgba(15,23,42,0.05)" }}>
            <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid #f1f5f9", bgcolor: "#fafbff" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>Loan Breakup</Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              <ResultRow label="Principal" value={formatINR(principal)} />
              <ResultRow label="Interest" value={formatINR(totalInterest)} accent="#dc2626" />
              <ResultRow label="EMI / mo" value={formatINR(emi)} bold accent="#1d4ed8" />

              {/* Stacked bar */}
              <Box sx={{ mt: 1.5, height: 10, borderRadius: 999, overflow: "hidden", display: "flex", bgcolor: "#f1f5f9" }}>
                <Box sx={{ width: `${principalPct}%`, bgcolor: "#fb923c", transition: "width 0.3s" }} />
                <Box sx={{ width: `${interestPct}%`, bgcolor: "#2563eb", transition: "width 0.3s" }} />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.6 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#fb923c" }} />
                  <Typography sx={{ fontSize: 9, color: "#64748b" }}>{Math.round(principalPct)}%</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#2563eb" }} />
                  <Typography sx={{ fontSize: 9, color: "#64748b" }}>{Math.round(interestPct)}%</Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* DTI donut */}
          <Box sx={{ borderRadius: 3.5, bgcolor: "white", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 10px rgba(15,23,42,0.05)" }}>
            <Box sx={{ px: 2, py: 1.25, borderBottom: "1px solid #f1f5f9", bgcolor: "#fafbff" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#1e293b" }}>Debt / Income</Typography>
            </Box>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
              <Box sx={{
                width: 88, height: 88, borderRadius: "50%",
                background: `conic-gradient(${dtiColor} ${Math.min(dtiPercent, 100) * 3.6}deg, ${dtiTrack} 0deg)`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Box sx={{ width: 58, height: 58, borderRadius: "50%", bgcolor: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 900, color: dtiColor, lineHeight: 1 }}>{dtiPercent}%</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: 10, color: "#64748b", textAlign: "center", lineHeight: 1.4 }}>
                of income used<br />in EMIs
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Recommendation ── */}
        <Box sx={{
          borderRadius: 3.5, p: 2.5,
          bgcolor: recStyle.bg,
          border: `1px solid ${recStyle.border}`,
          boxShadow: "0 2px 10px rgba(15,23,42,0.05)",
        }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.25 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box sx={{ color: recStyle.text, display: "flex" }}>{recStyle.icon}</Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: recStyle.text }}>Recommendation</Typography>
            </Box>
            <Box sx={{ px: 1.2, py: 0.4, borderRadius: 999, bgcolor: recStyle.chipBg, border: `1px solid ${recStyle.border}` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 800, color: recStyle.text }}>{recStyle.label}</Typography>
            </Box>
          </Box>
          <Typography sx={{ fontSize: 12, color: recStyle.text, lineHeight: 1.7 }}>{tip}</Typography>
          <Typography sx={{ mt: 1, fontSize: 11, color: recStyle.text, opacity: 0.75 }}>
            Total EMIs ≈ {dtiPercent}% of your monthly income.
          </Typography>
        </Box>

      </Container>
    </Box>
  );
}