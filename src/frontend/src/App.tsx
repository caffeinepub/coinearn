import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BottomNav, type TabName } from "./components/BottomNav";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import { useRegisterUser, useUserProfile } from "./hooks/useQueries";
import { HomePage } from "./pages/HomePage";
import { LandingPage } from "./pages/LandingPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { SpinPage } from "./pages/SpinPage";
import { TasksPage } from "./pages/TasksPage";
import { WalletPage } from "./pages/WalletPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabName>("home");
  const registerMutation = useRegisterUser();
  const { data: profile } = useUserProfile();
  const registeredRef = useRef(false);
  const reminderShownRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || registeredRef.current) return;
    registeredRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref") ?? null;
    registerMutation.mutate(ref);
  }, [isAuthenticated, registerMutation]);

  useEffect(() => {
    if (!isAuthenticated || !profile || reminderShownRef.current) return;
    reminderShownRef.current = true;
    const lastCheckIn = profile.lastCheckIn;
    if (!lastCheckIn) {
      toast("\u23f0 Don't forget your daily check-in!", {
        description: "Claim your coins and keep your streak!",
        action: { label: "Check In", onClick: () => setActiveTab("home") },
      });
      return;
    }
    const date = new Date(Number(lastCheckIn) / 1_000_000);
    const now = new Date();
    const todayChecked =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    if (!todayChecked) {
      toast("\u23f0 Daily check-in available!", {
        description: "Earn coins and maintain your streak!",
        action: { label: "Claim", onClick: () => setActiveTab("home") },
      });
    }
  }, [isAuthenticated, profile]);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const pages: Record<TabName, React.ReactNode> = {
    home: <HomePage />,
    tasks: <TasksPage />,
    spin: <SpinPage />,
    leaderboard: <LeaderboardPage />,
    wallet: <WalletPage />,
  };

  return (
    <div className="relative">
      <div
        className="overflow-y-auto"
        style={{ height: "calc(100vh - 72px)", paddingTop: "0.5rem" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {pages[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <InternetIdentityProvider>
        <AuthProvider>
          <div
            className="min-h-screen"
            style={{ background: "oklch(var(--background))" }}
          >
            <div
              className="mx-auto min-h-screen relative overflow-hidden"
              style={{
                maxWidth: "430px",
                background: "oklch(var(--background))",
              }}
            >
              <AppContent />
            </div>
          </div>
          <Toaster
            theme="dark"
            position="top-center"
            toastOptions={{
              style: {
                background: "oklch(22% 0.025 270)",
                border: "1px solid oklch(28% 0.03 270)",
                color: "oklch(96% 0.01 270)",
              },
            }}
          />
        </AuthProvider>
      </InternetIdentityProvider>
    </QueryClientProvider>
  );
}
