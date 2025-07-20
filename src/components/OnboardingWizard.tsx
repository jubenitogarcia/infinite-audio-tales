import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle } from "lucide-react";
import { DynamicBubbleSelector } from "./DynamicBubbleSelector";
import { GenreSelector } from "./GenreSelector";
import { cn } from "@/lib/utils";

interface OnboardingData {
  artists: string[];
  genres: string[];
  preferences: {
    duration: string;
    intensity: string;
    format: string;
  };
}

interface OnboardingWizardProps {
  onComplete: (data: OnboardingData) => void;
  className?: string;
}

const STEPS = [
  { id: 'artists', title: 'Artistas Favoritos', subtitle: 'Personalize o tom da narração' },
  { id: 'genres', title: 'Gêneros de Interesse', subtitle: 'Escolha seus temas preferidos' },
  { id: 'preferences', title: 'Suas Preferências', subtitle: 'Ajuste final da experiência' },
];

const DURATION_OPTIONS = [
  { id: 'short', name: 'Episódios Curtos', desc: '5-15 minutos', icon: '⚡' },
  { id: 'medium', name: 'Episódios Médios', desc: '15-30 minutos', icon: '⏰' },
  { id: 'long', name: 'Episódios Longos', desc: '30-60 minutos', icon: '🎭' },
  { id: 'mixed', name: 'Variado', desc: 'Duração dinâmica', icon: '🎲' },
];

const INTENSITY_OPTIONS = [
  { id: 'calm', name: 'Tranquilo', desc: 'Narrativa relaxante', icon: '🌙' },
  { id: 'moderate', name: 'Moderado', desc: 'Equilibrio perfeito', icon: '☀️' },
  { id: 'intense', name: 'Intenso', desc: 'Ação e suspense', icon: '⚡' },
];

const FORMAT_OPTIONS = [
  { id: 'story', name: 'Histórias', desc: 'Narrativas ficcionais', icon: '📚' },
  { id: 'documentary', name: 'Documentário', desc: 'Fatos e realidade', icon: '🎬' },
  { id: 'educational', name: 'Educativo', desc: 'Aprendizado', icon: '🎓' },
  { id: 'mixed', name: 'Misto', desc: 'Variedade de formatos', icon: '🎨' },
];

export function OnboardingWizard({ onComplete, className }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    artists: [],
    genres: [],
    preferences: {
      duration: '',
      intensity: '',
      format: '',
    },
  });

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const currentStepData = STEPS[currentStep];

  const canProceed = () => {
    switch (currentStep) {
      case 0: return data.artists.length >= 3;
      case 1: return data.genres.length > 0;
      case 2: return data.preferences.duration && data.preferences.intensity && data.preferences.format;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateArtists = (artists: string[]) => {
    setData(prev => ({ ...prev, artists }));
  };

  const updateGenres = (genres: string[]) => {
    setData(prev => ({ ...prev, genres }));
  };

  const updatePreference = (key: keyof OnboardingData['preferences'], value: string) => {
    setData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [key]: value }
    }));
  };

  const renderPreferenceOption = (
    options: typeof DURATION_OPTIONS,
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((option) => (
        <Card
          key={option.id}
          className={cn(
            "p-4 cursor-pointer transition-smooth border-2",
            selectedValue === option.id
              ? "border-primary gradient-primary shadow-primary"
              : "border-border/50 hover:border-primary/50"
          )}
          onClick={() => onSelect(option.id)}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{option.icon}</span>
            <div>
              <h4 className="font-medium">{option.name}</h4>
              <p className="text-sm text-muted-foreground">{option.desc}</p>
            </div>
            {selectedValue === option.id && (
              <CheckCircle className="w-5 h-5 text-primary-foreground ml-auto" />
            )}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={cn("max-w-4xl mx-auto p-6", className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-primary mr-2" />
          <h1 className="text-3xl font-bold gradient-hero bg-clip-text text-transparent">
            Bem-vindo ao Podcaster
          </h1>
        </div>
        <p className="text-muted-foreground">
          Vamos personalizar sua experiência de podcasts infinitos
        </p>
        <div className="mt-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Passo {currentStep + 1} de {STEPS.length}: {currentStepData.title}
          </p>
        </div>
      </div>

      {/* Step Content */}
      <Card className="gradient-card border-border/50 p-8 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">{currentStepData.title}</h2>
          <p className="text-muted-foreground">{currentStepData.subtitle}</p>
        </div>

        {currentStep === 0 && (
          <DynamicBubbleSelector
            selectedArtists={data.artists}
            onArtistToggle={(artist) => {
              const newArtists = data.artists.includes(artist)
                ? data.artists.filter(a => a !== artist)
                : [...data.artists, artist];
              updateArtists(newArtists);
            }}
          />
        )}

        {currentStep === 1 && (
          <GenreSelector
            selectedGenres={data.genres}
            onGenreToggle={(genre) => {
              const newGenres = data.genres.includes(genre)
                ? data.genres.filter(g => g !== genre)
                : [...data.genres, genre];
              updateGenres(newGenres);
            }}
          />
        )}

        {currentStep === 2 && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Duração dos episódios</h3>
              {renderPreferenceOption(
                DURATION_OPTIONS,
                data.preferences.duration,
                (value) => updatePreference('duration', value)
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Intensidade narrativa</h3>
              {renderPreferenceOption(
                INTENSITY_OPTIONS,
                data.preferences.intensity,
                (value) => updatePreference('intensity', value)
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Formato preferido</h3>
              {renderPreferenceOption(
                FORMAT_OPTIONS,
                data.preferences.format,
                (value) => updatePreference('format', value)
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex items-center gradient-primary"
        >
          {currentStep === STEPS.length - 1 ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Criar Meus Podcasts
            </>
          ) : (
            <>
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}