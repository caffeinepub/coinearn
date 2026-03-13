import { Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SpinWheel } from "../components/SpinWheel";
import { useSpinWheel, useUserProfile } from "../hooks/useQueries";

function isToday(nanoTs?: bigint): boolean {
  if (!nanoTs) return false;
  const date = new Date(Number(nanoTs) / 1_000_000);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

export function SpinPage() {
  const { data: profile } = useUserProfile();
  const spinMutation = useSpinWheel();
  const [winCoins, setWinCoins] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const hasSpunToday = isToday(profile?.lastSpin);

  const handleSpin = async (): Promise<number> => {
    const coins = await spinMutation.mutateAsync();
    return Number(coins);
  };

  const handleWin = (coins: number) => {
    setWinCoins(coins);
    setShowModal(true);
  };

  return (
    <div className="px-4 pb-4">
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pt-2 mb-5 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-1">
          <Zap size={20} className="text-gold" />
          <h2 className="font-display font-extrabold text-2xl">Spin Wheel</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          One free spin every day!
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col items-center"
      >
        <SpinWheel
          onSpin={handleSpin}
          onWin={handleWin}
          disabled={hasSpunToday}
          isSpinning={spinMutation.isPending}
        />
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-5 rounded-2xl p-4 card-glass"
      >
        <p className="font-bold text-sm mb-3 text-center text-muted-foreground">
          Possible Prizes
        </p>
        <div className="grid grid-cols-4 gap-2">
          {[5, 10, 15, 20, 25, 30, 50, 100].map((c) => (
            <div
              key={c}
              className="text-center py-2 rounded-xl"
              style={{ background: "oklch(var(--muted))" }}
            >
              <p className="font-display font-bold text-sm text-gold">{c}</p>
              <p className="text-[10px] text-muted-foreground">coins</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Win Modal */}
      <AnimatePresence>
        {showModal && winCoins !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              maxWidth: "430px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0,0,0,0.85)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-4 p-8 rounded-3xl mx-6"
              style={{
                background:
                  "linear-gradient(135deg, oklch(28% 0.06 295), oklch(22% 0.04 270))",
                border: "1px solid oklch(var(--gold) / 0.4)",
                boxShadow: "0 24px 80px oklch(78% 0.22 50 / 0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Coin burst */}
              <div className="relative flex items-center justify-center">
                {["-80px", "80px", "0px", "-60px", "60px"].map((x, bi) => (
                  <motion.div
                    key={x}
                    initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1.2, 0.8],
                      opacity: [1, 1, 0],
                      x: x,
                      y: bi % 2 === 0 ? "-60px" : "-100px",
                    }}
                    transition={{ delay: bi * 0.08, duration: 1 }}
                    className="absolute text-2xl pointer-events-none"
                  >
                    \uD83E\uDE99
                  </motion.div>
                ))}
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-8xl"
                  style={{
                    filter: "drop-shadow(0 0 24px oklch(78% 0.22 50 / 0.8))",
                  }}
                >
                  \uD83E\uDE99
                </motion.div>
              </div>

              <div className="text-center">
                <p className="text-muted-foreground text-sm font-semibold uppercase tracking-widest">
                  You won
                </p>
                <motion.p
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="font-display font-extrabold text-6xl text-gold"
                >
                  {winCoins}
                </motion.p>
                <p className="text-gold-light font-bold text-xl">coins!</p>
              </div>

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowModal(false)}
                className="w-full py-4 rounded-2xl font-display font-bold text-lg mt-2"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(78% 0.22 50), oklch(72% 0.2 65))",
                  color: "oklch(15% 0.01 270)",
                  boxShadow: "0 4px 24px oklch(78% 0.22 50 / 0.4)",
                }}
              >
                Awesome! \uD83C\uDF89
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
