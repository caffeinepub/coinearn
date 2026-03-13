import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

interface AdModalProps {
  isOpen: boolean;
  reward: number;
  onClose: () => void;
  onClaim: () => Promise<void>;
}

const AD_DURATION = 15;

export function AdModal({ isOpen, reward, onClose, onClaim }: AdModalProps) {
  const [countdown, setCountdown] = useState(AD_DURATION);
  const [canSkip, setCanSkip] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(AD_DURATION);
      setCanSkip(false);
      setCanClaim(false);
      setClaimed(false);
      setClaiming(false);
      return;
    }
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next <= AD_DURATION - 5) setCanSkip(true);
        if (next <= 0) {
          setCanClaim(true);
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleClaim = async () => {
    if (!canClaim || claiming) return;
    setClaiming(true);
    try {
      await onClaim();
      setClaimed(true);
      setTimeout(() => {
        onClose();
      }, 1400);
    } catch {
      setClaiming(false);
    }
  };

  const progress = countdown / AD_DURATION;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-ocid="ads.modal"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{
            maxWidth: "430px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "oklch(12% 0.015 270)",
          }}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md"
              style={{
                background: "oklch(65% 0.26 295 / 0.2)",
                color: "oklch(65% 0.26 295)",
              }}
            >
              Sponsored
            </span>
            <div className="flex items-center gap-3">
              {!canClaim && (
                <span className="font-display font-extrabold text-xl text-gold">
                  {countdown}s
                </span>
              )}
              {canSkip && !canClaim && (
                <button
                  type="button"
                  data-ocid="ads.skip_button"
                  onClick={onClose}
                  className="text-xs text-muted-foreground underline underline-offset-2"
                >
                  Skip Ad
                </button>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {!canClaim && (
            <div className="h-1" style={{ background: "oklch(var(--muted))" }}>
              <motion.div
                className="h-full"
                style={{
                  background:
                    "linear-gradient(90deg, oklch(78% 0.22 50), oklch(65% 0.26 295))",
                }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            </div>
          )}

          {/* Ad content */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
            {/* Fake ad banner */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="w-full rounded-3xl overflow-hidden relative"
              style={{ height: 220 }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(50% 0.28 295) 0%, oklch(60% 0.28 10) 50%, oklch(65% 0.25 50) 100%)",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-1"
                  style={{ background: "rgba(255,255,255,0.2)" }}
                >
                  \uD83C\uDFAE
                </div>
                <p className="font-display font-extrabold text-2xl text-white">
                  GameZone Pro
                </p>
                <p className="text-white/70 text-sm text-center">
                  Play games &amp; win real cash rewards!
                </p>
                <div
                  className="mt-1 px-6 py-2 rounded-full font-bold text-sm"
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    color: "white",
                  }}
                >
                  Download Free \u2192
                </div>
              </div>
            </motion.div>

            {/* Reward info */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-1">
                Watch ad to earn
              </p>
              <p className="font-display font-extrabold text-5xl text-gold">
                +{reward}
              </p>
              <p className="text-gold-light text-sm font-semibold">coins</p>
            </div>
          </div>

          {/* Action area */}
          <div className="p-5">
            <AnimatePresence mode="wait">
              {claimed ? (
                <motion.div
                  key="claimed"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full py-4 rounded-2xl text-center font-display font-bold text-xl"
                  style={{
                    background: "oklch(72% 0.19 160 / 0.2)",
                    color: "oklch(72% 0.19 160)",
                    border: "1px solid oklch(72% 0.19 160 / 0.3)",
                  }}
                >
                  \uD83C\uDF89 +{reward} Coins Earned!
                </motion.div>
              ) : canClaim ? (
                <motion.button
                  key="claim"
                  type="button"
                  data-ocid="ads.claim_button"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full py-4 rounded-2xl font-display font-bold text-xl transition-all disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(78% 0.22 50), oklch(72% 0.2 65))",
                    color: "oklch(15% 0.01 270)",
                    boxShadow: "0 4px 24px oklch(78% 0.22 50 / 0.5)",
                  }}
                >
                  {claiming
                    ? "Claiming..."
                    : `\uD83D\uDCB0 Claim +${reward} Coins!`}
                </motion.button>
              ) : (
                <button
                  key="watching"
                  type="button"
                  data-ocid="ads.watch_button"
                  disabled
                  className="w-full py-4 rounded-2xl font-display font-bold text-base opacity-40 cursor-not-allowed"
                  style={{
                    background: "oklch(var(--muted))",
                    color: "oklch(var(--muted-foreground))",
                  }}
                >
                  Watching ad\u2026 {countdown}s remaining
                </button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
