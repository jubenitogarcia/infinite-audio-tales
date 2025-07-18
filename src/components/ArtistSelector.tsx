import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Music } from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_ARTISTS = [
  'Radiohead', 'Pink Floyd', 'The Beatles', 'Nirvana', 'Queen',
  'Led Zeppelin', 'AC/DC', 'Metallica', 'Bob Dylan', 'David Bowie',
  'The Rolling Stones', 'Coldplay', 'Imagine Dragons', 'Maroon 5',
  'Ed Sheeran', 'Taylor Swift', 'Billie Eilish', 'Post Malone',
  'Eminem', 'Drake', 'Kanye West', 'Kendrick Lamar', 'The Weeknd',
  'Ariana Grande', 'Dua Lipa', 'Adele', 'John Mayer', 'Bruno Mars'
];

interface ArtistSelectorProps {
  selectedArtists: string[];
  onArtistToggle: (artist: string) => void;
  minSelection?: number;
  maxSelection?: number;
  className?: string;
}

export function ArtistSelector({ 
  selectedArtists, 
  onArtistToggle,
  minSelection = 3,
  maxSelection = 8,
  className 
}: ArtistSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArtists = POPULAR_ARTISTS.filter(artist =>
    artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelected = (artist: string) => selectedArtists.includes(artist);
  const canSelect = selectedArtists.length < maxSelection;

  const handleAddCustomArtist = () => {
    if (searchTerm.trim() && !isSelected(searchTerm) && canSelect) {
      onArtistToggle(searchTerm.trim());
      setSearchTerm("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCustomArtist();
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Music className="w-5 h-5 text-primary" />
            Seus artistas/bandas favoritos
          </h3>
          <span className="text-sm text-muted-foreground">
            {selectedArtists.length}/{maxSelection} (mín. {minSelection})
          </span>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Isso nos ajuda a personalizar o tom e estilo da narração dos seus podcasts
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Buscar ou adicionar artista/banda..."
          className="pl-10 pr-4"
        />
        {searchTerm && !filteredArtists.includes(searchTerm) && canSelect && (
          <Button
            size="sm"
            onClick={handleAddCustomArtist}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7"
          >
            Adicionar
          </Button>
        )}
      </div>

      {/* Selected Artists */}
      {selectedArtists.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Selecionados:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedArtists.map((artist) => (
              <Badge
                key={artist}
                variant="default"
                className="gradient-primary shadow-primary pl-3 pr-1 py-1"
              >
                {artist}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onArtistToggle(artist)}
                  className="ml-1 h-4 w-4 p-0 hover:bg-white/20"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Popular Artists Grid */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Artistas populares:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
          {filteredArtists.map((artist) => {
            const selected = isSelected(artist);
            const disabled = !selected && !canSelect;
            
            return (
              <Badge
                key={artist}
                variant={selected ? "default" : "outline"}
                className={cn(
                  "p-2 cursor-pointer transition-smooth text-center justify-center",
                  "hover:scale-105 active:scale-95",
                  selected && "gradient-primary shadow-primary",
                  disabled && "opacity-50 cursor-not-allowed",
                  !disabled && !selected && "hover:border-primary/50"
                )}
                onClick={() => !disabled && onArtistToggle(artist)}
              >
                <span className="text-xs font-medium">{artist}</span>
              </Badge>
            );
          })}
        </div>
      </div>

      {selectedArtists.length < minSelection && (
        <p className="text-sm text-warning text-center">
          Selecione pelo menos {minSelection} artistas para personalizar melhor sua experiência
        </p>
      )}
    </div>
  );
}