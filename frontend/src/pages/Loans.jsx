import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Slider,
  Container,
  Grid,
  Chip,
  Divider,
  TextField,
  InputAdornment,
} from "@mui/material";

const formatINR = (value) => "₹ " + Math.round(value).toLocaleString("en-IN");

export default function Simulator() {
  const [loanAmount, setLoanAmount] = useState(1000000); // 10L
  const [downPayment, setDownPayment] = useState(100000); // 1L
  const [income, setIncome] = useState(25000); // monthly
  const [tenureYears, setTenureYears] = useState(10);
  const [interestRate, setInterestRate] = useState(7.9);
  const [otherEmis, setOtherEmis] = useState(0);

  // --- helpers ---

  const handleNumericChange = (setter, min, max) => (e) => {
    const raw = (e.target.value || "").replace(/,/g, "");
    let val = Number(raw);
    if (Number.isNaN(val)) val = min;
    val = Math.min(max, Math.max(min, val));
    setter(val);
  };

  const sliderSx = {
    "& .MuiSlider-rail": {
      color: "#e5e7eb",
      opacity: 1,
      height: 6,
    },
    "& .MuiSlider-track": {
      color: "#1d4ed8",
      height: 6,
    },
    "& .MuiSlider-thumb": {
      color: "#1d4ed8",
      width: 18,
      height: 18,
      boxShadow: "0 0 0 0 rgba(37,99,235,0)",
      "&:hover, &.Mui-focusVisible, &.Mui-active": {
        boxShadow: "0 0 0 8px rgba(37,99,235,0.15)",
      },
      "&:before": { boxShadow: "none" },
    },
  };

  const {
    principal,
    emi,
    totalInterest,
    totalValue,
    emiToIncomeRatio,
    tip,
    tipType,
  } = useMemo(() => {
    const principalAmount = Math.max(loanAmount - downPayment, 0);

    const n = tenureYears * 12;
    const r = interestRate / (12 * 100); // monthly rate

    let emiVal = 0;
    if (n > 0) {
      if (r === 0) {
        emiVal = principalAmount / n;
      } else {
        const pow = Math.pow(1 + r, n);
        emiVal = (principalAmount * r * pow) / (pow - 1);
      }
    }

    const totalPaid = emiVal * n;
    const interest = Math.max(totalPaid - principalAmount, 0);

    const totalEMIs = emiVal + Number(otherEmis || 0);
    const ratio = income > 0 ? totalEMIs / income : 0;

    let tipText = "";
    let type = "good";

    if (ratio <= 0.3) {
      type = "good";
      tipText = `✅ Do: This loan looks affordable. EMIs are about ${Math.round(
        ratio * 100
      )}% of your monthly income.`;
    } else if (ratio <= 0.45) {
      type = "borderline";
      tipText = `⚠️ Think: EMIs will use ~${Math.round(
        ratio * 100
      )}% of your income. Take this loan only if your expenses are low.`;
    } else {
      type = "bad";
      tipText = `❌ Don't: EMIs will take around ${Math.round(
        ratio * 100
      )}% of your income. This loan is risky at your current salary.`;
    }

    return {
      principal: principalAmount,
      emi: emiVal,
      totalInterest: interest,
      totalValue: principalAmount + interest,
      emiToIncomeRatio: ratio,
      tip: tipText,
      tipType: type,
    };
  }, [loanAmount, downPayment, income, tenureYears, interestRate, otherEmis]);

  const principalPct =
    principal + totalInterest > 0
      ? (principal / (principal + totalInterest)) * 100
      : 0;
  const interestPct = 100 - principalPct;
  const dtiPercent = Math.round(emiToIncomeRatio * 100);

  const recommendationStyles =
    tipType === "good"
      ? {
          bg: "#ecfdf3",
          border: "#4ade80",
          text: "#15803d",
          label: "Comfortable",
        }
      : tipType === "borderline"
      ? {
          bg: "#fef9c3",
          border: "#facc15",
          text: "#92400e",
          label: "Borderline",
        }
      : {
          bg: "#fee2e2",
          border: "#f97373",
          text: "#b91c1c",
          label: "High Risk",
        };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #3b82f6, #1d4ed8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pt: 4,
        px: 1.5,
        pb: 10,
      }}
    >
      <Container maxWidth="sm" sx={{ px: 0 }}>
        <Card
          elevation={6}
          sx={{
            borderRadius: 4,
            p: { xs: 2.5, sm: 3.5 },
            bgcolor: "background.paper",
          }}
        >
          {/* Header */}
          <Box mb={3}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "grey.900" }}
            >
              Affordability Calculator
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5, fontSize: 12 }}
            >
              Check your EMI, interest break-up and whether this loan fits your
              monthly income.
            </Typography>
          </Box>

          {/* Sliders + inputs */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {/* Loan Amount */}
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
                  Property / Loan Amount
                </Typography>
                <TextField
                  size="small"
                  value={loanAmount.toLocaleString("en-IN")}
                  onChange={handleNumericChange(
                    setLoanAmount,
                    200000,
                    20000000
                  )}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">₹</InputAdornment>
                    ),
                    sx: { "& input": { textAlign: "right", fontSize: 12 } },
                  }}
                  sx={{ width: 130 }}
                />
              </Box>
              <Slider
                size="small"
                value={loanAmount}
                min={200000}
                max={20000000}
                step={50000}
                onChange={(_, v) => setLoanAmount(v)}
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
                <span>₹2L</span>
                <span>₹2Cr</span>
              </Box>
            </Card>

            {/* Down Payment */}
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
                  Down Payment
                </Typography>
                <TextField
                  size="small"
                  value={downPayment.toLocaleString("en-IN")}
                  onChange={handleNumericChange(
                    setDownPayment,
                    0,
                    loanAmount || 1
                  )}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">₹</InputAdornment>
                    ),
                    sx: { "& input": { textAlign: "right", fontSize: 12 } },
                  }}
                  sx={{ width: 130 }}
                />
              </Box>
              <Slider
                size="small"
                value={downPayment}
                min={0}
                max={loanAmount || 1}
                step={25000}
                onChange={(_, v) =>
                  setDownPayment(Math.min(v, loanAmount || v))
                }
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
                <span>{formatINR(loanAmount)}</span>
              </Box>
            </Card>

            {/* Income */}
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
                  Gross Income (Monthly)
                </Typography>
                <TextField
                  size="small"
                  value={income.toLocaleString("en-IN")}
                  onChange={handleNumericChange(setIncome, 10000, 1000000)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">₹</InputAdornment>
                    ),
                    sx: { "& input": { textAlign: "right", fontSize: 12 } },
                  }}
                  sx={{ width: 130 }}
                />
              </Box>
              <Slider
                size="small"
                value={income}
                min={10000}
                max={1000000} // 10L
                step={5000}
                onChange={(_, v) => setIncome(v)}
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
                <span>₹10K</span>
                <span>₹10L</span>
              </Box>
            </Card>

            {/* Tenure */}
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
                  Tenure
                </Typography>
                <TextField
                  size="small"
                  value={tenureYears}
                  onChange={handleNumericChange(setTenureYears, 1, 30)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">yrs</InputAdornment>
                    ),
                    sx: { "& input": { textAlign: "right", fontSize: 12 } },
                  }}
                  sx={{ width: 90 }}
                />
              </Box>
              <Slider
                size="small"
                value={tenureYears}
                min={1}
                max={30}
                step={1}
                onChange={(_, v) => setTenureYears(v)}
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
                <span>1</span>
                <span>30</span>
              </Box>
            </Card>

            {/* Interest Rate */}
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
                  Rate of Interest
                </Typography>
                <TextField
                  size="small"
                  value={interestRate}
                  onChange={handleNumericChange(setInterestRate, 6, 18)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                    sx: { "& input": { textAlign: "right", fontSize: 12 } },
                  }}
                  sx={{ width: 90 }}
                />
              </Box>
              <Slider
                size="small"
                value={interestRate}
                min={6}
                max={18}
                step={0.1}
                onChange={(_, v) => setInterestRate(v)}
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
                <span>6%</span>
                <span>18%</span>
              </Box>
            </Card>

            {/* Other EMIs */}
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
                  Other EMIs (Monthly)
                </Typography>
                <TextField
                  size="small"
                  value={otherEmis.toLocaleString("en-IN")}
                  onChange={handleNumericChange(setOtherEmis, 0, 500000)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="end">₹</InputAdornment>
                    ),
                    sx: { "& input": { textAlign: "right", fontSize: 12 } },
                  }}
                  sx={{ width: 130 }}
                />
              </Box>
              <Slider
                size="small"
                value={otherEmis}
                min={0}
                max={500000}
                step={2000}
                onChange={(_, v) => setOtherEmis(v)}
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
                <span>₹5L</span>
              </Box>
            </Card>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Bottom section remains same as previous version: break-up + DTI pie + recommendation */}

          <Grid
            spacing={2.5}
            sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Break-up Card */}
            <Grid item xs={12} sm={7}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  p: 2,
                  bgcolor: "#f8fafc",
                  borderColor: "grey.200",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.75,
                    fontSize: 12,
                    color: "grey.700",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#fb923c",
                      }}
                    />
                    <span>Principal amount</span>
                  </Box>
                  <Box sx={{ fontWeight: 600 }}>{formatINR(principal)}</Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.75,
                    fontSize: 12,
                    color: "grey.700",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#3b82f6",
                      }}
                    />
                    <span>Total Interest</span>
                  </Box>
                  <Box sx={{ fontWeight: 600 }}>{formatINR(totalInterest)}</Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                    fontSize: 12,
                    color: "grey.700",
                  }}
                >
                  <span>Monthly EMI</span>
                  <Box sx={{ fontWeight: 600 }}>{formatINR(emi)}</Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    color: "grey.700",
                    mb: 1.5,
                  }}
                >
                  <span>Total Value</span>
                  <Box sx={{ fontWeight: 600 }}>{formatINR(totalValue)}</Box>
                </Box>

                <Box
                  sx={{
                    mt: 0.5,
                    height: 22,
                    borderRadius: 999,
                    overflow: "hidden",
                    display: "flex",
                    boxShadow: "inset 0 0 0 1px rgba(148,163,184,0.25)",
                  }}
                >
                  <Box
                    sx={{
                      width: `${principalPct}%`,
                      bgcolor: "#fb923c",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "#111827",
                    }}
                  >
                    {Math.round(principalPct)}%
                  </Box>
                  <Box
                    sx={{
                      width: `${interestPct}%`,
                      bgcolor: "#3b82f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    {Math.round(interestPct)}%
                  </Box>
                </Box>
              </Card>
            </Grid>

            {/* Debt-to-Income Pie */}
            <Grid item xs={12} sm={5}>
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "grey.700",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  Debt / Income
                </Typography>

                <Box
                  sx={{
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    background: `conic-gradient(#3b82f6 ${
                      Math.min(dtiPercent, 100) * 3.6
                    }deg, #e5e7eb 0deg)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      bgcolor: "background.paper",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      px: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: 16,
                        fontWeight: 700,
                        color:
                          tipType === "good"
                            ? "#16a34a"
                            : tipType === "borderline"
                            ? "#eab308"
                            : "#dc2626",
                      }}
                    >
                      {dtiPercent}%
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ fontSize: 9, color: "text.secondary" }}
                    >
                      of income in EMIs
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="caption"
                  sx={{ fontSize: 11, color: "text.secondary" }}
                >
                  Includes this EMI + other EMIs
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Recommendation */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 3,
              bgcolor: recommendationStyles.bg,
              border: `1px solid ${recommendationStyles.border}`,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  color: recommendationStyles.text,
                }}
              >
                Recommendation
              </Typography>
              <Chip
                label={recommendationStyles.label}
                size="small"
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: recommendationStyles.text,
                  bgcolor: "white",
                  borderRadius: 999,
                  border: `1px solid ${recommendationStyles.border}`,
                }}
              />
            </Box>

            <Typography
              variant="body2"
              sx={{ fontSize: 12, color: recommendationStyles.text }}
            >
              {tip}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                mt: 0.75,
                display: "block",
                fontSize: 10,
                opacity: 0.8,
                color: recommendationStyles.text,
              }}
            >
              Total EMIs ≈ {dtiPercent}% of your monthly income.
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}
