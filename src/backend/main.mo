import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Nat32 "mo:core/Nat32";
import Random "mo:core/Random";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type UserProfile = {
    coins : Nat;
    totalEarned : Nat;
    referralCode : Text;
    referredBy : ?Text;
    checkInStreak : Nat;
    lastCheckIn : ?Time.Time;
    lastSpin : ?Time.Time;
    adsWatchedToday : Nat;
  };

  type Task = {
    id : Text;
    title : Text;
    description : Text;
    reward : Nat;
    taskType : TaskType;
  };

  type TaskType = {
    #watchVideo;
    #installApp;
    #completeSurvey;
  };

  type Transaction = {
    id : Text;
    user : Principal;
    transactionType : TransactionType;
    amount : Nat;
    timestamp : Time.Time;
  };

  type TransactionType = {
    #checkIn;
    #taskCompletion;
    #spin;
    #referralBonus;
    #adWatch;
  };

  type WithdrawalRequest = {
    id : Text;
    user : Principal;
    amount : Nat;
    method : Text;
    status : WithdrawalStatus;
    requestedAt : Time.Time;
    processedAt : ?Time.Time;
  };

  type WithdrawalStatus = {
    #pending;
    #approved;
    #rejected;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  let tasks = Map.empty<Text, Task>();

  let transactions = List.empty<Transaction>();

  let withdrawalRequests = Map.empty<Text, WithdrawalRequest>();

  let accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  module UserProfile {
    public func compare(a : (Principal, UserProfile), b : (Principal, UserProfile)) : Order.Order {
      Nat.compare(b.1.totalEarned, a.1.totalEarned);
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (userProfiles.get(user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func registerUser(referralCode : ?Text) : async () {
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already registered");
    };
    let newProfile : UserProfile = {
      coins = 0;
      totalEarned = 0;
      referralCode = caller.toText();
      referredBy = referralCode;
      checkInStreak = 0;
      lastCheckIn = null;
      lastSpin = null;
      adsWatchedToday = 0;
    };
    userProfiles.add(caller, newProfile);

    switch (referralCode) {
      case (?code) {
        switch (userProfiles.get(caller)) {
          case (null) { Runtime.trap("Referrer not found") };
          case (?referrer) {
            let updatedReferrer : UserProfile = {
              coins = referrer.coins + 50;
              totalEarned = referrer.totalEarned + 50;
              referralCode = referrer.referralCode;
              referredBy = referrer.referredBy;
              checkInStreak = referrer.checkInStreak;
              lastCheckIn = referrer.lastCheckIn;
              lastSpin = referrer.lastSpin;
              adsWatchedToday = referrer.adsWatchedToday;
            };
            userProfiles.add(caller, updatedReferrer);

            let referralTransaction : Transaction = {
              id = "referral_" # code;
              user = caller;
              transactionType = #referralBonus;
              amount = 50;
              timestamp = Time.now();
            };
            transactions.add(referralTransaction);
          };
        };
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func dailyCheckIn() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check in");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
    let today = Time.now() / 86400000000000;
    let baseReward = 10;
    let streakBonus = baseReward * profile.checkInStreak;

    let totalReward = baseReward + streakBonus;
    let updatedProfile : UserProfile = {
      coins = profile.coins + totalReward;
      totalEarned = profile.totalEarned + totalReward;
      referralCode = profile.referralCode;
      referredBy = profile.referredBy;
      checkInStreak = profile.checkInStreak + 1;
      lastCheckIn = ?Time.now();
      lastSpin = profile.lastSpin;
      adsWatchedToday = profile.adsWatchedToday;
    };
    userProfiles.add(caller, updatedProfile);

    let checkInTransaction : Transaction = {
      id = "checkIn_" # caller.toText();
      user = caller;
      transactionType = #checkIn;
      amount = totalReward;
      timestamp = Time.now();
    };
    transactions.add(checkInTransaction);
    totalReward;
  };

  public shared ({ caller }) func spinWheel() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can spin the wheel");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
    let today = Time.now() / 86400000000000;
    switch (profile.lastSpin) {
      case (?lastSpin) {
        let lastSpinDay = lastSpin / 86400000000000;
        if (lastSpinDay == today) {
          Runtime.trap("Already spun today");
        };
      };
      case (null) {};
    };

    let randomSeed = Time.now().toNat() % 100;
    let reward = 5 + (randomSeed % 96);

    let updatedProfile : UserProfile = {
      coins = profile.coins + reward;
      totalEarned = profile.totalEarned + reward;
      referralCode = profile.referralCode;
      referredBy = profile.referredBy;
      checkInStreak = profile.checkInStreak;
      lastCheckIn = profile.lastCheckIn;
      lastSpin = ?Time.now();
      adsWatchedToday = profile.adsWatchedToday;
    };
    userProfiles.add(caller, updatedProfile);

    let spinTransaction : Transaction = {
      id = "spin_" # caller.toText();
      user = caller;
      transactionType = #spin;
      amount = reward;
      timestamp = Time.now();
    };
    transactions.add(spinTransaction);
    reward;
  };

  public shared ({ caller }) func watchAd() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can watch ads");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
    if (profile.adsWatchedToday >= 5) {
      Runtime.trap("Daily ad limit reached");
    };
    let reward = 5;

    let updatedProfile : UserProfile = {
      coins = profile.coins + reward;
      totalEarned = profile.totalEarned + reward;
      referralCode = profile.referralCode;
      referredBy = profile.referredBy;
      checkInStreak = profile.checkInStreak;
      lastCheckIn = profile.lastCheckIn;
      lastSpin = profile.lastSpin;
      adsWatchedToday = profile.adsWatchedToday + 1;
    };
    userProfiles.add(caller, updatedProfile);

    let adTransaction : Transaction = {
      id = "adWatch_" # caller.toText();
      user = caller;
      transactionType = #adWatch;
      amount = reward;
      timestamp = Time.now();
    };
    transactions.add(adTransaction);
    reward;
  };

  public shared ({ caller }) func submitWithdrawalRequest(amount : Nat, method : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit withdrawal requests");
    };
    if (amount < 500) {
      Runtime.trap("Minimum withdrawal is 500 coins");
    };
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };
    if (amount > profile.coins) {
      Runtime.trap("Insufficient balance");
    };
    let requestId = "withdrawal_" # caller.toText() # "_" # Time.now().toText();
    let newRequest : WithdrawalRequest = {
      id = requestId;
      user = caller;
      amount;
      method;
      status = #pending;
      requestedAt = Time.now();
      processedAt = null;
    };
    withdrawalRequests.add(requestId, newRequest);

    let updatedProfile : UserProfile = {
      coins = profile.coins - amount;
      totalEarned = profile.totalEarned;
      referralCode = profile.referralCode;
      referredBy = profile.referredBy;
      checkInStreak = profile.checkInStreak;
      lastCheckIn = profile.lastCheckIn;
      lastSpin = profile.lastSpin;
      adsWatchedToday = profile.adsWatchedToday;
    };
    userProfiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func approveWithdrawal(requestId : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve withdrawals");
    };
    let request = switch (withdrawalRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) { request };
    };
    if (request.status != #pending) {
      Runtime.trap("Request already processed");
    };
    let updatedRequest : WithdrawalRequest = {
      id = request.id;
      user = request.user;
      amount = request.amount;
      method = request.method;
      status = #approved;
      requestedAt = request.requestedAt;
      processedAt = ?Time.now();
    };
    withdrawalRequests.add(requestId, updatedRequest);
  };

  public shared ({ caller }) func rejectWithdrawal(requestId : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can reject withdrawals");
    };
    let request = switch (withdrawalRequests.get(requestId)) {
      case (null) { Runtime.trap("Request not found") };
      case (?request) { request };
    };
    if (request.status != #pending) {
      Runtime.trap("Request already processed");
    };
    let updatedRequest : WithdrawalRequest = {
      id = request.id;
      user = request.user;
      amount = request.amount;
      method = request.method;
      status = #rejected;
      requestedAt = request.requestedAt;
      processedAt = ?Time.now();
    };
    withdrawalRequests.add(requestId, updatedRequest);

    let userProfile = switch (userProfiles.get(request.user)) {
      case (null) { Runtime.trap("User not found") };
      case (?profile) { profile };
    };

    let updatedProfile : UserProfile = {
      coins = userProfile.coins + request.amount;
      totalEarned = userProfile.totalEarned;
      referralCode = userProfile.referralCode;
      referredBy = userProfile.referredBy;
      checkInStreak = userProfile.checkInStreak;
      lastCheckIn = userProfile.lastCheckIn;
      lastSpin = userProfile.lastSpin;
      adsWatchedToday = userProfile.adsWatchedToday;
    };
    userProfiles.add(request.user, updatedProfile);
  };

  public query ({ caller }) func getTopUsers(limit : Nat) : async [(Principal, UserProfile)] {
    let sorted = userProfiles.entries().toArray().sort();
    if (sorted.size() <= limit) {
      return sorted;
    };
    let iter = sorted.sliceToArray(0, limit);
    iter;
  };

  public query ({ caller }) func getUserTransactions(user : Principal) : async [Transaction] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own transactions");
    };
    transactions.filter(func(t) { t.user == user }).toArray();
  };
};
