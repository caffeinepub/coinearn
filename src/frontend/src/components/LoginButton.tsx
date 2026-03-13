import { useAuth } from "../hooks/useAuth";

interface LoginButtonProps {
  className?: string;
}

export function LoginButton({ className }: LoginButtonProps) {
  const { login } = useAuth();
  return (
    <button
      type="button"
      onClick={login}
      className={className}
      style={{
        background:
          "linear-gradient(135deg, oklch(78% 0.22 50), oklch(72% 0.2 65))",
        color: "oklch(15% 0.01 270)",
      }}
    >
      Get Started Free
    </button>
  );
}
