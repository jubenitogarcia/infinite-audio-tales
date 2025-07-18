import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X, Music } from "lucide-react";
import { cn } from "@/lib/utils";

interface Artist {
  id: string;
  name: string;
  image: string;
  category: string;
  relatedCategories?: string[];
}

const ARTIST_DATABASE: Record<string, Artist[]> = {
  "rock-classico": [
    { id: "beatles", name: "The Beatles", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", category: "rock-classico" },
    { id: "queen", name: "Queen", image: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400", category: "rock-classico" },
    { id: "rolling-stones", name: "The Rolling Stones", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400", category: "rock-classico" },
    { id: "led-zeppelin", name: "Led Zeppelin", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", category: "rock-classico" }
  ],
  "rock-alternativo": [
    { id: "radiohead", name: "Radiohead", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "rock-alternativo" },
    { id: "nirvana", name: "Nirvana", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400", category: "rock-alternativo" },
    { id: "foo-fighters", name: "Foo Fighters", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", category: "rock-alternativo" },
    { id: "arctic-monkeys", name: "Arctic Monkeys", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400", category: "rock-alternativo" }
  ],
  "pop": [
    { id: "taylor-swift", name: "Taylor Swift", image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400", category: "pop" },
    { id: "ed-sheeran", name: "Ed Sheeran", image: "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400", category: "pop" },
    { id: "billie-eilish", name: "Billie Eilish", image: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400", category: "pop" },
    { id: "dua-lipa", name: "Dua Lipa", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "pop" }
  ],
  "hip-hop": [
    { id: "eminem", name: "Eminem", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "hip-hop" },
    { id: "drake", name: "Drake", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "hip-hop" },
    { id: "kendrick-lamar", name: "Kendrick Lamar", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "hip-hop" },
    { id: "jay-z", name: "Jay-Z", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "hip-hop" }
  ],
  "eletronico": [
    { id: "daft-punk", name: "Daft Punk", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "eletronico" },
    { id: "calvin-harris", name: "Calvin Harris", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "eletronico" },
    { id: "deadmau5", name: "Deadmau5", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "eletronico" },
    { id: "skrillex", name: "Skrillex", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "eletronico" }
  ],
  "jazz": [
    { id: "miles-davis", name: "Miles Davis", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "jazz" },
    { id: "john-coltrane", name: "John Coltrane", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "jazz" },
    { id: "ella-fitzgerald", name: "Ella Fitzgerald", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "jazz" },
    { id: "louis-armstrong", name: "Louis Armstrong", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "jazz" }
  ]
};

const MAIN_CATEGORIES = [
  { id: "rock-classico", name: "Rock Clássico", icon: "🎸" },
  { id: "rock-alternativo", name: "Rock Alternativo", icon: "🎤" },
  { id: "pop", name: "Pop", icon: "✨" },
  { id: "hip-hop", name: "Hip-Hop", icon: "🎵" },
  { id: "eletronico", name: "Eletrônico", icon: "🎧" },
  { id: "jazz", name: "Jazz", icon: "🎺" }
];

const CATEGORY_RELATIONS: Record<string, string[]> = {
  "rock-classico": ["rock-alternativo", "blues", "hard-rock"],
  "rock-alternativo": ["indie", "grunge", "rock-classico"],
  "pop": ["pop-rock", "dance-pop", "indie-pop"],
  "hip-hop": ["rap", "trap", "r&b"],
  "eletronico": ["house", "techno", "dubstep"],
  "jazz": ["blues", "fusion", "swing"]
};

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showRelated, setShowRelated] = useState(false);

  const getAllArtists = (): Artist[] => {
    return Object.values(ARTIST_DATABASE).flat();
  };

  const getRelatedArtists = (): Artist[] => {
    if (selectedCategories.length === 0) return [];
    
    const relatedCategories = new Set<string>();
    selectedCategories.forEach(category => {
      CATEGORY_RELATIONS[category]?.forEach(related => relatedCategories.add(related));
    });

    return getAllArtists().filter(artist => 
      relatedCategories.has(artist.category) ||
      selectedCategories.includes(artist.category)
    );
  };

  const filteredArtists = searchTerm 
    ? getAllArtists().filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const isSelected = (artistId: string) => selectedArtists.includes(artistId);
  const canSelect = selectedArtists.length < maxSelection;

  const handleCategorySelect = (categoryId: string) => {
    if (!selectedCategories.includes(categoryId)) {
      setSelectedCategories(prev => [...prev, categoryId]);
      setShowRelated(true);
    }
  };

  const handleArtistSelect = (artist: Artist) => {
    onArtistToggle(artist.id);
    if (!selectedCategories.includes(artist.category)) {
      setSelectedCategories(prev => [...prev, artist.category]);
      setShowRelated(true);
    }
  };

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

  const getSelectedArtistData = (artistId: string): Artist | null => {
    return getAllArtists().find(artist => artist.id === artistId) || null;
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
        {searchTerm && filteredArtists.length === 0 && canSelect && (
          <Button
            size="sm"
            onClick={handleAddCustomArtist}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7"
          >
            Adicionar
          </Button>
        )}
      </div>

      {/* Search Results */}
      {searchTerm && filteredArtists.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Resultados da busca:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
            {filteredArtists.slice(0, 6).map((artist) => {
              const selected = isSelected(artist.id);
              const disabled = !selected && !canSelect;
              
              return (
                <div
                  key={artist.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-smooth",
                    "hover:scale-[1.02] active:scale-95",
                    selected && "bg-primary/10 border-primary",
                    disabled && "opacity-50 cursor-not-allowed",
                    !disabled && !selected && "hover:border-primary/50 hover:bg-muted/50"
                  )}
                  onClick={() => !disabled && handleArtistSelect(artist)}
                >
                  <img 
                    src={artist.image} 
                    alt={artist.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{artist.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Artists */}
      {selectedArtists.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Selecionados:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedArtists.map((artistId) => {
              const artistData = getSelectedArtistData(artistId);
              return (
                <Badge
                  key={artistId}
                  variant="default"
                  className="gradient-primary shadow-primary pl-1 pr-1 py-1 flex items-center gap-2"
                >
                  {artistData && (
                    <img 
                      src={artistData.image} 
                      alt={artistData.name}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                  )}
                  <span className="text-xs">{artistData?.name || artistId}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onArtistToggle(artistId)}
                    className="ml-1 h-4 w-4 p-0 hover:bg-white/20"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Categories */}
      {!searchTerm && selectedCategories.length === 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Escolha seus estilos musicais:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MAIN_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-dashed border-muted hover:border-primary/50 cursor-pointer transition-smooth hover:bg-muted/50"
                onClick={() => handleCategorySelect(category.id)}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Artists */}
      {!searchTerm && selectedCategories.length > 0 && (
        <div className="space-y-4">
          {selectedCategories.map((categoryId) => {
            const category = MAIN_CATEGORIES.find(c => c.id === categoryId);
            const artists = ARTIST_DATABASE[categoryId] || [];
            
            return (
              <div key={categoryId} className="space-y-2">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <span>{category?.icon}</span>
                  {category?.name}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {artists.map((artist) => {
                    const selected = isSelected(artist.id);
                    const disabled = !selected && !canSelect;
                    
                    return (
                      <div
                        key={artist.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-smooth",
                          "hover:scale-[1.02] active:scale-95",
                          selected && "bg-primary/10 border-primary",
                          disabled && "opacity-50 cursor-not-allowed",
                          !disabled && !selected && "hover:border-primary/50 hover:bg-muted/50"
                        )}
                        onClick={() => !disabled && handleArtistSelect(artist)}
                      >
                        <img 
                          src={artist.image} 
                          alt={artist.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium">{artist.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Related Artists */}
      {showRelated && !searchTerm && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Você também pode gostar de:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {getRelatedArtists().slice(0, 8).map((artist) => {
              const selected = isSelected(artist.id);
              const disabled = !selected && !canSelect;
              
              return (
                <div
                  key={artist.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-smooth opacity-75",
                    "hover:scale-[1.02] active:scale-95 hover:opacity-100",
                    selected && "bg-primary/10 border-primary opacity-100",
                    disabled && "opacity-50 cursor-not-allowed",
                    !disabled && !selected && "hover:border-primary/50 hover:bg-muted/50"
                  )}
                  onClick={() => !disabled && handleArtistSelect(artist)}
                >
                  <img 
                    src={artist.image} 
                    alt={artist.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium">{artist.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedArtists.length < minSelection && (
        <p className="text-sm text-warning text-center">
          Selecione pelo menos {minSelection} artistas para personalizar melhor sua experiência
        </p>
      )}
    </div>
  );
}