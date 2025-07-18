import { cn } from "@/lib/utils";

interface WaveformProps {
  className?: string;
  bars?: number;
  animated?: boolean;
}

export function Waveform({ className, bars = 5, animated = true }: WaveformProps) {
  return (
    <div className={cn("flex items-end space-x-1", className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "bg-waveform rounded-full",
            animated && "waveform-bar",
            // Different heights for visual variety
            i % 2 === 0 ? "h-2 w-1" : "h-4 w-1",
            i === Math.floor(bars / 2) && "h-6"
          )}
          style={{
            animationDelay: animated ? `${i * 0.1}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}