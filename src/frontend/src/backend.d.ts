import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface UserProfile {
    referralCode: string;
    coins: bigint;
    totalEarned: bigint;
    checkInStreak: bigint;
    referredBy?: string;
    lastCheckIn?: Time;
    lastSpin?: Time;
    adsWatchedToday: bigint;
}
export interface Transaction {
    id: string;
    transactionType: TransactionType;
    user: Principal;
    timestamp: Time;
    amount: bigint;
}
export enum TransactionType {
    taskCompletion = "taskCompletion",
    checkIn = "checkIn",
    adWatch = "adWatch",
    spin = "spin",
    referralBonus = "referralBonus"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    approveWithdrawal(requestId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    dailyCheckIn(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile>;
    getCallerUserRole(): Promise<UserRole>;
    getTopUsers(limit: bigint): Promise<Array<[Principal, UserProfile]>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    getUserTransactions(user: Principal): Promise<Array<Transaction>>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(referralCode: string | null): Promise<void>;
    rejectWithdrawal(requestId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    spinWheel(): Promise<bigint>;
    submitWithdrawalRequest(amount: bigint, method: string): Promise<void>;
    watchAd(): Promise<bigint>;
}
