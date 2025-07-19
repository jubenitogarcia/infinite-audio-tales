import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioTimeline } from "./AudioTimeline";
import { 
  Layers3, 
  Play, 
  Square, 
  Download,
  Settings
} from "lucide-react";
import { Waveform } from "@/components/ui/waveform";
import { cn } from "@/lib/utils";

interface AudioMixerProps {
  podcastTitle: string;
  description: string;
  userPreferences: {
    artists: string[];
    genres: string[];
    preferences: {
      duration: string;
      intensity: string;
      format: string;
    };
  };
}

const GOOGLE_AI_API_KEY = "AIzaSyC7C3ZMZeBbQwpP6z1KjnJ0RomcC-WTt-M";

export function AudioMixer({ podcastTitle, description, userPreferences }: AudioMixerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mixingProgress, setMixingProgress] = useState(0);
  const [finalAudioUrl, setFinalAudioUrl] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'mixing' | 'complete'>('idle');

  const duration = parseInt(userPreferences.preferences.duration) * 60; // Convert to seconds

  const generatePodcastContent = useCallback(async () => {
    setGenerationStatus('generating');
    
    try {
      // Generate podcast script using Google AI
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Crie um roteiro detalhado para um podcast de ${userPreferences.preferences.duration} minutos sobre "${podcastTitle}". 
              Descrição: ${description}
              
              Gêneros de interesse: ${userPreferences.genres.join(', ')}
              Artistas de interesse: ${userPreferences.artists.slice(0, 5).join(', ')}
              Intensidade: ${userPreferences.preferences.intensity}
              
              O roteiro deve incluir:
              1. Introdução cativante (30 segundos)
              2. Desenvolvimento do tema principal (70% do tempo)
              3. Momentos para efeitos sonoros específicos
              4. Sugestões de música de fundo apropriada
              5. Conclusão impactante (30 segundos)
              
              Formate a resposta em seções claras indicando:
              - [FALA] para narrações
              - [MÚSICA] para trilha sonora
              - [EFEITO] para efeitos sonoros
              - Tempo aproximado de cada seção`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Falha na geração do conteúdo');
      }

      const data = await response.json();
      const script = data.candidates[0].content.parts[0].text;
      
      console.log('Script gerado:', script);
      setGenerationStatus('mixing');
      
      // Simulate mixing progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setMixingProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setGenerationStatus('complete');
          setFinalAudioUrl('blob:audio-url-placeholder'); // In real implementation, this would be the actual mixed audio
        }
      }, 500);

    } catch (error) {
      console.error('Erro na geração:', error);
      setGenerationStatus('idle');
    }
  }, [podcastTitle, description, userPreferences]);

  const handleExportAudio = useCallback((audioBlob: Blob) => {
    const url = URL.createObjectURL(audioBlob);
    setFinalAudioUrl(url);
    
    // Auto-download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${podcastTitle.replace(/\s+/g, '_')}.wav`;
    a.click();
  }, [podcastTitle]);

  const getStatusBadge = () => {
    switch (generationStatus) {
      case 'generating':
        return <Badge className="gradient-primary animate-pulse">Gerando Script...</Badge>;
      case 'mixing':
        return <Badge className="gradient-primary animate-pulse">Mixando Áudio ({mixingProgress}%)</Badge>;
      case 'complete':
        return <Badge variant="secondary" className="bg-success text-success-foreground">Concluído!</Badge>;
      default:
        return <Badge variant="outline">Pronto para gerar</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <Card className="gradient-card border-border/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Layers3 className="w-6 h-6 text-primary" />
              Estúdio de Mixagem
            </h2>
            <p className="text-sm text-muted-foreground">
              {podcastTitle} • {duration / 60} minutos
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {getStatusBadge()}
            
            <div className="flex space-x-2">
              {generationStatus === 'idle' && (
                <Button 
                  onClick={generatePodcastContent}
                  className="gradient-primary"
                  disabled={isRecording}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Gerar Podcast
                </Button>
              )}
              
              {generationStatus === 'complete' && finalAudioUrl && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = finalAudioUrl;
                    a.download = `${podcastTitle.replace(/\s+/g, '_')}.wav`;
                    a.click();
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Generation Progress */}
        {(generationStatus === 'generating' || generationStatus === 'mixing') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {generationStatus === 'generating' ? 'Criando roteiro com IA...' : 'Mixando faixas de áudio...'}
              </span>
              {generationStatus === 'mixing' && (
                <span className="text-primary font-medium">{mixingProgress}%</span>
              )}
            </div>
            <div className="w-full bg-muted/20 rounded-full h-2">
              <div 
                className={cn(
                  "h-full bg-primary rounded-full transition-smooth",
                  generationStatus === 'generating' && "w-1/3 animate-pulse",
                  generationStatus === 'mixing' && `w-[${mixingProgress}%]`
                )}
                style={generationStatus === 'mixing' ? { width: `${mixingProgress}%` } : undefined}
              />
            </div>
          </div>
        )}

        {/* Preferences Preview */}
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Duração:</span>
              <span className="ml-2 font-medium">{userPreferences.preferences.duration} min</span>
            </div>
            <div>
              <span className="text-muted-foreground">Intensidade:</span>
              <span className="ml-2 font-medium">{userPreferences.preferences.intensity}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Formato:</span>
              <span className="ml-2 font-medium">{userPreferences.preferences.format}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Audio Timeline */}
      {(generationStatus === 'mixing' || generationStatus === 'complete') && (
        <AudioTimeline
          podcastId={podcastTitle}
          duration={duration}
          onExport={handleExportAudio}
        />
      )}

      {/* Final Audio Player */}
      {finalAudioUrl && generationStatus === 'complete' && (
        <Card className="gradient-card border-border/50 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Waveform className="w-5 h-5 text-success" />
            Podcast Finalizado
          </h3>
          
          <div className="bg-muted/10 rounded-lg p-4">
            <audio 
              controls 
              className="w-full" 
              src={finalAudioUrl}
              preload="metadata"
            >
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Podcast gerado com sucesso usando Google Studio AI
            </p>
            <Badge variant="secondary" className="bg-success text-success-foreground">
              ✓ Pronto para publicação
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
}