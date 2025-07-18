import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Waveform } from "@/components/ui/waveform";
import { forwardRef } from "react";

interface AudioButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "play" | "pause" | "generate";
  isPlaying?: boolean;
  children?: React.ReactNode;
}

const AudioButton = forwardRef<HTMLButtonElement, AudioButtonProps>(
  ({ className, variant = "play", isPlaying = false, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          variant === "generate" && "gradient-primary pulse-glow",
          className
        )}
        {...props}
      >
        {variant === "generate" && isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Waveform className="opacity-30" bars={3} />
          </div>
        )}
        {children}
      </Button>
    );
  }
);

AudioButton.displayName = "AudioButton";

export { AudioButton };