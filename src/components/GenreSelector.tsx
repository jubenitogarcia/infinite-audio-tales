import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const GENRES = [
  { id: 'fantasy', name: 'Fantasia', icon: '🏰' },
  { id: 'mystery', name: 'Mistério', icon: '🔍' },
  { id: 'sci-fi', name: 'Ficção Científica', icon: '🚀' },
  { id: 'true-crime', name: 'Crime Real', icon: '🕵️' },
  { id: 'horror', name: 'Terror', icon: '👻' },
  { id: 'romance', name: 'Romance', icon: '💝' },
  { id: 'education', name: 'Educação', icon: '🎓' },
  { id: 'news', name: 'Notícias', icon: '📰' },
  { id: 'comedy', name: 'Comédia', icon: '😂' },
  { id: 'drama', name: 'Drama', icon: '🎭' },
  { id: 'adventure', name: 'Aventura', icon: '⚔️' },
  { id: 'gossip', name: 'Fofocas', icon: '💬' },
];

interface GenreSelectorProps {
  selectedGenres: string[];
  onGenreToggle: (genreId: string) => void;
  maxSelection?: number;
  className?: string;
}

export function GenreSelector({ 
  selectedGenres, 
  onGenreToggle, 
  maxSelection = 5,
  className 
}: GenreSelectorProps) {
  const isSelected = (genreId: string) => selectedGenres.includes(genreId);
  const canSelect = selectedGenres.length < maxSelection;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Escolha seus gêneros favoritos</h3>
        <span className="text-sm text-muted-foreground">
          {selectedGenres.length}/{maxSelection}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {GENRES.map((genre) => {
          const selected = isSelected(genre.id);
          const disabled = !selected && !canSelect;
          
          return (
            <Badge
              key={genre.id}
              variant={selected ? "default" : "outline"}
              className={cn(
                "p-3 cursor-pointer transition-smooth text-center justify-center",
                "hover:scale-105 active:scale-95",
                selected && "gradient-primary shadow-primary",
                disabled && "opacity-50 cursor-not-allowed",
                !disabled && !selected && "hover:border-primary/50"
              )}
              onClick={() => !disabled && onGenreToggle(genre.id)}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="text-lg">{genre.icon}</span>
                <span className="text-xs font-medium">{genre.name}</span>
              </div>
            </Badge>
          );
        })}
      </div>
      
      {selectedGenres.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Selecione pelo menos um gênero para continuar
        </p>
      )}
    </div>
  );
}