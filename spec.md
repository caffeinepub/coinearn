# CoinEarn - Mobile Earning App

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- User authentication (email/mobile signup and login)
- Daily check-in reward system (coins per day, streak tracking)
- Watch ads to earn coins (simulated ad view with coin reward)
- Tasks section (watch videos, install apps, complete small tasks)
- Referral system (unique referral code, bonus coins on successful invite)
- Spin wheel reward system for extra coins (daily spin limit)
- Leaderboard showing top earning users by total coins
- Wallet section (total coins balance, earning history/transactions)
- Withdraw system (UPI/Paytm withdrawal requests with minimum threshold)
- Push notification reminders (simulated in-app notifications)
- Mobile-first responsive UI

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: User profiles with coins balance, referral codes, daily check-in tracking, tasks system, spin wheel (daily limit), leaderboard queries, transaction history, withdrawal requests
2. Frontend: Bottom nav with Home, Tasks, Spin, Leaderboard, Wallet tabs; auth screens; daily check-in modal; task cards; spin wheel animation; leaderboard list; wallet + withdraw form
3. Authorization component for user login/signup
