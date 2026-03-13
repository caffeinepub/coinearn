import { CheckSquare, Home, Trophy, Wallet, Zap } from "lucide-react";
import { motion } from "motion/react";

export type TabName = "home" | "tasks" | "spin" | "leaderboard" | "wallet";

const tabs: {
  id: TabName;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "spin", label: "Spin", icon: Zap },
  { id: "leaderboard", label: "Ranks", icon: Trophy },
  { id: "wallet", label: "Wallet", icon: Wallet },
];

interface BottomNavProps {
  active: TabName;
  onChange: (tab: TabName) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur-lg border-t border-border z-50 bottom-nav">
      <div className="flex items-center justify-around px-2 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              type="button"
              key={tab.id}
              data-ocid={`nav.${tab.id}_tab`}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{ background: "oklch(var(--gold) / 0.12)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <Icon
                size={22}
                className={
                  isActive
                    ? "text-gold relative z-10"
                    : "text-muted-foreground relative z-10"
                }
              />
              <span
                className={`text-[10px] font-semibold relative z-10 ${isActive ? "text-gold" : "text-muted-foreground"}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
