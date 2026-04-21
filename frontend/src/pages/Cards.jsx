import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";

const BANK_CARD_PRESETS = [
  {
    bank: "ICICI Bank",
    product: "Coral Credit Card",
    gradient: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
    accent: "#fdba74",
    last4: "4821",
  },
  {
    bank: "Axis Bank",
    product: "ACE Credit Card",
    gradient: "linear-gradient(135deg, #a21caf 0%, #7e22ce 100%)",
    accent: "#d8b4fe",
    last4: "7319",
  },
  {
    bank: "HDFC Bank",
    product: "Millennia Card",
    gradient: "linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)",
    accent: "#93c5fd",
    last4: "2547",
  },
];

const LIMIT_WEIGHT_SETS = [
  [0.45, 0.33, 0.22],
  [0.4, 0.35, 0.25],
  [0.38, 0.34, 0.28],
];

const UTILIZATION_VARIANTS = [
  [-0.55, 0.15],
  [-0.18, 0.42],
  [0.34, -0.28],
];

const allocateByWeights = (total, weights) => {
  const safeTotal = Math.max(0, Math.round(Number(total) || 0));
  const rawShares = weights.map((weight) => safeTotal * weight);
  const allocations = rawShares.map((share) => Math.floor(share));
  let remaining = safeTotal - allocations.reduce((sum, value) => sum + value, 0);

  rawShares
    .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction)
    .forEach(({ index }) => {
      if (remaining <= 0) return;
      allocations[index] += 1;
      remaining -= 1;
    });

  return allocations;
};

const allocateFromTargets = (total, rawTargets, caps) => {
  const safeTotal = Math.max(0, Math.round(Number(total) || 0));
  const allocations = rawTargets.map((target) => Math.floor(Math.max(target, 0)));
  let remaining = safeTotal - allocations.reduce((sum, value) => sum + value, 0);

  rawTargets
    .map((target, index) => ({
      index,
      fraction: Math.max(target, 0) - Math.floor(Math.max(target, 0)),
    }))
    .sort((a, b) => b.fraction - a.fraction)
    .forEach(({ index }) => {
      if (remaining <= 0) return;
      if ((caps[index] ?? 0) <= allocations[index]) return;
      allocations[index] += 1;
      remaining -= 1;
    });

  return allocations.map((value, index) => Math.min(value, caps[index] ?? value));
};

const Cards = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const profile = user?.user_profile;

  const totalLimit = Math.max(0, Math.round(Number(profile?.credit_limit) || 0));
  const totalBalance = Math.max(0, Math.round(Number(profile?.credit_balance) || 0));
  const overallUtilization = totalLimit > 0 ? Math.round((totalBalance / totalLimit) * 100) : 0;

  const cards = useMemo(() => {
    const seed = (totalLimit + totalBalance) % LIMIT_WEIGHT_SETS.length;
    const weights = LIMIT_WEIGHT_SETS[seed];
    const limits = allocateByWeights(totalLimit, weights);
    const overallRatio = totalLimit > 0 ? totalBalance / totalLimit : 0;
    const spread = Math.min(overallRatio, 1 - overallRatio, 0.18);
    const [firstShift, secondShift] = UTILIZATION_VARIANTS[seed];
    const weightShares = limits.map((cardLimit) => (totalLimit > 0 ? cardLimit / totalLimit : 0));
    const thirdShift =
      weightShares[2] > 0
        ? -((weightShares[0] * firstShift) + (weightShares[1] * secondShift)) / weightShares[2]
        : 0;
    const targetRatios = [firstShift, secondShift, thirdShift].map((shift) =>
      Math.min(Math.max(overallRatio + (shift * spread), 0), 1)
    );
    const rawBalances = limits.map((cardLimit, index) => cardLimit * targetRatios[index]);
    const balances = allocateFromTargets(totalBalance, rawBalances, limits);

    return BANK_CARD_PRESETS.map((preset, index) => {
      const cardLimit = limits[index] || 0;
      const cardBalance = balances[index] || 0;
      const utilization = cardLimit > 0 ? Math.round((cardBalance / cardLimit) * 100) : 0;

      return {
        ...preset,
        limit: cardLimit,
        balance: cardBalance,
        available: Math.max(cardLimit - cardBalance, 0),
        utilization,
      };
    });
  }, [totalBalance, totalLimit]);

  return (
    <div className="min-h-screen bg-slate-100 pb-28">
      <div
        className="px-5 pt-5 pb-8 text-white"
        style={{
          background: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
          borderBottomLeftRadius: "28px",
          borderBottomRightRadius: "28px",
        }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm"
        >
          <ArrowBackRoundedIcon sx={{ color: "white", fontSize: 20 }} />
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/70">Card portfolio</p>
            <h1 className="text-2xl font-bold tracking-tight">Your credit cards</h1>
            <p className="mt-2 max-w-[260px] text-sm text-white/75">
              View your balance, limit, and available credit across cards.
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 border border-white/20">
            <CreditCardRoundedIcon sx={{ color: "white", fontSize: 26 }} />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Total limit</p>
            <p className="mt-1 text-xl font-semibold">Rs. {totalLimit.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Total used</p>
            <p className="mt-1 text-xl font-semibold">Rs. {totalBalance.toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/70">Overall utilisation</span>
            <span className="font-semibold">{overallUtilization}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${Math.min(Math.max(overallUtilization, 0), 100)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
          Sample cards
        </p>

        <div className="flex flex-col gap-4">
          {cards.map((card, index) => (
            <motion.div
              key={card.bank}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.08 }}
              className="overflow-hidden rounded-[26px] bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
            >
              <div
                className="p-5 text-white"
                style={{ background: card.gradient }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{card.bank}</p>
                    <p className="mt-1 text-xs text-white/70">{card.product}</p>
                  </div>
                  <div
                    className="h-10 w-10 rounded-2xl border border-white/20"
                    style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
                  />
                </div>

                <div className="mt-10 flex items-end justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">
                      Card number
                    </p>
                    <p className="mt-1 text-lg font-semibold tracking-[0.24em]">
                      **** {card.last4}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">
                      Utilisation
                    </p>
                    <p className="mt-1 text-lg font-semibold">{card.utilization}%</p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Balance</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      Rs. {card.balance.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Limit</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      Rs. {card.limit.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                    <span>Available credit</span>
                    <span className="font-semibold text-slate-700">
                      Rs. {card.available.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(Math.max(card.utilization, 0), 100)}%`,
                        backgroundColor:
                          card.utilization <= 30
                            ? "#22c55e"
                            : card.utilization <= 50
                              ? "#eab308"
                              : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Cards;
