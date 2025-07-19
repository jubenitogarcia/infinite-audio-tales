import { useState, useRef, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Download,
  Layers3,
  Mic,
  Music,
  Headphones
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioTrack {
  id: string;
  name: string;
  type: 'speech' | 'background' | 'effects';
  audioBuffer?: AudioBuffer;
  volume: number;
  muted: boolean;
  color: string;
  segments: AudioSegment[];
}

interface AudioSegment {
  id: string;
  startTime: number;
  duration: number;
  content: string;
  isGenerating?: boolean;
}

interface AudioTimelineProps {
  podcastId: string;
  duration: number;
  onExport?: (audioBlob: Blob) => void;
}

const GOOGLE_AI_API_KEY = "AIzaSyC7C3ZMZeBbQwpP6z1KjnJ0RomcC-WTt-M";

export function AudioTimeline({ podcastId, duration, onExport }: AudioTimelineProps) {
  const [tracks, setTracks] = useState<AudioTrack[]>([
    {
      id: 'speech',
      name: 'Fala Principal',
      type: 'speech',
      volume: 80,
      muted: false,
      color: 'hsl(270 100% 65%)',
      segments: []
    },
    {
      id: 'background',
      name: 'Som de Fundo',
      type: 'background',
      volume: 40,
      muted: false,
      color: 'hsl(200 80% 60%)',
      segments: []
    },
    {
      id: 'effects',
      name: 'Efeitos Sonoros',
      type: 'effects',
      volume: 60,
      muted: false,
      color: 'hsl(45 100% 65%)',
      segments: []
    }
  ]);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const initializeAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  const generateAudioWithGoogleAI = useCallback(async (text: string, trackType: string) => {
    try {
      setIsGenerating(true);
      
      // Mock implementation - replace with actual Google Studio AI API call
      const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GOOGLE_AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'pt-BR',
            name: trackType === 'speech' ? 'pt-BR-Neural2-A' : 'pt-BR-Neural2-B',
            ssmlGender: 'NEUTRAL'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: trackType === 'speech' ? 1.0 : 0.8,
            pitch: trackType === 'effects' ? 2.0 : 0.0,
            volumeGainDb: 0.0
          }
        })
      });

      if (!response.ok) {
        throw new Error('Falha na geração de áudio');
      }

      const data = await response.json();
      return data.audioContent; // Base64 encoded audio
    } catch (error) {
      console.error('Erro na geração de áudio:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const addSegmentToTrack = useCallback((trackId: string, content: string, startTime: number, duration: number) => {
    const newSegment: AudioSegment = {
      id: `${trackId}-${Date.now()}`,
      startTime,
      duration,
      content,
      isGenerating: true
    };

    setTracks(prev => prev.map(track => 
      track.id === trackId 
        ? { ...track, segments: [...track.segments, newSegment] }
        : track
    ));

    // Generate audio for the segment
    generateAudioWithGoogleAI(content, trackId).then(audioContent => {
      if (audioContent) {
        // Update segment with generated audio
        setTracks(prev => prev.map(track => 
          track.id === trackId 
            ? {
                ...track,
                segments: track.segments.map(seg => 
                  seg.id === newSegment.id 
                    ? { ...seg, isGenerating: false }
                    : seg
                )
              }
            : track
        ));
      }
    });
  }, [generateAudioWithGoogleAI]);

  const updateTrackVolume = useCallback((trackId: string, volume: number) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, volume } : track
    ));
  }, []);

  const toggleTrackMute = useCallback((trackId: string) => {
    setTracks(prev => prev.map(track => 
      track.id === trackId ? { ...track, muted: !track.muted } : track
    ));
  }, []);

  const playPause = useCallback(() => {
    initializeAudioContext();
    setIsPlaying(!isPlaying);
  }, [isPlaying, initializeAudioContext]);

  const exportMixedAudio = useCallback(async () => {
    if (!audioContextRef.current) return;

    // Mix all tracks together
    // This would involve combining all audio buffers with their respective volumes
    const mixedBuffer = new ArrayBuffer(0); // Simplified - implement actual mixing logic
    const audioBlob = new Blob([mixedBuffer], { type: 'audio/wav' });
    
    onExport?.(audioBlob);
  }, [onExport]);

  // Auto-generate initial content
  useEffect(() => {
    // Simulate adding initial segments
    setTimeout(() => {
      addSegmentToTrack('speech', 'Bem-vindos ao episódio de hoje. Hoje vamos explorar...', 0, 5);
      addSegmentToTrack('background', 'música ambiente suave', 0, duration);
      addSegmentToTrack('effects', 'som de páginas virando', 10, 2);
    }, 1000);
  }, [addSegmentToTrack, duration]);

  const timeToPixels = useCallback((time: number) => {
    const timelineWidth = timelineRef.current?.clientWidth || 800;
    return (time / duration) * timelineWidth;
  }, [duration]);

  const getTrackIcon = (type: string) => {
    switch (type) {
      case 'speech': return <Mic className="w-4 h-4" />;
      case 'background': return <Music className="w-4 h-4" />;
      case 'effects': return <Headphones className="w-4 h-4" />;
      default: return <Layers3 className="w-4 h-4" />;
    }
  };

  return (
    <Card className="gradient-card border-border/50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Layers3 className="w-5 h-5 text-primary" />
              Timeline de Áudio
            </h3>
            <Badge variant="secondary" className={cn(
              "transition-smooth",
              isGenerating && "gradient-primary animate-pulse"
            )}>
              {isGenerating ? 'Gerando...' : 'Pronto'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={playPause}
              className="w-10 h-10 rounded-full"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportMixedAudio}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Timeline ruler */}
        <div className="relative mb-4">
          <div className="h-8 bg-muted/20 rounded flex items-center px-2">
            {Array.from({ length: Math.ceil(duration / 10) }, (_, i) => (
              <div
                key={i}
                className="text-xs text-muted-foreground absolute"
                style={{ left: `${(i * 10 / duration) * 100}%` }}
              >
                {i * 10}s
              </div>
            ))}
          </div>
          
          {/* Playhead */}
          <div 
            className="absolute top-0 w-0.5 h-full bg-primary z-10 transition-smooth"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          />
        </div>
      </div>

      {/* Audio Tracks */}
      <div className="space-y-4" ref={timelineRef}>
        {tracks.map((track) => (
          <div key={track.id} className="space-y-2">
            {/* Track Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: track.color }}
                >
                  {getTrackIcon(track.type)}
                </div>
                <span className="font-medium text-sm">{track.name}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTrackMute(track.id)}
                  className="w-8 h-8"
                >
                  {track.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <div className="w-20">
                  <Slider
                    value={[track.volume]}
                    onValueChange={([value]) => updateTrackVolume(track.id, value)}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8">{track.volume}%</span>
              </div>
            </div>

            {/* Track Timeline */}
            <div className="relative h-12 bg-muted/10 rounded border border-border/30">
              {track.segments.map((segment) => (
                <div
                  key={segment.id}
                  className={cn(
                    "absolute h-full rounded transition-smooth cursor-pointer",
                    "flex items-center px-2 text-xs font-medium",
                    segment.isGenerating && "animate-pulse"
                  )}
                  style={{
                    left: `${(segment.startTime / duration) * 100}%`,
                    width: `${(segment.duration / duration) * 100}%`,
                    backgroundColor: track.color,
                    opacity: track.muted ? 0.3 : 0.8
                  }}
                  title={segment.content}
                >
                  <span className="truncate text-white text-xs">
                    {segment.isGenerating ? 'Gerando...' : segment.content}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-border/30">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addSegmentToTrack('speech', 'Nova narração...', currentTime, 3)}
            disabled={isGenerating}
          >
            + Fala
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addSegmentToTrack('effects', 'Novo efeito sonoro', currentTime, 1)}
            disabled={isGenerating}
          >
            + Efeito
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addSegmentToTrack('background', 'Música de transição', currentTime, 5)}
            disabled={isGenerating}
          >
            + Música
          </Button>
        </div>
      </div>
    </Card>
  );
}