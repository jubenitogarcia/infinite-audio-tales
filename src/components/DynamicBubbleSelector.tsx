import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as d3 from 'd3-force';

// Artistas principais com relacionamentos
const ARTIST_RELATIONSHIPS = {
  'Taylor Swift': {
    icon: '🎤',
    category: 'pop',
    related: ['Olivia Rodrigo', 'Lana Del Rey', 'Phoebe Bridgers', 'Folklore Era']
  },
  'The Weeknd': {
    icon: '🌙',
    category: 'rnb',
    related: ['Drake', 'Frank Ocean', 'Travis Scott', 'After Hours']
  },
  'Billie Eilish': {
    icon: '👑',
    category: 'alternative',
    related: ['Lorde', 'Clairo', 'Girl in Red', 'Ocean Eyes']
  },
  'Drake': {
    icon: '🎵',
    category: 'hip-hop',
    related: ['The Weeknd', 'Future', 'Travis Scott', 'OVO Sound']
  },
  'Ariana Grande': {
    icon: '✨',
    category: 'pop',
    related: ['Taylor Swift', 'Doja Cat', 'Positions', 'Thank U Next']
  },
  'Post Malone': {
    icon: '🎸',
    category: 'hip-hop',
    related: ['Drake', 'Travis Scott', 'Hollywood Bleeding', 'Circles']
  },
  'Dua Lipa': {
    icon: '💎',
    category: 'pop',
    related: ['Ariana Grande', 'Future Nostalgia', 'Levitating', 'Disco']
  },
  'Ed Sheeran': {
    icon: '🎼',
    category: 'folk',
    related: ['Shawn Mendes', 'Shape of You', 'Thinking Out Loud', 'Perfect']
  },
  'Bad Bunny': {
    icon: '🐰',
    category: 'reggaeton',
    related: ['J Balvin', 'Ozuna', 'Un Verano Sin Ti', 'YHLQMDLG']
  },
  'Harry Styles': {
    icon: '🌸',
    category: 'pop',
    related: ['Taylor Swift', 'Fine Line', 'Watermelon Sugar', 'As It Was']
  }
};

interface Node {
  id: string;
  name: string;
  icon: string;
  x: number;
  y: number;
  fx?: number;
  fy?: number;
  isSelected: boolean;
  isRelated: boolean;
  parentId?: string;
  scale: number;
  vx?: number;
  vy?: number;
}

interface DynamicBubbleSelectorProps {
  selectedArtists: string[];
  onArtistToggle: (artist: string) => void;
  minSelection?: number;
  maxSelection?: number;
  className?: string;
}

export function DynamicBubbleSelector({ 
  selectedArtists, 
  onArtistToggle, 
  minSelection = 3,
  maxSelection = 8,
  className 
}: DynamicBubbleSelectorProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [customArtists, setCustomArtists] = useState<string[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationRef = useRef<d3.Simulation<Node, undefined> | null>(null);
  
  const canSelect = selectedArtists.length < maxSelection;
  const needsMore = selectedArtists.length < minSelection;

  // Inicializar nós principais
  useEffect(() => {
    const mainArtists = Object.keys(ARTIST_RELATIONSHIPS);
    const initialNodes: Node[] = mainArtists.map((artist, index) => ({
      id: artist,
      name: artist,
      icon: ARTIST_RELATIONSHIPS[artist].icon,
      x: 300 + Math.cos(index * 2 * Math.PI / mainArtists.length) * 100,
      y: 280 + Math.sin(index * 2 * Math.PI / mainArtists.length) * 100,
      isSelected: selectedArtists.includes(artist),
      isRelated: false,
      scale: 1
    }));
    
    setNodes(initialNodes);
  }, []);

  // Configurar simulação de força
  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) return;

    const simulation = d3.forceSimulation(nodes)
      .force('center', d3.forceCenter(300, 280))
      .force('collision', d3.forceCollide().radius(50))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('link', d3.forceLink([]).id((d: any) => d.id))
      .alphaDecay(0.02)
      .velocityDecay(0.3);

    simulation.on('tick', () => {
      setNodes(prevNodes => [...prevNodes]);
    });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  }, [nodes.length]);

  // Atualizar nós quando artistas são selecionados
  useEffect(() => {
    setNodes(prevNodes => {
      const updatedNodes = [...prevNodes];
      
      // Marcar nós como selecionados
      updatedNodes.forEach(node => {
        node.isSelected = selectedArtists.includes(node.name);
      });

      // Adicionar nós relacionados aos artistas selecionados
      const relatedNodes: Node[] = [];
      selectedArtists.forEach(selectedArtist => {
        if (ARTIST_RELATIONSHIPS[selectedArtist]) {
          const related = ARTIST_RELATIONSHIPS[selectedArtist].related;
          const parentNode = updatedNodes.find(n => n.name === selectedArtist);
          
          if (parentNode) {
            related.forEach((relatedName, index) => {
              const existingNode = updatedNodes.find(n => n.name === relatedName);
              if (!existingNode) {
                const angle = (index * Math.PI * 2) / related.length;
                const radius = 80;
                relatedNodes.push({
                  id: `${selectedArtist}-${relatedName}`,
                  name: relatedName,
                  icon: relatedName.includes(' ') ? '🎵' : '💿',
                  x: parentNode.x + Math.cos(angle) * radius,
                  y: parentNode.y + Math.sin(angle) * radius,
                  isSelected: selectedArtists.includes(relatedName),
                  isRelated: true,
                  parentId: selectedArtist,
                  scale: 0.8
                });
              }
            });
          }
        }
      });

      // Remover nós relacionados de artistas não selecionados
      const filteredNodes = updatedNodes.filter(node => {
        if (!node.isRelated) return true;
        return selectedArtists.includes(node.parentId!);
      });

      const finalNodes = [...filteredNodes, ...relatedNodes];
      
      // Reiniciar simulação com novos nós
      if (simulationRef.current) {
        simulationRef.current.nodes(finalNodes);
        simulationRef.current.alpha(0.5).restart();
      }

      return finalNodes;
    });
  }, [selectedArtists]);

  // Tracking do mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Efeito de hover com escala
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const relativeX = mousePosition.x - container.left;
    const relativeY = mousePosition.y - container.top;

    setNodes(prevNodes => 
      prevNodes.map(node => {
        const distance = Math.sqrt(
          Math.pow(relativeX - node.x, 2) + Math.pow(relativeY - node.y, 2)
        );
        
        const maxDistance = 80;
        const minScale = node.isRelated ? 0.6 : 0.8;
        const maxScale = node.isRelated ? 1.1 : 1.4;
        
        let newScale = minScale;
        if (distance < maxDistance) {
          const proximity = 1 - (distance / maxDistance);
          newScale = minScale + (proximity * (maxScale - minScale));
        }
        
        return { ...node, scale: newScale };
      })
    );
  }, [mousePosition]);

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
      
      {/* Dynamic Bubble Container */}
      <div 
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-background/30 via-muted/20 to-background/50 border border-border/30 backdrop-blur-sm"
        style={{ minHeight: '560px', height: '560px' }}
      >
        {nodes.map((node) => {
          const disabled = !node.isSelected && !canSelect;
          
          return (
            <div
              key={node.id}
              className={cn(
                "absolute rounded-full cursor-pointer transition-all duration-300 ease-out",
                "backdrop-blur-sm border-2 shadow-lg flex items-center justify-center",
                "hover:shadow-xl active:scale-90",
                node.isSelected && "gradient-primary border-primary/50 shadow-primary/40 animate-pulse-glow",
                !node.isSelected && node.isRelated && "bg-muted/70 border-muted-foreground/30 hover:border-primary/40",
                !node.isSelected && !node.isRelated && "bg-background/70 border-border/40 hover:border-primary/60",
                disabled && "opacity-40 cursor-not-allowed"
              )}
              style={{
                transform: `scale(${node.scale})`,
                width: node.isRelated ? '60px' : '80px',
                height: node.isRelated ? '60px' : '80px',
                left: `${node.x - (node.isRelated ? 30 : 40)}px`,
                top: `${node.y - (node.isRelated ? 30 : 40)}px`,
              }}
              onClick={() => !disabled && onArtistToggle(node.name)}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className={node.isRelated ? "text-lg" : "text-xl"}>{node.icon}</span>
                <span className={cn(
                  "font-semibold text-center leading-tight px-1 max-w-full overflow-hidden",
                  node.isSelected ? "text-primary-foreground" : "text-foreground",
                  node.isRelated ? "text-xs" : "text-xs"
                )}>
                  {node.name}
                </span>
              </div>
            </div>
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
          Selecione artistas e veja opções relacionadas aparecerem dinamicamente
        </p>
      )}
    </div>
  );
}