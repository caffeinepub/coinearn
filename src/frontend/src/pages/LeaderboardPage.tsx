import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useTopUsers } from "../hooks/useQueries";

const MEDALS: Record<number, string> = {
  1: "\uD83E\uDD47",
  2: "\uD83E\uDD48",
  3: "\uD83E\uDD49",
};

export function LeaderboardPage() {
  const { data: topUsers, isLoading } = useTopUsers();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal().toString();

  return (
    <div className="px-4 pb-4">
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pt-2 mb-4"
      >
        <div className="flex items-center gap-2 mb-1">
          <Trophy size={20} className="text-gold" />
          <h2 className="font-display font-extrabold text-2xl">Leaderboard</h2>
        </div>
        <p className="text-muted-foreground text-sm">Top earners this week</p>
      </motion.div>

      {!isLoading && topUsers && topUsers.length >= 3 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-end justify-center gap-3 mb-6"
        >
          <div className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2"
              style={{ background: "oklch(70% 0.01 270 / 0.2)" }}
            >
              \uD83E\uDD48
            </div>
            <div
              className="rounded-t-xl px-3 py-3 text-center"
              style={{
                background: "oklch(70% 0.01 270 / 0.15)",
                minWidth: 76,
                minHeight: 64,
              }}
            >
              <p className="font-display font-bold text-xs truncate max-w-[72px]">
                {topUsers[1][0].toString().slice(0, 8)}...
              </p>
              <p className="text-gold text-xs font-bold">
                {Number(topUsers[1][1].coins).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-2 coin-glow"
              style={{ background: "oklch(var(--gold) / 0.2)" }}
            >
              \uD83E\uDD47
            </div>
            <div
              className="rounded-t-xl px-3 py-3 text-center"
              style={{
                background: "oklch(var(--gold) / 0.15)",
                border: "1px solid oklch(var(--gold) / 0.3)",
                minWidth: 86,
                minHeight: 80,
              }}
            >
              <p className="font-display font-bold text-xs truncate max-w-[80px]">
                {topUsers[0][0].toString().slice(0, 8)}...
              </p>
              <p className="text-gold font-bold text-sm">
                {Number(topUsers[0][1].coins).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2"
              style={{ background: "oklch(65% 0.15 55 / 0.2)" }}
            >
              \uD83E\uDD49
            </div>
            <div
              className="rounded-t-xl px-3 py-3 text-center"
              style={{
                background: "oklch(65% 0.15 55 / 0.15)",
                minWidth: 76,
                minHeight: 56,
              }}
            >
              <p className="font-display font-bold text-xs truncate max-w-[72px]">
                {topUsers[2][0].toString().slice(0, 8)}...
              </p>
              <p className="text-gold text-xs font-bold">
                {Number(topUsers[2][1].coins).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="space-y-2">
        {isLoading
          ? ["a", "b", "c", "d", "e", "f"].map((k) => (
              <Skeleton key={k} className="h-14 w-full rounded-xl" />
            ))
          : topUsers?.map(([principal, profile], i) => {
              const rank = i + 1;
              const isMe = principal.toString() === myPrincipal;
              return (
                <motion.div
                  key={principal.toString()}
                  data-ocid={`leaderboard.item.${rank}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{
                    background: isMe
                      ? "oklch(var(--gold) / 0.12)"
                      : "oklch(var(--card))",
                    border: isMe
                      ? "1px solid oklch(var(--gold) / 0.3)"
                      : "1px solid oklch(var(--border))",
                  }}
                >
                  <span className="w-8 text-center font-display font-bold text-sm">
                    {MEDALS[rank] ?? `#${rank}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold text-sm truncate ${isMe ? "text-gold" : "text-foreground"}`}
                    >
                      {principal.toString().slice(0, 16)}...
                      {isMe && " (You)"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total: {Number(profile.totalEarned).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-display font-bold text-sm text-gold">
                      {Number(profile.coins).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">coins</span>
                  </div>
                </motion.div>
              );
            })}

        {!isLoading && (!topUsers || topUsers.length === 0) && (
          <div
            className="text-center py-12"
            data-ocid="leaderboard.empty_state"
          >
            <p className="text-4xl mb-3">\uD83C\uDFC6</p>
            <p className="font-display font-bold text-foreground">
              No rankings yet
            </p>
            <p className="text-muted-foreground text-sm">
              Be the first to earn coins!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
