import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const SEGMENTS = [
  { coins: 5, color1: "#7c3aed", color2: "#5b21b6" },
  { coins: 100, color1: "#d97706", color2: "#b45309" },
  { coins: 15, color1: "#0891b2", color2: "#0e7490" },
  { coins: 50, color1: "#059669", color2: "#047857" },
  { coins: 10, color1: "#8b5cf6", color2: "#7c3aed" },
  { coins: 30, color1: "#dc2626", color2: "#b91c1c" },
  { coins: 20, color1: "#0284c7", color2: "#0369a1" },
  { coins: 25, color1: "#ea580c", color2: "#c2410c" },
];

const ANGLE = 360 / SEGMENTS.length;

function timeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface SpinEntry {
  coins: number;
  ts: number;
}

interface SpinWheelProps {
  onSpin: () => Promise<number>;
  onWin: (coins: number) => void;
  disabled: boolean;
  isSpinning: boolean;
}

export function SpinWheel({
  onSpin,
  onWin,
  disabled,
  isSpinning,
}: SpinWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [countdown, setCountdown] = useState(timeUntilMidnight());
  const [history, setHistory] = useState<SpinEntry[]>([]);
  const spinning = useRef(false);

  useEffect(() => {
    if (!disabled) return;
    const t = setInterval(() => setCountdown(timeUntilMidnight()), 1000);
    return () => clearInterval(t);
  }, [disabled]);

  const handleSpin = async () => {
    if (disabled || spinning.current) return;
    spinning.current = true;

    const extraSpins = 5 * 360;
    const randomOffset = Math.floor(Math.random() * 360);
    const newRotation = rotation + extraSpins + randomOffset;
    setRotation(newRotation);

    try {
      const coins = await onSpin();
      setHistory((prev) => [{ coins, ts: Date.now() }, ...prev].slice(0, 5));
      setTimeout(() => {
        spinning.current = false;
        onWin(coins);
      }, 4200);
    } catch {
      spinning.current = false;
    }
  };

  const size = 288;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;

  const polarToCartesian = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos((angle * Math.PI) / 180),
    y: cy + radius * Math.sin((angle * Math.PI) / 180),
  });

  const segments = SEGMENTS.map((seg, i) => {
    const startAngle = i * ANGLE - 90;
    const endAngle = startAngle + ANGLE;
    const start = polarToCartesian(startAngle, r);
    const end = polarToCartesian(endAngle, r);
    const largeArc = ANGLE > 180 ? 1 : 0;
    const midAngle = startAngle + ANGLE / 2;
    const labelPos = polarToCartesian(midAngle, r * 0.62);
    const iconPos = polarToCartesian(midAngle, r * 0.82);
    return { seg, start, end, largeArc, labelPos, iconPos, id: `grad-${i}` };
  });

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Wheel */}
      <div className="relative">
        {/* Pointer */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10"
          style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" }}
        >
          <svg width="28" height="32" viewBox="0 0 28 32" aria-hidden="true">
            <polygon
              points="14,32 0,4 28,4"
              fill="oklch(88% 0.2 85)"
              stroke="white"
              strokeWidth="1.5"
            />
            <polygon points="14,26 4,8 24,8" fill="oklch(78% 0.22 50)" />
          </svg>
        </div>

        <svg
          width={size}
          height={size}
          role="img"
          aria-label="Spin wheel"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition:
              isSpinning || spinning.current
                ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)"
                : "none",
            filter: "drop-shadow(0 12px 40px rgba(0,0,0,0.6))",
          }}
        >
          <title>Spin wheel with prize segments</title>
          <defs>
            {segments.map(({ seg, id }) => (
              <radialGradient key={id} id={id} cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor={seg.color1} stopOpacity="1" />
                <stop offset="100%" stopColor={seg.color2} stopOpacity="1" />
              </radialGradient>
            ))}
            <radialGradient id="center-grad" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="oklch(28% 0.04 270)" />
              <stop offset="100%" stopColor="oklch(18% 0.02 270)" />
            </radialGradient>
          </defs>

          {/* Outer glow ring */}
          <circle
            cx={cx}
            cy={cy}
            r={r + 8}
            fill="none"
            stroke="oklch(78% 0.22 50)"
            strokeWidth="3"
            opacity="0.6"
          />
          <circle
            cx={cx}
            cy={cy}
            r={r + 12}
            fill="none"
            stroke="oklch(78% 0.22 50)"
            strokeWidth="1"
            opacity="0.2"
          />

          {/* Segments */}
          {segments.map(
            ({ seg, start, end, largeArc, labelPos, iconPos, id }, i) => (
              <g key={`seg-${seg.coins}-${i}`}>
                <path
                  d={`M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`}
                  fill={`url(#${id})`}
                  stroke="oklch(15% 0.01 270)"
                  strokeWidth="1.5"
                />
                {/* Prize label */}
                <text
                  x={iconPos.x}
                  y={iconPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="rgba(255,255,255,0.6)"
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="Figtree, sans-serif"
                  letterSpacing="0.05em"
                >
                  PRIZE
                </text>
                {/* Coins number */}
                <text
                  x={labelPos.x}
                  y={labelPos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="15"
                  fontWeight="800"
                  fontFamily="Bricolage Grotesque, sans-serif"
                >
                  {seg.coins}
                </text>
              </g>
            ),
          )}

          {/* Divider lines */}
          {segments.map(({ start, id }) => (
            <line
              key={`line-${id}`}
              x1={cx}
              y1={cy}
              x2={start.x}
              y2={start.y}
              stroke="oklch(15% 0.01 270)"
              strokeWidth="1"
              opacity="0.4"
            />
          ))}

          {/* Center circle */}
          <circle
            cx={cx}
            cy={cy}
            r={30}
            fill="url(#center-grad)"
            stroke="oklch(78% 0.22 50)"
            strokeWidth="2.5"
          />
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="oklch(88% 0.2 85)"
            fontSize="9"
            fontWeight="900"
            fontFamily="Bricolage Grotesque, sans-serif"
            letterSpacing="0.1em"
          >
            SPIN
          </text>
          <text
            x={cx}
            y={cy + 7}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="oklch(78% 0.22 50)"
            fontSize="12"
          >
            \uD83E\uDE99
          </text>
        </svg>
      </div>

      {/* Spin button */}
      <motion.button
        type="button"
        data-ocid="spin.spin_button"
        onClick={handleSpin}
        disabled={disabled || spinning.current}
        whileTap={disabled ? {} : { scale: 0.96 }}
        className="relative overflow-hidden font-display font-bold text-lg px-12 py-4 rounded-2xl transition-all disabled:cursor-not-allowed"
        style={{
          background: disabled
            ? "oklch(28% 0.03 270)"
            : "linear-gradient(135deg, oklch(78% 0.22 50), oklch(72% 0.2 65))",
          boxShadow: disabled ? "none" : "0 4px 28px oklch(78% 0.22 50 / 0.55)",
          color: disabled ? "oklch(50% 0.04 270)" : "oklch(15% 0.01 270)",
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {disabled
          ? "\u23F3 Come Back Tomorrow"
          : spinning.current
            ? "Spinning\u2026"
            : "\uD83C\uDFB0 SPIN TO WIN"}
      </motion.button>

      {/* Countdown timer */}
      {disabled && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          data-ocid="spin.next_spin_timer"
          style={{
            background: "oklch(var(--muted))",
            border: "1px solid oklch(var(--border))",
          }}
        >
          <span className="text-xs text-muted-foreground">Next spin in</span>
          <span className="font-mono font-bold text-gold text-sm">
            {countdown}
          </span>
        </motion.div>
      )}

      {/* Spin history */}
      {history.length > 0 && (
        <div className="w-full" data-ocid="spin.history_list">
          <p className="text-xs text-muted-foreground font-semibold mb-2 px-1">
            Recent Spins
          </p>
          <div className="flex gap-2 flex-wrap">
            {history.map((entry) => (
              <motion.div
                key={entry.ts}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl"
                style={{
                  background: "oklch(var(--gold) / 0.12)",
                  border: "1px solid oklch(var(--gold) / 0.25)",
                }}
              >
                <span className="text-sm">\uD83E\uDE99</span>
                <span className="font-display font-bold text-gold text-sm">
                  {entry.coins}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
