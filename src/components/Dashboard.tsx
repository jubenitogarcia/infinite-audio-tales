import { useState, useEffect } from "react";
import { PodcastCard } from "./PodcastCard";
import { AudioMixer } from "./AudioMixer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Waveform } from "@/components/ui/waveform";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Search,
  Settings,
  Sparkles,
  Shuffle,
  RefreshCw,
  Layers3
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardProps {
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

// Mock data for demonstration
const MOCK_PODCASTS = [
  {
    id: '1',
    title: 'O Mistério da Torre Perdida',
    genre: 'Mistério',
    description: 'Uma investigação sobrenatural em uma torre medieval abandonada, onde ecos do passado revelam segredos sombrios.',
    duration: '23 min',
    isPlaying: true,
    popularity: 85,
  },
  {
    id: '2',
    title: 'Crônicas de Neotóquio',
    genre: 'Ficção Científica',
    description: 'No ano 2087, hackers cibernéticos descobrem uma conspiração que pode mudar o destino da humanidade.',
    duration: '31 min',
    isGenerating: true,
    popularity: 92,
  },
  {
    id: '3',
    title: 'Segredos da Corte Real',
    genre: 'Drama Histórico',
    description: 'Intrigas políticas e romances proibidos na corte de Versailles durante o reinado de Luís XIV.',
    duration: '18 min',
    popularity: 76,
  },
  {
    id: '4',
    title: 'A Lenda do Pirata Fantasma',
    genre: 'Aventura',
    description: 'Navegadores modernos encontram um navio pirata do século XVIII que ainda vaga pelos mares.',
    duration: '27 min',
    popularity: 68,
  },
];

export function Dashboard({ userPreferences }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [showMixer, setShowMixer] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState<any>(null);
  
  const { 
    playerState, 
    playDemo, 
    pause, 
    resume, 
    setVolume 
  } = useAudioPlayer();

  const handlePlay = async (podcastId: string) => {
    if (currentlyPlaying === podcastId) {
      // Toggle play/pause for current podcast
      if (playerState.isPlaying) {
        pause();
      } else {
        resume();
      }
    } else {
      // Start playing a new podcast
      setCurrentlyPlaying(podcastId);
      try {
        // For demo purposes, generate demo audio
        // In real implementation, this would fetch the actual podcast audio
        await playDemo();
      } catch (error) {
        console.error('Erro ao reproduzir podcast:', error);
      }
    }
  };

  const handleOpenMixer = (podcast: any) => {
    setSelectedPodcast(podcast);
    setShowMixer(true);
  };

  // Update volume when player state changes
  useEffect(() => {
    if (playerState.volume !== undefined) {
      // Update UI volume slider if needed
    }
  }, [playerState]);

  const filteredPodcasts = MOCK_PODCASTS.filter(podcast =>
    podcast.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    podcast.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Waveform className="text-primary" bars={3} />
                <h1 className="text-2xl font-bold gradient-hero bg-clip-text text-transparent">
                  Podcaster
                </h1>
              </div>
              <Badge variant="secondary" className="gradient-primary">
                <Sparkles className="w-3 h-3 mr-1" />
                Infinito
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar podcasts..."
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">
            Bem-vindo de volta! 🎧
          </h2>
          <p className="text-muted-foreground mb-4">
            Seus podcasts personalizados estão sendo gerados com base em suas preferências
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm text-muted-foreground">Seus interesses:</span>
            {userPreferences.genres.slice(0, 5).map((genre) => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
            {userPreferences.genres.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{userPreferences.genres.length - 5} mais
              </Badge>
            )}
          </div>

          <div className="flex gap-4">
            <Button 
              className="gradient-primary"
              onClick={() => handleOpenMixer({
                title: 'Novo Episódio Personalizado',
                description: 'Episódio baseado em suas preferências musicais e de conteúdo'
              })}
            >
              <Layers3 className="w-4 h-4 mr-2" />
              Abrir Estúdio
            </Button>
            <Button className="gradient-primary">
              <Shuffle className="w-4 h-4 mr-2" />
              Gerar Novo Episódio
            </Button>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Fila
            </Button>
          </div>
        </div>

        {/* Audio Mixer or Podcasts Grid */}
        {showMixer && selectedPodcast ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Estúdio de Criação</h3>
              <Button 
                variant="outline"
                onClick={() => setShowMixer(false)}
              >
                Voltar aos Podcasts
              </Button>
            </div>
            
            <AudioMixer
              podcastTitle={selectedPodcast.title}
              description={selectedPodcast.description}
              userPreferences={userPreferences}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Seus Podcasts Personalizados</h3>
              <span className="text-sm text-muted-foreground">
                {filteredPodcasts.length} episódios disponíveis
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
              {filteredPodcasts.map((podcast) => (
                <div key={podcast.id} className="space-y-2">
                  <PodcastCard
                    title={podcast.title}
                    genre={podcast.genre}
                    description={podcast.description}
                    duration={podcast.duration}
                    isPlaying={currentlyPlaying === podcast.id && playerState.isPlaying}
                    isGenerating={podcast.isGenerating}
                    popularity={podcast.popularity}
                    onPlay={() => handlePlay(podcast.id)}
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleOpenMixer(podcast)}
                    >
                      <Layers3 className="w-4 h-4 mr-2" />
                      Abrir no Estúdio
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!showMixer && filteredPodcasts.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum podcast encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar sua busca ou gerar novos episódios
            </p>
            <Button className="gradient-primary">
              <RefreshCw className="w-4 h-4 mr-2" />
              Gerar Novos Episódios
            </Button>
          </div>
        )}
      </main>

      {/* Global Player */}
      {currentlyPlaying && (
        <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur border-t border-border/50 p-4 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 gradient-card rounded-lg flex items-center justify-center">
                <Waveform bars={4} animated={playerState.isPlaying} />
              </div>
              <div>
                <h4 className="font-medium text-sm">
                  {MOCK_PODCASTS.find(p => p.id === currentlyPlaying)?.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {MOCK_PODCASTS.find(p => p.id === currentlyPlaying)?.genre}
                </p>
                {playerState.duration > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(playerState.currentTime)}s / {Math.floor(playerState.duration)}s
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handlePlay(currentlyPlaying)}
                className="w-10 h-10 rounded-full gradient-primary"
              >
                {playerState.isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <div className="w-20 h-1 bg-muted rounded-full cursor-pointer"
                   onClick={(e) => {
                     const rect = e.currentTarget.getBoundingClientRect();
                     const x = e.clientX - rect.left;
                     const volume = x / rect.width;
                     setVolume(volume);
                   }}>
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${playerState.volume * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}