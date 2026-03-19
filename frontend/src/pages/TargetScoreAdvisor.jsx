import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Container,
  Stack,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Slider,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import TrackChangesRoundedIcon from "@mui/icons-material/TrackChangesRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import { advisor, user } from "../api";

const MAX_SCORE = 900;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Always whole number, never decimal
const fmt = (v) => {
  const n = Number(v);
  return Number.isNaN(n) ? "--" : String(Math.round(n));
};

/* ── Swipe card ── */
function InsightCard({
  icon,
  title,
  body,
  accentBg,
  accentBorder,
  iconBg,
  iconBorder,
  iconColor,
}) {
  return (
    <Box
      sx={{
        minWidth: 230,
        maxWidth: 250,
        flex: "0 0 auto",
        scrollSnapAlign: "start",
        borderRadius: 3,
        p: 2,
        bgcolor: accentBg,
        border: `1px solid ${accentBorder}`,
        boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          bgcolor: iconBg,
          border: `1px solid ${iconBorder}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1.25,
          color: iconColor,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 800,
          color: "grey.700",
          mb: 0.5,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ fontSize: 12, color: "grey.600", lineHeight: 1.65 }}>
        {body}
      </Typography>
    </Box>
  );
}

/* ── Delta pill ── */
function DeltaPill({ current, target }) {
  const delta = (target ?? 0) - (current ?? 0);
  if (delta <= 0) return null;
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.2,
        py: 0.4,
        borderRadius: 999,
        bgcolor: "#dbeafe",
        border: "1px solid #bfdbfe",
      }}
    >
      <TrendingUpRoundedIcon sx={{ fontSize: 13, color: "#2563eb" }} />
      <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#1d4ed8" }}>
        +{Math.round(delta)} pts
      </Typography>
    </Box>
  );
}

/* ── Main ── */
export default function TargetScoreAdvisor() {
  const [currentScore, setCurrentScore] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [targetScore, setTargetScore] = useState(800);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        setProfileLoading(true);
        setProfileError("");
        const data = await user.profile();
        const parsed = Number(data?.user_profile?.score);
        if (!mounted) return;
        if (Number.isNaN(parsed) || parsed <= 0) {
          setCurrentScore(300);
          setTargetScore(800);
        } else {
          const r = Math.round(parsed);
          setCurrentScore(r);
          setTargetScore(clamp(800, r, MAX_SCORE));
        }
      } catch (err) {
        if (!mounted) return;
        setProfileError(err?.message || "Could not load current score.");
        setCurrentScore(300);
        setTargetScore(800);
      } finally {
        if (mounted) setProfileLoading(false);
      }
    }
    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const minAllowedScore = useMemo(() => {
    if (typeof currentScore !== "number") return 300;
    return clamp(Math.round(currentScore), 300, MAX_SCORE);
  }, [currentScore]);

  const achievableStyles = useMemo(() => {
    if (!result) return null;
    return result.achievable
      ? {
          bg: "#ecfdf5",
          border: "#6ee7b7",
          text: "#065f46",
          chipBg: "#d1fae5",
          label: "Achievable",
          icon: <CheckCircleRoundedIcon sx={{ fontSize: 17 }} />,
        }
      : {
          bg: "#fef2f2",
          border: "#fca5a5",
          text: "#991b1b",
          chipBg: "#fee2e2",
          label: "Needs More Time",
          icon: <CancelRoundedIcon sx={{ fontSize: 17 }} />,
        };
  }, [result]);

  const handleTargetChange = (value) => {
    const next = clamp(
      Number(value) || minAllowedScore,
      minAllowedScore,
      MAX_SCORE,
    );
    setTargetScore(next);
  };

  const handleInputChange = (e) => {
    const raw = (e.target.value || "").replace(/[^\d]/g, "");
    if (raw === "") {
      setTargetScore(minAllowedScore);
      return;
    }
    handleTargetChange(raw);
  };

  const increment = () =>
    setTargetScore((p) => clamp(p + 1, minAllowedScore, MAX_SCORE));
  const decrement = () =>
    setTargetScore((p) => clamp(p - 1, minAllowedScore, MAX_SCORE));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await advisor.targetScore({ target_score: targetScore });
      setResult(data);
    } catch (err) {
      setError(err?.message || "Could not generate advisor plan.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const fillPct =
    ((targetScore - minAllowedScore) / (MAX_SCORE - minAllowedScore)) * 100;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        pt: 3,
        px: 2,
        pb: 14,
      }}
    >
      {/* Decorative blobs */}
      <Box
        sx={{
          position: "fixed",
          top: -100,
          right: -60,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(96,165,250,0.35) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: -80,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(59,130,246,0.25) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="sm" sx={{ px: 0 }}>
        {/* ── Header ── */}
        <Box sx={{ mb: 3, px: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.5,
                bgcolor: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <InsightsRoundedIcon sx={{ color: "white", fontSize: 20 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                Target Score Advisor
              </Typography>
              <Typography
                sx={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}
              >
                Your personalized credit roadmap
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Picker card ── */}
        <Box
          sx={{
            borderRadius: 4,
            bgcolor: "white",
            p: 2.5,
            mb: 2,
            boxShadow: "0 20px 60px rgba(15,23,42,0.22)",
          }}
        >
          {/* Header row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 2.5,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "grey.900",
                  mb: 0.3,
                }}
              >
                Choose your target
              </Typography>
              <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                Must be above your current score
              </Typography>
            </Box>
            {profileLoading ? (
              <Chip
                label="Loading…"
                size="small"
                sx={{ fontWeight: 700, bgcolor: "#eff6ff", color: "#2563eb" }}
              />
            ) : (
              <Chip
                icon={
                  <FlagRoundedIcon
                    sx={{
                      fontSize: "15px !important",
                      color: "#2563eb !important",
                    }}
                  />
                }
                label={`Now: ${fmt(minAllowedScore)}`}
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: "#eff6ff",
                  color: "#1d4ed8",
                  border: "1px solid #bfdbfe",
                }}
              />
            )}
          </Box>

          {/* Big number + stepper */}
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}
          >
            <IconButton
              onClick={decrement}
              disabled={profileLoading || targetScore <= minAllowedScore}
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                border: "1px solid #e5e7eb",
                bgcolor: "#f8fafc",
                "&:hover": { bgcolor: "#eff6ff", borderColor: "#bfdbfe" },
                "&.Mui-disabled": { opacity: 0.4 },
                flexShrink: 0,
              }}
            >
              <RemoveRoundedIcon fontSize="small" />
            </IconButton>

            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Box
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  background:
                    "linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)",
                  border: "1px solid #bfdbfe",
                  mb: 0.75,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 52,
                    fontWeight: 900,
                    color: "#1d4ed8",
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {Math.round(targetScore)}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 10,
                    color: "#64748b",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    fontWeight: 700,
                    mt: 0.5,
                  }}
                >
                  Target Score
                </Typography>
              </Box>
              <DeltaPill current={currentScore} target={targetScore} />
            </Box>

            <IconButton
              onClick={increment}
              disabled={profileLoading || targetScore >= MAX_SCORE}
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                border: "1px solid #e5e7eb",
                bgcolor: "#f8fafc",
                "&:hover": { bgcolor: "#eff6ff", borderColor: "#bfdbfe" },
                "&.Mui-disabled": { opacity: 0.4 },
                flexShrink: 0,
              }}
            >
              <AddRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Custom slider track */}
          <Box sx={{ mb: 2, px: 0.5 }}>
            <Box
              sx={{
                position: "relative",
                height: 6,
                borderRadius: 999,
                bgcolor: "#e5e7eb",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${fillPct}%`,
                  borderRadius: 999,
                  background: "linear-gradient(90deg, #3b82f6, #2563eb)",
                  boxShadow: "0 0 8px rgba(37,99,235,0.4)",
                  transition: "width 0.1s",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: `${fillPct}%`,
                  transform: "translate(-50%, -50%)",
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor: "#2563eb",
                  border: "2px solid white",
                  boxShadow: "0 0 0 3px rgba(37,99,235,0.2)",
                  transition: "left 0.1s",
                }}
              />
            </Box>
            <Slider
              size="small"
              value={targetScore}
              min={minAllowedScore}
              max={MAX_SCORE}
              step={1}
              onChange={(_, v) => setTargetScore(v)}
              disabled={profileLoading}
              sx={{
                mt: -2.5,
                mb: 0,
                opacity: 0,
                height: 20,
                "& .MuiSlider-thumb": { width: 20, height: 20 },
              }}
            />
            {/* <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography
                sx={{ fontSize: 10, color: "text.disabled", fontWeight: 600 }}
              >
                {minAllowedScore}
              </Typography>
              <Typography
                sx={{ fontSize: 10, color: "text.disabled", fontWeight: 600 }}
              >
                {MAX_SCORE}
              </Typography>
            </Box> */}
          </Box>

          {/* Exact input */}
          {/* <TextField
            fullWidth
            size="small"
            label="Enter exact target"
            value={targetScore}
            onChange={handleInputChange}
            type="number"
            inputProps={{ min: minAllowedScore, max: MAX_SCORE, step: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: "text.disabled",
                      fontWeight: 700,
                    }}
                  >
                    pts
                  </Typography>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 2.5,
                "& input": { fontWeight: 700, fontSize: 14 },
              },
            }}
          /> */}
        </Box>

        {profileError && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
            {profileError}
          </Alert>
        )}

        {/* ── CTA ── */}
        <Box
          onClick={!loading && !profileLoading ? handleSubmit : undefined}
          sx={{
            width: "100%",
            py: 1.75,
            borderRadius: 3,
            bgcolor:
              loading || profileLoading ? "rgba(255,255,255,0.25)" : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            cursor: loading || profileLoading ? "not-allowed" : "pointer",
            opacity: loading || profileLoading ? 0.7 : 1,
            boxShadow:
              loading || profileLoading
                ? "none"
                : "0 8px 24px rgba(15,23,42,0.18)",
            transition: "all 0.2s",
            mb: 2,
            "&:active": { transform: "scale(0.985)" },
          }}
        >
          {loading ? (
            <CircularProgress size={18} sx={{ color: "white" }} />
          ) : (
            <>
              <AutoAwesomeRoundedIcon sx={{ color: "#2563eb", fontSize: 18 }} />
              <Typography
                sx={{ fontWeight: 800, fontSize: 15, color: "#1d4ed8" }}
              >
                Get My Plan
              </Typography>
            </>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {/* ── Results ── */}
        {result && (
          <Box
            sx={{
              borderRadius: 4,
              bgcolor: "white",
              p: 2.5,
              boxShadow: "0 20px 60px rgba(15,23,42,0.22)",
            }}
          >
            <Stack spacing={2.5}>
              {/* Score comparison */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 1.5,
                }}
              >
                {[
                  {
                    label: "Current Score",
                    value: fmt(result.current_score),
                    color: "grey.900",
                  },
                  {
                    label: "Target Score",
                    value: fmt(result.target_score),
                    color: "#1d4ed8",
                  },
                ].map(({ label, value, color }) => (
                  <Box
                    key={label}
                    sx={{
                      p: 1.75,
                      borderRadius: 3,
                      bgcolor: "#f8fafc",
                      border: "1px solid #e5e7eb",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "text.secondary",
                        textTransform: "uppercase",
                        letterSpacing: 0.7,
                        fontWeight: 700,
                        mb: 0.5,
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 28,
                        fontWeight: 900,
                        color,
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Achievable badge */}
              {achievableStyles && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.75,
                    borderRadius: 3,
                    bgcolor: achievableStyles.bg,
                    border: `1px solid ${achievableStyles.border}`,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ color: achievableStyles.text, display: "flex" }}>
                      {achievableStyles.icon}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: achievableStyles.text,
                      }}
                    >
                      Score Outlook
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 999,
                      bgcolor: achievableStyles.chipBg,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 800,
                        color: achievableStyles.text,
                      }}
                    >
                      {achievableStyles.label}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Timeline */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.75,
                  p: 1.75,
                  borderRadius: 3,
                  bgcolor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    bgcolor: "#dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <AccessTimeRoundedIcon
                    sx={{ color: "#2563eb", fontSize: 20 }}
                  />
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontSize: 10,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: 0.7,
                      fontWeight: 700,
                      mb: 0.2,
                    }}
                  >
                    Estimated Timeline
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 900,
                      color: "#1d4ed8",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.1,
                    }}
                  >
                    {result.time_horizon || "--"}
                  </Typography>
                </Box>
              </Box>

              {/* Key actions */}
              {Array.isArray(result.key_actions) &&
                result.key_actions.length > 0 && (
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        mb: 1.25,
                      }}
                    >
                      <TrendingUpRoundedIcon
                        sx={{ fontSize: 16, color: "#2563eb" }}
                      />
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "grey.700",
                          letterSpacing: 0.6,
                          textTransform: "uppercase",
                        }}
                      >
                        Key Actions
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        overflowX: "auto",
                        pb: 1,
                        scrollSnapType: "x mandatory",
                        "&::-webkit-scrollbar": { display: "none" },
                        scrollbarWidth: "none",
                      }}
                    >
                      {result.key_actions.map((item, i) => (
                        <InsightCard
                          key={`action-${i}`}
                          icon={<TrendingUpRoundedIcon sx={{ fontSize: 16 }} />}
                          title={`Action ${i + 1}`}
                          body={item}
                          accentBg="#eff6ff"
                          accentBorder="#bfdbfe"
                          iconBg="#dbeafe"
                          iconBorder="#bfdbfe"
                          iconColor="#2563eb"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

              {/* Habits to avoid */}
              {Array.isArray(result.habits_to_avoid) &&
                result.habits_to_avoid.length > 0 && (
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.8,
                        mb: 1.25,
                      }}
                    >
                      <WarningAmberRoundedIcon
                        sx={{ fontSize: 16, color: "#d97706" }}
                      />
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 800,
                          color: "grey.700",
                          letterSpacing: 0.6,
                          textTransform: "uppercase",
                        }}
                      >
                        Habits to Avoid
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        overflowX: "auto",
                        pb: 1,
                        scrollSnapType: "x mandatory",
                        "&::-webkit-scrollbar": { display: "none" },
                        scrollbarWidth: "none",
                      }}
                    >
                      {result.habits_to_avoid.map((item, i) => (
                        <InsightCard
                          key={`habit-${i}`}
                          icon={
                            <WarningAmberRoundedIcon sx={{ fontSize: 16 }} />
                          }
                          title={`Avoid ${i + 1}`}
                          body={item}
                          accentBg="#fff7ed"
                          accentBorder="#fdba74"
                          iconBg="#ffedd5"
                          iconBorder="#fdba74"
                          iconColor="#ea580c"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

              {/* Utilization target */}
              {result.utilization_target && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.75,
                    p: 1.75,
                    borderRadius: 3,
                    bgcolor: "#eff6ff",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2.5,
                      bgcolor: "#dbeafe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <TrackChangesRoundedIcon
                      sx={{ color: "#2563eb", fontSize: 20 }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: 0.7,
                        fontWeight: 700,
                        mb: 0.4,
                      }}
                    >
                      Utilization Target
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1e3a8a",
                        lineHeight: 1.6,
                      }}
                    >
                      {result.utilization_target}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Summary */}
              {result.summary && (
                <Box
                  sx={{
                    p: 1.75,
                    borderRadius: 3,
                    bgcolor: "#f8fafc",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "grey.500",
                      letterSpacing: 0.8,
                      textTransform: "uppercase",
                      mb: 1,
                    }}
                  >
                    Summary
                  </Typography>
                  <Typography
                    sx={{ fontSize: 13, color: "grey.600", lineHeight: 1.75 }}
                  >
                    {result.summary}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
