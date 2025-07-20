import { useState, useRef, useEffect } from "react";
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

interface BubbleProps {
  genre: typeof GENRES[0];
  isSelected: boolean;
  disabled: boolean;
  onSelect: () => void;
  mousePosition: { x: number; y: number };
  bubbleRef: React.RefObject<HTMLDivElement>;
  position: { x: number; y: number };
}

function GenreBubble({ genre, isSelected, disabled, onSelect, mousePosition, bubbleRef, position }: BubbleProps) {
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
    
    const maxDistance = 150;
    const minScale = 0.8;
    const maxScale = 1.4;
    
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
        "absolute rounded-full cursor-pointer transition-all duration-200 ease-out",
        "backdrop-blur-sm border-2 shadow-lg flex items-center justify-center",
        "hover:shadow-xl active:scale-95",
        isSelected && "gradient-primary border-primary/50 shadow-primary/30",
        !isSelected && "bg-background/60 border-border/30 hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      style={{
        transform: `scale(${scale})`,
        width: '80px',
        height: '80px',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={() => !disabled && onSelect()}
    >
      <div className="flex flex-col items-center space-y-1">
        <span className="text-xl">{genre.icon}</span>
        <span className={cn(
          "text-xs font-medium text-center leading-tight px-1",
          isSelected ? "text-primary-foreground" : "text-foreground"
        )}>
          {genre.name}
        </span>
      </div>
    </div>
  );
}

export function GenreSelector({ 
  selectedGenres, 
  onGenreToggle, 
  maxSelection = 5,
  className 
}: GenreSelectorProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const bubbleRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const isSelected = (genreId: string) => selectedGenres.includes(genreId);
  const canSelect = selectedGenres.length < maxSelection;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Posições fixas para as bolhas em formato hexagonal
  const bubblePositions = [
    { x: 200, y: 100 }, { x: 350, y: 100 }, { x: 500, y: 100 },
    { x: 125, y: 200 }, { x: 275, y: 200 }, { x: 425, y: 200 }, { x: 575, y: 200 },
    { x: 200, y: 300 }, { x: 350, y: 300 }, { x: 500, y: 300 },
    { x: 275, y: 400 }, { x: 425, y: 400 }
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Escolha seus gêneros favoritos</h3>
        <span className="text-sm text-muted-foreground">
          {selectedGenres.length}/{maxSelection}
        </span>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full h-96 overflow-hidden rounded-lg bg-gradient-to-br from-background/50 to-muted/30 border border-border/30"
        style={{ minHeight: '500px' }}
      >
        {GENRES.map((genre, index) => {
          const selected = isSelected(genre.id);
          const disabled = !selected && !canSelect;
          const position = bubblePositions[index] || { x: 100 + (index * 80), y: 100 };
          
          return (
            <GenreBubble
              key={genre.id}
              genre={genre}
              isSelected={selected}
              disabled={disabled}
              onSelect={() => onGenreToggle(genre.id)}
              mousePosition={mousePosition}
              bubbleRef={{
                current: bubbleRefs.current[index]
              }}
              position={position}
            />
          );
        })}
      </div>
      
      {selectedGenres.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Mova o mouse sobre as bolhas e selecione seus gêneros favoritos
        </p>
      )}
    </div>
  );
}