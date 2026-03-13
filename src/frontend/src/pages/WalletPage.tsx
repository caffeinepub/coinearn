import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownLeft,
  Calendar,
  CheckCircle,
  Coins,
  Dices,
  Tv2,
  Users,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Transaction } from "../backend.d";
import { TransactionType } from "../backend.d";
import {
  useSubmitWithdrawal,
  useUserProfile,
  useUserTransactions,
} from "../hooks/useQueries";

interface TxMeta {
  icon: React.ReactNode;
  label: string;
  color: string;
}

function getTxMeta(type: string): TxMeta {
  switch (type) {
    case TransactionType.checkIn:
      return {
        icon: <Calendar size={18} />,
        label: "Daily Check-in",
        color: "oklch(78% 0.22 50)",
      };
    case TransactionType.adWatch:
      return {
        icon: <Tv2 size={18} />,
        label: "Watched Ad",
        color: "oklch(65% 0.26 295)",
      };
    case TransactionType.spin:
      return {
        icon: <Dices size={18} />,
        label: "Spin Wheel",
        color: "oklch(72% 0.19 160)",
      };
    case TransactionType.taskCompletion:
      return {
        icon: <CheckCircle size={18} />,
        label: "Task Completed",
        color: "oklch(72% 0.19 160)",
      };
    case TransactionType.referralBonus:
      return {
        icon: <Users size={18} />,
        label: "Referral Bonus",
        color: "oklch(78% 0.22 50)",
      };
    default:
      return {
        icon: <Coins size={18} />,
        label: "Earning",
        color: "oklch(var(--gold))",
      };
  }
}

function TxItem({ tx, index }: { tx: Transaction; index: number }) {
  const meta = getTxMeta(tx.transactionType);
  return (
    <motion.div
      data-ocid={`wallet.transaction.item.${index}`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.05 + index * 0.04 }}
      className="flex items-center gap-3 rounded-xl p-3 card-glass"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${meta.color}20`, color: meta.color }}
      >
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{meta.label}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(Number(tx.timestamp) / 1_000_000).toLocaleDateString(
            undefined,
            {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            },
          )}
        </p>
      </div>
      <span className="font-display font-bold text-gold">
        +{Number(tx.amount)}
      </span>
    </motion.div>
  );
}

export function WalletPage() {
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: transactions, isLoading: txLoading } = useUserTransactions();
  const withdrawMutation = useSubmitWithdrawal();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [payId, setPayId] = useState("");
  const [success, setSuccess] = useState(false);

  const coins = Number(profile?.coins ?? 0);
  const minWithdraw = 500;
  const amountNum = Number(amount);
  const canWithdraw =
    amountNum >= minWithdraw &&
    amountNum <= coins &&
    !!method &&
    !!payId.trim();

  const handleWithdraw = async () => {
    if (!canWithdraw) return;
    try {
      await withdrawMutation.mutateAsync({
        amount: BigInt(amountNum),
        method: `${method}:${payId}`,
      });
      setSuccess(true);
      setAmount("");
      setPayId("");
      toast.success("Withdrawal request submitted!");
    } catch {
      toast.error("Failed to submit withdrawal. Try again.");
    }
  };

  return (
    <div className="px-4 pb-4 space-y-4">
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pt-2"
      >
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={20} className="text-gold" />
          <h2 className="font-display font-extrabold text-2xl">Wallet</h2>
        </div>
        <p className="text-muted-foreground text-sm">Manage your earnings</p>
      </motion.div>

      {/* Balance card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-6"
        style={{
          background:
            "linear-gradient(135deg, oklch(30% 0.06 50), oklch(22% 0.04 50))",
          border: "1px solid oklch(var(--gold) / 0.3)",
        }}
      >
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Balance
        </p>
        {profileLoading ? (
          <Skeleton className="h-12 w-40" data-ocid="wallet.loading_state" />
        ) : (
          <>
            <div className="flex items-end gap-2">
              <span className="font-display font-extrabold text-5xl text-gold">
                {coins.toLocaleString()}
              </span>
              <span className="text-gold-light font-semibold mb-1">coins</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              \u2248 \u20b9{(coins / 10).toFixed(2)} \u00b7 500 coins = \u20b950
            </p>
          </>
        )}
      </motion.div>

      {/* Withdraw form */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl p-4 card-glass space-y-3"
      >
        <div className="flex items-center gap-2">
          <ArrowDownLeft size={18} className="text-gold" />
          <p className="font-display font-bold">Withdraw Coins</p>
        </div>
        <p className="text-xs text-muted-foreground">
          Minimum {minWithdraw} coins (\u2248 \u20b9{minWithdraw / 10})
        </p>

        {success && (
          <div
            data-ocid="wallet.success_state"
            className="flex items-center gap-2 rounded-xl p-3"
            style={{ background: "oklch(72% 0.19 160 / 0.15)" }}
          >
            <CheckCircle size={16} style={{ color: "oklch(72% 0.19 160)" }} />
            <p
              className="text-sm font-semibold"
              style={{ color: "oklch(72% 0.19 160)" }}
            >
              Withdrawal request submitted!
            </p>
          </div>
        )}

        <Input
          data-ocid="wallet.withdraw_input"
          type="number"
          placeholder={`Amount (min ${minWithdraw})`}
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setSuccess(false);
          }}
          className="bg-muted border-border"
        />
        {amountNum > 0 && amountNum < minWithdraw && (
          <p
            className="text-xs"
            style={{ color: "oklch(65% 0.22 25)" }}
            data-ocid="wallet.error_state"
          >
            Minimum withdrawal is {minWithdraw} coins
          </p>
        )}
        {amountNum > coins && (
          <p className="text-xs" style={{ color: "oklch(65% 0.22 25)" }}>
            Insufficient balance
          </p>
        )}

        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger
            data-ocid="wallet.method_select"
            className="bg-muted border-border"
          >
            <SelectValue placeholder="Payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="paytm">Paytm</SelectItem>
          </SelectContent>
        </Select>

        <Input
          data-ocid="wallet.upi_input"
          placeholder={
            method === "paytm" ? "Paytm number" : "UPI ID (e.g. name@upi)"
          }
          value={payId}
          onChange={(e) => setPayId(e.target.value)}
          className="bg-muted border-border"
        />

        <button
          type="button"
          data-ocid="wallet.submit_button"
          onClick={handleWithdraw}
          disabled={!canWithdraw || withdrawMutation.isPending}
          className="w-full py-3.5 rounded-xl font-display font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canWithdraw
              ? "linear-gradient(135deg, oklch(78% 0.22 50), oklch(72% 0.2 65))"
              : "oklch(var(--muted))",
            color: canWithdraw ? "oklch(15% 0.01 270)" : "oklch(55% 0.04 270)",
          }}
        >
          {withdrawMutation.isPending ? "Submitting..." : "Request Withdrawal"}
        </button>
      </motion.div>

      {/* Transaction history */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-2"
        data-ocid="wallet.transaction_list"
      >
        <p className="font-display font-bold text-sm px-1">
          Transaction History
        </p>

        {txLoading ? (
          ["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className="h-14 w-full rounded-xl" />
          ))
        ) : transactions && transactions.length > 0 ? (
          transactions
            .slice(0, 20)
            .map((tx, i) => <TxItem key={tx.id} tx={tx} index={i + 1} />)
        ) : (
          <div
            className="text-center py-8 rounded-xl card-glass"
            data-ocid="wallet.empty_state"
          >
            <Coins size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="font-display font-bold text-foreground">
              No transactions yet
            </p>
            <p className="text-muted-foreground text-sm">
              Start earning coins!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
