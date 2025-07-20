import { useState, useRef, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Artistas simplificados para o layout de bolhas
const FEATURED_ARTISTS = [
  { id: 'taylor-swift', name: 'Taylor Swift', category: 'pop', icon: '🎤' },
  { id: 'the-weeknd', name: 'The Weeknd', category: 'rnb', icon: '🌙' },
  { id: 'billie-eilish', name: 'Billie Eilish', category: 'pop', icon: '👑' },
  { id: 'drake', name: 'Drake', category: 'hip-hop', icon: '🎵' },
  { id: 'ariana-grande', name: 'Ariana Grande', category: 'pop', icon: '✨' },
  { id: 'post-malone', name: 'Post Malone', category: 'hip-hop', icon: '🎸' },
  { id: 'dua-lipa', name: 'Dua Lipa', category: 'pop', icon: '💎' },
  { id: 'ed-sheeran', name: 'Ed Sheeran', category: 'folk', icon: '🎼' },
  { id: 'olivia-rodrigo', name: 'Olivia Rodrigo', category: 'pop', icon: '🦋' },
  { id: 'bad-bunny', name: 'Bad Bunny', category: 'reggaeton', icon: '🐰' },
  { id: 'beyonce', name: 'Beyoncé', category: 'rnb', icon: '👸' },
  { id: 'harry-styles', name: 'Harry Styles', category: 'pop', icon: '🌸' },
  { id: 'adele', name: 'Adele', category: 'soul', icon: '🎹' },
  { id: 'bruno-mars', name: 'Bruno Mars', category: 'funk', icon: '🕺' },
  { id: 'justin-bieber', name: 'Justin Bieber', category: 'pop', icon: '🎯' },
];

interface ArtistSelectorProps {
  selectedArtists: string[];
  onArtistToggle: (artist: string) => void;
  minSelection?: number;
  maxSelection?: number;
  className?: string;
}

interface BubbleProps {
  artist: typeof FEATURED_ARTISTS[0];
  isSelected: boolean;
  disabled: boolean;
  onSelect: () => void;
  mousePosition: { x: number; y: number };
  bubbleRef: React.RefObject<HTMLDivElement>;
  position: { x: number; y: number };
}

function ArtistBubble({ artist, isSelected, disabled, onSelect, mousePosition, bubbleRef, position }: BubbleProps) {
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    if (!bubbleRef.current) return;
    
    const bubble = bubbleRef.current;
    const rect = bubble.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(mousePosition.x - centerX, 2) + Math.pow(mousePosition.y - centerY, 2)
    );
    
    const maxDistance = 120;
    const minScale = 0.7;
    const maxScale = 1.3;
    
    let newScale = minScale;
    if (distance < maxDistance) {
      const proximity = 1 - (distance / maxDistance);
      newScale = minScale + (proximity * (maxScale - minScale));
    }
    
    setScale(newScale);
  }, [mousePosition, bubbleRef]);

  return (
    <div
      ref={bubbleRef}
      className={cn(
        "absolute rounded-full cursor-pointer transition-all duration-300 ease-out",
        "backdrop-blur-sm border-2 shadow-lg flex items-center justify-center",
        "hover:shadow-xl active:scale-90",
        isSelected && "gradient-primary border-primary/50 shadow-primary/40 animate-pulse-glow",
        !isSelected && "bg-background/70 border-border/40 hover:border-primary/60",
        disabled && "opacity-40 cursor-not-allowed"
      )}
      style={{
        transform: `scale(${scale})`,
        width: '90px',
        height: '90px',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={() => !disabled && onSelect()}
    >
      <div className="flex flex-col items-center space-y-1">
        <span className="text-2xl">{artist.icon}</span>
        <span className={cn(
          "text-xs font-semibold text-center leading-tight px-1 max-w-full overflow-hidden",
          isSelected ? "text-primary-foreground" : "text-foreground"
        )}>
          {artist.name}
        </span>
      </div>
    </div>
  );
}

export function BubbleArtistSelector({ 
  selectedArtists, 
  onArtistToggle, 
  minSelection = 3,
  maxSelection = 8,
  className 
}: ArtistSelectorProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [customArtists, setCustomArtists] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const canSelect = selectedArtists.length < maxSelection;
  const needsMore = selectedArtists.length < minSelection;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const addCustomArtist = () => {
    if (searchTerm.trim() && !customArtists.includes(searchTerm.trim()) && canSelect) {
      const newArtist = searchTerm.trim();
      setCustomArtists([...customArtists, newArtist]);
      onArtistToggle(newArtist);
      setSearchTerm("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addCustomArtist();
    }
  };

  // Posições em espiral orgânica para as bolhas
  const bubblePositions = [
    { x: 250, y: 80 }, { x: 400, y: 120 }, { x: 150, y: 160 },
    { x: 350, y: 200 }, { x: 500, y: 160 }, { x: 100, y: 260 },
    { x: 300, y: 280 }, { x: 450, y: 240 }, { x: 200, y: 340 },
    { x: 400, y: 320 }, { x: 550, y: 280 }, { x: 150, y: 420 },
    { x: 350, y: 400 }, { x: 500, y: 360 }, { x: 250, y: 480 }
  ];

  const allArtists = [...FEATURED_ARTISTS, ...customArtists.map(name => ({
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    category: 'custom',
    icon: '⭐'
  }))];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Selecione seus artistas favoritos</h3>
        <span className={cn(
          "text-sm",
          needsMore ? "text-destructive" : "text-muted-foreground"
        )}>
          {selectedArtists.length}/{maxSelection} {needsMore && `(mín. ${minSelection})`}
        </span>
      </div>

      {/* Search Input */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Adicionar artista personalizado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10"
          />
        </div>
        <Button
          onClick={addCustomArtist}
          disabled={!searchTerm.trim() || !canSelect}
          size="sm"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Bubble Container */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-background/30 via-muted/20 to-background/50 border border-border/30 backdrop-blur-sm"
        style={{ minHeight: '560px', height: '560px' }}
      >
        {allArtists.slice(0, 15).map((artist, index) => {
          const isSelected = selectedArtists.includes(artist.name);
          const disabled = !isSelected && !canSelect;
          const position = bubblePositions[index] || { x: 100 + (index * 60), y: 100 + ((index % 3) * 80) };
          
          return (
            <ArtistBubble
              key={artist.id}
              artist={artist}
              isSelected={isSelected}
              disabled={disabled}
              onSelect={() => onArtistToggle(artist.name)}
              mousePosition={mousePosition}
              bubbleRef={{
                current: bubbleRefs.current[index]
              }}
              position={position}
            />
          );
        })}
      </div>
      
      {/* Selected Artists */}
      {selectedArtists.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Artistas selecionados:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedArtists.map((artist) => (
              <span
                key={artist}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full border border-primary/20"
              >
                {artist}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {selectedArtists.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Mova o mouse sobre as bolhas e selecione pelo menos {minSelection} artistas
        </p>
      )}
    </div>
  );
}