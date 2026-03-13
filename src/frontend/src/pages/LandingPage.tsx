import { Coins, Gift, Users, Zap } from "lucide-react";
import { motion } from "motion/react";
import { LoginButton } from "../components/LoginButton";

export function LandingPage() {
  const features = [
    {
      icon: Coins,
      title: "Daily Rewards",
      desc: "Check in every day to earn coins",
    },
    { icon: Zap, title: "Spin & Win", desc: "Spin the wheel for big prizes" },
    {
      icon: Users,
      title: "Refer Friends",
      desc: "Earn bonus coins for every referral",
    },
    { icon: Gift, title: "Cash Out", desc: "Withdraw via UPI or Paytm" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start overflow-y-auto"
      style={{
        background:
          "linear-gradient(160deg, oklch(20% 0.04 295) 0%, oklch(16% 0.02 270) 40%, oklch(20% 0.04 50) 100%)",
      }}
    >
      <div className="flex flex-col items-center pt-16 pb-8 px-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="mb-6 float-anim"
        >
          <img
            src="/assets/generated/coin-logo-transparent.dim_200x200.png"
            alt="CoinEarn logo - a shiny gold coin"
            className="w-28 h-28 coin-glow"
          />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-display font-extrabold text-5xl mb-3"
        >
          <span className="text-gold">Coin</span>
          <span className="text-foreground">Earn</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-lg mb-2"
        >
          Earn coins. Withdraw cash.
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-sm mb-10 max-w-xs"
        >
          Complete tasks, spin the wheel, and refer friends to earn real money.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          data-ocid="auth.login_button"
          className="w-full max-w-xs"
        >
          <LoginButton className="w-full py-4 rounded-2xl font-display font-bold text-lg relative overflow-hidden shine-effect pulse-gold" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-muted-foreground text-xs mt-4"
        >
          Secure login \u00b7 No password needed
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full px-6 pb-12 grid grid-cols-2 gap-3"
      >
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <motion.div
              key={f.title}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="card-glass rounded-2xl p-4 flex flex-col gap-2"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(var(--gold) / 0.15)" }}
              >
                <Icon size={20} className="text-gold" />
              </div>
              <p className="font-display font-bold text-sm text-foreground">
                {f.title}
              </p>
              <p className="text-xs text-muted-foreground">{f.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="w-full px-6 pb-16"
      >
        <div
          className="rounded-2xl p-4 flex justify-around"
          style={{
            background: "oklch(var(--gold) / 0.1)",
            border: "1px solid oklch(var(--gold) / 0.2)",
          }}
        >
          <div className="text-center">
            <p className="font-display font-extrabold text-2xl text-gold">
              50K+
            </p>
            <p className="text-xs text-muted-foreground">Users</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="font-display font-extrabold text-2xl text-gold">
              \u20b92M+
            </p>
            <p className="text-xs text-muted-foreground">Paid Out</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="font-display font-extrabold text-2xl text-gold">
              4.8\u2605
            </p>
            <p className="text-xs text-muted-foreground">Rating</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
