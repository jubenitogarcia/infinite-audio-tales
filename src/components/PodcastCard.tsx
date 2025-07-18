import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AudioButton } from "@/components/ui/audio-button";
import { Waveform } from "@/components/ui/waveform";
import { Play, Pause, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface PodcastCardProps {
  title: string;
  genre: string;
  description: string;
  duration: string;
  isPlaying?: boolean;
  isGenerating?: boolean;
  popularity?: number;
  className?: string;
  onPlay?: () => void;
}

export function PodcastCard({
  title,
  genre,
  description,
  duration,
  isPlaying = false,
  isGenerating = false,
  popularity = 0,
  className,
  onPlay,
}: PodcastCardProps) {
  return (
    <Card className={cn(
      "gradient-card border-border/50 p-6 transition-smooth hover:shadow-card hover:border-primary/30",
      isPlaying && "border-primary shadow-primary",
      className
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg text-foreground">{title}</h3>
            {popularity > 70 && (
              <Badge variant="secondary" className="text-accent">
                <TrendingUp className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            )}
          </div>
          <Badge variant="outline" className="mb-3">
            {genre}
          </Badge>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="ml-4 flex flex-col items-center space-y-3">
          <AudioButton
            variant={isGenerating ? "generate" : "play"}
            isPlaying={isPlaying}
            onClick={onPlay}
            className="w-12 h-12 rounded-full"
          >
            {isGenerating ? (
              <Waveform bars={3} className="w-6" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </AudioButton>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            {duration}
          </div>
        </div>
      </div>
      
      {isPlaying && (
        <div className="border-t border-border/50 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Now Playing</span>
            <Waveform className="opacity-60" bars={8} />
          </div>
        </div>
      )}
    </Card>
  );
}