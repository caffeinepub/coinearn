import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Check,
  Copy,
  PlayCircle,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AdModal } from "../components/AdModal";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDailyCheckIn,
  useUserProfile,
  useWatchAd,
} from "../hooks/useQueries";

// Streak day rewards: Day 1-7
const STREAK_REWARDS = [10, 15, 20, 25, 35, 50, 100];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Fixed confetti positions for celebration
const CONFETTI = [
  { emoji: "\uD83E\uDE99", dx: -70, dy: -160 },
  { emoji: "\u2B50", dx: 50, dy: -200 },
  { emoji: "\u2728", dx: -130, dy: -140 },
  { emoji: "\uD83C\uDF89", dx: 110, dy: -180 },
  { emoji: "\uD83D\uDCAB", dx: 10, dy: -230 },
  { emoji: "\uD83E\uDE99", dx: -50, dy: -220 },
  { emoji: "\u2B50", dx: 80, dy: -150 },
  { emoji: "\uD83C\uDF89", dx: -100, dy: -190 },
];

function isToday(nanoTs?: bigint): boolean {
  if (!nanoTs) return false;
  const d = new Date(Number(nanoTs) / 1_000_000);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

function isYesterday(nanoTs?: bigint): boolean {
  if (!nanoTs) return false;
  const d = new Date(Number(nanoTs) / 1_000_000);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
}

export function HomePage() {
  const { identity } = useInternetIdentity();
  const { data: profile, isLoading } = useUserProfile();
  const checkIn = useDailyCheckIn();
  const watchAd = useWatchAd();
  const [copied, setCopied] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showCoinFloat, setShowCoinFloat] = useState(false);

  // Referral from URL
  const refFromUrl = new URLSearchParams(window.location.search).get("ref");

  const principalStr = identity?.getPrincipal().toString() ?? "";
  const shortPrincipal = principalStr ? `${principalStr.slice(0, 12)}...` : "";
  const checkedInToday = isToday(profile?.lastCheckIn);
  const adsWatched = Number(profile?.adsWatchedToday ?? 0);
  const maxAds = 5;

  // Streak logic
  const streakDays = Number(profile?.checkInStreak ?? 0);
  const streakActive = checkedInToday || isYesterday(profile?.lastCheckIn);
  const currentDayInCycle = streakActive ? ((streakDays - 1) % 7) + 1 : 0;
  // dayOfWeek shown: 1-7, day is "done" if its index < currentDayInCycle (or == and checkedInToday)
  const todayDayIndex = checkedInToday
    ? currentDayInCycle
    : currentDayInCycle + 1; // what day we can check in
  const tomorrowReward = STREAK_REWARDS[Math.min(todayDayIndex, 6)];
  const todayReward =
    STREAK_REWARDS[
      Math.max(
        0,
        Math.min((checkedInToday ? currentDayInCycle : todayDayIndex) - 1, 6),
      )
    ];

  const handleCheckIn = async () => {
    try {
      const coins = await checkIn.mutateAsync();
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2200);
      toast.success(
        `\uD83C\uDF89 Day ${streakDays + (checkedInToday ? 0 : 1)} check-in! +${Number(coins)} coins!`,
      );
    } catch {
      toast.error("Already checked in today or an error occurred");
    }
  };

  const handleAdClaim = async () => {
    await watchAd.mutateAsync();
    setShowCoinFloat(true);
    setTimeout(() => setShowCoinFloat(false), 2000);
    toast.success("\uD83D\uDCFA +5 coins earned!");
  };

  const handleCopyReferral = () => {
    if (!profile?.referralCode) return;
    const url = `https://coinearn.app/ref/${profile.referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareReferral = () => {
    if (!profile?.referralCode) return;
    const url = `https://coinearn.app/ref/${profile.referralCode}`;
    const text = `Join CoinEarn and earn real money! Use my referral link to get 50 bonus coins: ${url}`;
    if (navigator.share) {
      navigator.share({ title: "CoinEarn Referral", text, url }).catch(() => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Referral message copied!");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4" data-ocid="home.loading_state">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pb-4 space-y-4 relative">
        {/* Celebration confetti */}
        <AnimatePresence>
          {showCelebration && (
            <div
              className="fixed inset-0 pointer-events-none z-40"
              style={{
                maxWidth: "430px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              {CONFETTI.map((c, ci) => (
                <motion.div
                  key={`${c.emoji}-${c.dx}`}
                  initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                  animate={{ opacity: 0, scale: 0.5, x: c.dx, y: c.dy }}
                  transition={{ duration: 1.8, delay: ci * 0.06 }}
                  className="absolute text-3xl"
                  style={{ top: "40%", left: "50%" }}
                >
                  {c.emoji}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Referral welcome banner */}
        {refFromUrl && (
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-2xl p-3 flex items-center gap-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(65% 0.26 295 / 0.2), oklch(78% 0.22 50 / 0.15))",
              border: "1px solid oklch(var(--gold) / 0.3)",
            }}
          >
            <span className="text-2xl">\uD83C\uDF81</span>
            <div>
              <p className="font-display font-bold text-sm text-gold">
                Referral Bonus Active!
              </p>
              <p className="text-xs text-muted-foreground">
                You'll receive +50 bonus coins on signup
              </p>
            </div>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pt-2"
        >
          <p className="text-muted-foreground text-sm">
            Welcome back \uD83D\uDC4B
          </p>
          <p className="font-display font-bold text-foreground truncate">
            {shortPrincipal}
          </p>
        </motion.div>

        {/* Balance card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl p-5"
          style={{
            background:
              "linear-gradient(135deg, oklch(30% 0.08 295), oklch(22% 0.05 270))",
            border: "1px solid oklch(var(--purple) / 0.3)",
            boxShadow: "0 8px 32px oklch(65% 0.26 295 / 0.2)",
          }}
        >
          <div
            className="absolute top-0 right-0 w-36 h-36 rounded-full"
            style={{
              background: "oklch(65% 0.26 295 / 0.08)",
              transform: "translate(30%, -30%)",
            }}
          />
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-1">
            Total Balance
          </p>
          <div className="flex items-end gap-2">
            <span className="font-display font-extrabold text-5xl text-gold">
              {Number(profile?.coins ?? 0).toLocaleString()}
            </span>
            <span className="text-gold-light font-semibold mb-1">coins</span>
          </div>
          <p className="text-muted-foreground text-xs mt-1">
            \u2248 \u20b9{(Number(profile?.coins ?? 0) / 10).toFixed(2)}
          </p>
          <div className="flex gap-6 mt-3">
            <div>
              <p className="text-muted-foreground text-xs">Total Earned</p>
              <p className="font-bold text-foreground text-sm">
                {Number(profile?.totalEarned ?? 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Streak</p>
              <p className="font-bold text-foreground text-sm">
                \uD83D\uDD25 {streakDays} days
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Day</p>
              <p className="font-bold text-gold text-sm">
                Day{" "}
                {checkedInToday
                  ? currentDayInCycle
                  : Math.min(currentDayInCycle + 1, 7)}{" "}
                / 7
              </p>
            </div>
          </div>
        </motion.div>

        {/* 7-Day Streak Calendar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-4 card-glass"
          data-ocid="home.streak_calendar"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gold" />
              <p className="font-display font-bold text-sm">Weekly Streak</p>
            </div>
            <span
              className="text-xs font-bold px-2 py-1 rounded-lg"
              style={{
                background: checkedInToday
                  ? "oklch(72% 0.19 160 / 0.2)"
                  : "oklch(var(--gold) / 0.15)",
                color: checkedInToday
                  ? "oklch(72% 0.19 160)"
                  : "oklch(var(--gold))",
              }}
            >
              {checkedInToday
                ? `Day ${currentDayInCycle} \u2713`
                : `Day ${Math.min(currentDayInCycle + 1, 7)} Bonus: +${tomorrowReward}`}
            </span>
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {STREAK_REWARDS.map((reward, i) => {
              const dayNum = i + 1;
              const isDone = streakActive && dayNum < currentDayInCycle;
              const isCurrentDone =
                checkedInToday && dayNum === currentDayInCycle;
              const isToday_ =
                !checkedInToday && dayNum === currentDayInCycle + 1;
              const isFuture =
                dayNum >
                (checkedInToday ? currentDayInCycle : currentDayInCycle + 1);
              return (
                <div
                  key={`day-${dayNum}`}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div
                    className="w-full aspect-square rounded-xl flex items-center justify-center text-sm relative"
                    style={{
                      background:
                        isDone || isCurrentDone
                          ? "linear-gradient(135deg, oklch(78% 0.22 50), oklch(72% 0.2 65))"
                          : isToday_
                            ? "oklch(var(--gold) / 0.2)"
                            : "oklch(var(--muted))",
                      border: isToday_
                        ? "1.5px solid oklch(var(--gold) / 0.6)"
                        : "1px solid transparent",
                    }}
                  >
                    {isDone || isCurrentDone ? (
                      <span style={{ fontSize: 14 }}>\u2713</span>
                    ) : (
                      <span
                        className="font-display font-bold text-xs"
                        style={{
                          color: isToday_
                            ? "oklch(var(--gold))"
                            : "oklch(55% 0.04 270)",
                        }}
                      >
                        {dayNum}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[9px] font-bold"
                    style={{
                      color:
                        isDone || isCurrentDone
                          ? "oklch(var(--gold))"
                          : isToday_
                            ? "oklch(var(--gold) / 0.8)"
                            : isFuture
                              ? "oklch(40% 0.03 270)"
                              : "oklch(55% 0.04 270)",
                    }}
                  >
                    {reward}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {DAY_LABELS.map((d) => (
              <p
                key={d}
                className="text-center text-[9px] text-muted-foreground"
              >
                {d}
              </p>
            ))}
          </div>

          {/* Check-in button */}
          <button
            type="button"
            data-ocid="home.checkin_button"
            onClick={handleCheckIn}
            disabled={checkedInToday || checkIn.isPending}
            className="w-full py-3 rounded-xl font-display font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: checkedInToday
                ? "oklch(25% 0.03 270)"
                : "linear-gradient(135deg, oklch(78% 0.22 50), oklch(72% 0.2 65))",
              color: checkedInToday
                ? "oklch(55% 0.04 270)"
                : "oklch(15% 0.01 270)",
            }}
          >
            {checkedInToday
              ? `\u2705 Claimed! +${todayReward} coins`
              : checkIn.isPending
                ? "Claiming..."
                : `\uD83D\uDD25 Claim Day ${Math.min(currentDayInCycle + 1, 7)} (+${tomorrowReward} coins)`}
          </button>
        </motion.div>

        {/* Watch Ads */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 card-glass relative"
        >
          {/* Floating coin animation */}
          <AnimatePresence>
            {showCoinFloat && (
              <motion.div
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{ opacity: 0, y: -60, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute right-14 top-2 font-display font-extrabold text-gold z-10 pointer-events-none"
                style={{ textShadow: "0 0 12px oklch(78% 0.22 50 / 0.8)" }}
              >
                +5 \uD83E\uDE99
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(65% 0.26 295 / 0.15)" }}
              >
                <PlayCircle size={22} className="text-purple" />
              </div>
              <div>
                <p className="font-display font-bold text-sm">Watch Ads</p>
                <p className="text-muted-foreground text-xs">
                  {adsWatched}/{maxAds} today \u00b7 +5 coins each
                </p>
              </div>
            </div>
            <button
              type="button"
              data-ocid="home.watch_ad_button"
              onClick={() => setShowAdModal(true)}
              disabled={adsWatched >= maxAds}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background:
                  adsWatched >= maxAds
                    ? "oklch(25% 0.03 270)"
                    : "oklch(65% 0.26 295)",
                color: adsWatched >= maxAds ? "oklch(55% 0.04 270)" : "white",
              }}
            >
              {adsWatched >= maxAds ? "Limit" : "Watch"}
            </button>
          </div>
          <div className="flex gap-1">
            {["d0", "d1", "d2", "d3", "d4"].map((k, i) => (
              <div
                key={k}
                className="flex-1 h-2 rounded-full transition-all"
                style={{
                  background:
                    i < adsWatched
                      ? "oklch(65% 0.26 295)"
                      : "oklch(var(--muted))",
                }}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {adsWatched >= maxAds
              ? "\u2705 All ads watched for today!"
              : `${maxAds - adsWatched} more ads available`}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="rounded-2xl p-4 card-glass">
            <TrendingUp size={18} className="text-gold mb-2" />
            <p className="font-display font-bold text-xl text-foreground">
              {Number(profile?.totalEarned ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Total Earned</p>
          </div>
          <div className="rounded-2xl p-4 card-glass">
            <Users size={18} className="text-purple mb-2" />
            <p className="font-display font-bold text-xl text-foreground">
              +50
            </p>
            <p className="text-xs text-muted-foreground">Coins per referral</p>
          </div>
        </motion.div>

        {/* Referral card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-4"
          style={{
            background: "oklch(var(--gold) / 0.07)",
            border: "1px solid oklch(var(--gold) / 0.25)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-gold" />
              <p className="font-display font-bold text-sm text-gold">
                Referral Program
              </p>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-1 rounded-full"
              style={{
                background: "oklch(var(--gold) / 0.2)",
                color: "oklch(var(--gold))",
              }}
            >
              +50 each way
            </span>
          </div>

          {/* Code display */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex-1 rounded-xl px-3 py-2.5 font-mono font-bold text-gold text-sm tracking-widest"
              style={{ background: "oklch(var(--gold) / 0.1)" }}
            >
              {profile?.referralCode ?? "Loading..."}
            </div>
            <button
              type="button"
              data-ocid="home.copy_referral_button"
              onClick={handleCopyReferral}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ background: "oklch(var(--gold) / 0.15)" }}
            >
              {copied ? (
                <Check size={16} className="text-gold" />
              ) : (
                <Copy size={16} className="text-gold" />
              )}
            </button>
          </div>

          {/* Share link */}
          <p className="text-xs text-muted-foreground mb-3">
            Share:{" "}
            <span className="text-gold font-mono text-[11px]">
              coinearn.app/ref/{profile?.referralCode}
            </span>
          </p>

          <button
            type="button"
            data-ocid="home.share_referral_button"
            onClick={handleShareReferral}
            className="w-full py-3 rounded-xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background:
                "linear-gradient(135deg, oklch(78% 0.22 50), oklch(72% 0.2 65))",
              color: "oklch(15% 0.01 270)",
              boxShadow: "0 3px 16px oklch(78% 0.22 50 / 0.35)",
            }}
          >
            <Share2 size={16} />
            Share &amp; Earn 50 Coins
          </button>
        </motion.div>

        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-xs text-muted-foreground">
            \u00a9 {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Built with \u2665 using caffeine.ai
            </a>
          </p>
        </footer>
        <div className="h-4" />
      </div>

      {/* Ad Modal */}
      <AdModal
        isOpen={showAdModal}
        reward={5}
        onClose={() => setShowAdModal(false)}
        onClaim={handleAdClaim}
      />
    </>
  );
}
