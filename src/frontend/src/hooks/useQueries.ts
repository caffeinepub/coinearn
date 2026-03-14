import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile } from "../declarations/backend.did";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTopUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["topUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopUsers(20n);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserTransactions() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserTransactions(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

function applyCoins(
  old: UserProfile | null | undefined,
  earned: bigint,
): UserProfile | null {
  if (!old) return null;
  return {
    ...old,
    coins: old.coins + earned,
    totalEarned: old.totalEarned + earned,
  };
}

export function useDailyCheckIn() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.dailyCheckIn();
    },
    onSuccess: (earned) => {
      qc.setQueryData(
        ["userProfile"],
        (old: UserProfile | null | undefined) => {
          const updated = applyCoins(old, earned);
          if (!updated) return old;
          return {
            ...updated,
            checkInStreak: (old?.checkInStreak ?? 0n) + 1n,
            lastCheckIn: [BigInt(Date.now()) * 1_000_000n] as [bigint],
          };
        },
      );
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["userProfile"] });
        qc.invalidateQueries({ queryKey: ["transactions"] });
      }, 2000);
    },
  });
}

export function useWatchAd() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.watchAd();
    },
    onSuccess: (earned) => {
      qc.setQueryData(
        ["userProfile"],
        (old: UserProfile | null | undefined) => {
          const updated = applyCoins(old, earned);
          if (!updated) return old;
          return {
            ...updated,
            adsWatchedToday: (old?.adsWatchedToday ?? 0n) + 1n,
          };
        },
      );
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["userProfile"] });
        qc.invalidateQueries({ queryKey: ["transactions"] });
      }, 2000);
    },
  });
}

export function useSpinWheel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.spinWheel();
    },
    onSuccess: (earned) => {
      qc.setQueryData(
        ["userProfile"],
        (old: UserProfile | null | undefined) => {
          const updated = applyCoins(old, earned);
          if (!updated) return old;
          return {
            ...updated,
            lastSpin: [BigInt(Date.now()) * 1_000_000n] as [bigint],
          };
        },
      );
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["userProfile"] });
        qc.invalidateQueries({ queryKey: ["transactions"] });
      }, 2000);
    },
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (referralCode: string | null) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerUser(referralCode);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}

export function useSubmitWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      method,
    }: { amount: bigint; method: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitWithdrawalRequest(amount, method);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["userProfile"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
