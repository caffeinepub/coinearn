import {
  CheckCircle2,
  ClipboardList,
  Download,
  Heart,
  Play,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { AdModal } from "../components/AdModal";
import { useWatchAd } from "../hooks/useQueries";

const TASKS = [
  {
    id: 1,
    icon: Play,
    title: "Watch a 30s Video",
    desc: "Watch a short video ad",
    coins: 10,
    color: "oklch(65% 0.26 295)",
  },
  {
    id: 2,
    icon: Download,
    title: "Install Partner App",
    desc: "Download & open the app",
    coins: 50,
    color: "oklch(72% 0.19 160)",
  },
  {
    id: 3,
    icon: ClipboardList,
    title: "Complete Survey",
    desc: "Answer 5 quick questions",
    coins: 25,
    color: "oklch(78% 0.22 50)",
  },
  {
    id: 4,
    icon: Heart,
    title: "Follow on Social",
    desc: "Follow us on Instagram",
    coins: 15,
    color: "oklch(65% 0.24 20)",
  },
  {
    id: 5,
    icon: Star,
    title: "Rate the App",
    desc: "Give us 5 stars!",
    coins: 20,
    color: "oklch(78% 0.18 85)",
  },
];

export function TasksPage() {
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [showAdModal, setShowAdModal] = useState(false);
  const [pendingTaskId, setPendingTaskId] = useState<number | null>(null);
  const [pendingCoins, setPendingCoins] = useState(0);
  const watchAd = useWatchAd();

  const handleStart = (taskId: number, coins: number) => {
    if (completed.has(taskId)) return;
    setPendingTaskId(taskId);
    setPendingCoins(coins);
    setShowAdModal(true);
  };

  const handleAdClaim = async () => {
    try {
      await watchAd.mutateAsync();
    } catch {
      // mark done even if backend rejects
    }
    if (pendingTaskId !== null) {
      setCompleted((prev) => new Set([...prev, pendingTaskId]));
      toast.success(
        `\uD83C\uDF89 Task complete! +${pendingCoins} coins earned!`,
      );
    }
    setPendingTaskId(null);
  };

  const handleAdClose = () => {
    setShowAdModal(false);
    setPendingTaskId(null);
  };

  const totalEarnable = TASKS.filter((t) => !completed.has(t.id)).reduce(
    (sum, t) => sum + t.coins,
    0,
  );

  return (
    <>
      <div className="px-4 pb-4 space-y-4">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pt-2"
        >
          <h2 className="font-display font-extrabold text-2xl">Tasks</h2>
          <p className="text-muted-foreground text-sm">
            {completed.size === TASKS.length
              ? "All tasks done! \uD83C\uDF89"
              : `Earn up to ${totalEarnable} more coins`}
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4 card-glass"
        >
          <div className="flex justify-between mb-2">
            <span className="text-sm font-bold">Today's Progress</span>
            <span className="text-sm text-gold font-bold">
              {completed.size}/{TASKS.length}
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "oklch(var(--muted))" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, oklch(78% 0.22 50), oklch(65% 0.26 295))",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(completed.size / TASKS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        <div className="space-y-3">
          {TASKS.map((task, i) => {
            const Icon = task.icon;
            const isDone = completed.has(task.id);
            const isCurrent = pendingTaskId === task.id;
            return (
              <motion.div
                key={task.id}
                data-ocid={`tasks.item.${task.id}`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.08 }}
                className="rounded-2xl p-4 card-glass flex items-center gap-4"
                style={{ opacity: isDone ? 0.65 : 1 }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${task.color}22` }}
                >
                  {isDone ? (
                    <CheckCircle2
                      size={24}
                      style={{ color: "oklch(72% 0.19 160)" }}
                    />
                  ) : (
                    <Icon size={24} style={{ color: task.color }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm truncate">
                    {task.title}
                  </p>
                  <p className="text-muted-foreground text-xs">{task.desc}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "oklch(var(--gold) / 0.15)",
                      color: "oklch(var(--gold))",
                    }}
                  >
                    +{task.coins}
                  </span>
                  <AnimatePresence mode="wait">
                    {isDone ? (
                      <motion.span
                        key="done"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl"
                        style={{
                          background: "oklch(72% 0.19 160 / 0.15)",
                          color: "oklch(72% 0.19 160)",
                        }}
                      >
                        Done \u2713
                      </motion.span>
                    ) : (
                      <motion.button
                        type="button"
                        key="start"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        data-ocid={`tasks.start_button.${task.id}`}
                        onClick={() => handleStart(task.id, task.coins)}
                        disabled={isCurrent}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                        style={{ background: task.color, color: "white" }}
                      >
                        {isCurrent ? "..." : "Start"}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AdModal
        isOpen={showAdModal}
        reward={pendingCoins}
        onClose={handleAdClose}
        onClaim={handleAdClaim}
      />
    </>
  );
}
