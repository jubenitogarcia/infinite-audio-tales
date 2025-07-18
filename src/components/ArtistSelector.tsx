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
    { id: "led-zeppelin", name: "Led Zeppelin", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", category: "rock-classico" },
    { id: "pink-floyd", name: "Pink Floyd", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", category: "rock-classico" },
    { id: "the-who", name: "The Who", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", category: "rock-classico" },
    { id: "deep-purple", name: "Deep Purple", image: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400", category: "rock-classico" },
    { id: "black-sabbath", name: "Black Sabbath", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400", category: "rock-classico" }
  ],
  "hard-rock": [
    { id: "ac-dc", name: "AC/DC", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", category: "hard-rock" },
    { id: "guns-n-roses", name: "Guns N' Roses", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", category: "hard-rock" },
    { id: "aerosmith", name: "Aerosmith", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", category: "hard-rock" },
    { id: "kiss", name: "KISS", image: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400", category: "hard-rock" },
    { id: "def-leppard", name: "Def Leppard", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400", category: "hard-rock" },
    { id: "bon-jovi", name: "Bon Jovi", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", category: "hard-rock" }
  ],
  "metal": [
    { id: "metallica", name: "Metallica", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", category: "metal" },
    { id: "iron-maiden", name: "Iron Maiden", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", category: "metal" },
    { id: "megadeth", name: "Megadeth", image: "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=400", category: "metal" },
    { id: "slayer", name: "Slayer", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400", category: "metal" },
    { id: "pantera", name: "Pantera", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400", category: "metal" },
    { id: "judas-priest", name: "Judas Priest", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400", category: "metal" }
  ],
  "rock-alternativo": [
    { id: "radiohead", name: "Radiohead", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "rock-alternativo" },
    { id: "nirvana", name: "Nirvana", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400", category: "rock-alternativo" },
    { id: "foo-fighters", name: "Foo Fighters", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", category: "rock-alternativo" },
    { id: "arctic-monkeys", name: "Arctic Monkeys", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400", category: "rock-alternativo" },
    { id: "pearl-jam", name: "Pearl Jam", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "rock-alternativo" },
    { id: "soundgarden", name: "Soundgarden", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400", category: "rock-alternativo" },
    { id: "alice-in-chains", name: "Alice in Chains", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", category: "rock-alternativo" },
    { id: "red-hot-chili-peppers", name: "Red Hot Chili Peppers", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400", category: "rock-alternativo" }
  ],
  "grunge": [
    { id: "stone-temple-pilots", name: "Stone Temple Pilots", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "grunge" },
    { id: "temple-of-the-dog", name: "Temple of the Dog", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400", category: "grunge" },
    { id: "mad-season", name: "Mad Season", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", category: "grunge" },
    { id: "blind-melon", name: "Blind Melon", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400", category: "grunge" }
  ],
  "indie": [
    { id: "vampire-weekend", name: "Vampire Weekend", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "indie" },
    { id: "the-strokes", name: "The Strokes", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400", category: "indie" },
    { id: "tame-impala", name: "Tame Impala", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400", category: "indie" },
    { id: "foster-the-people", name: "Foster the People", image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400", category: "indie" },
    { id: "mgmt", name: "MGMT", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "indie" },
    { id: "cage-the-elephant", name: "Cage the Elephant", image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400", category: "indie" }
  ],
  "pop": [
    { id: "taylor-swift", name: "Taylor Swift", image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400", category: "pop" },
    { id: "ed-sheeran", name: "Ed Sheeran", image: "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400", category: "pop" },
    { id: "billie-eilish", name: "Billie Eilish", image: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400", category: "pop" },
    { id: "dua-lipa", name: "Dua Lipa", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "pop" },
    { id: "ariana-grande", name: "Ariana Grande", image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400", category: "pop" },
    { id: "bruno-mars", name: "Bruno Mars", image: "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400", category: "pop" },
    { id: "justin-timberlake", name: "Justin Timberlake", image: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400", category: "pop" },
    { id: "adele", name: "Adele", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "pop" }
  ],
  "pop-rock": [
    { id: "maroon-5", name: "Maroon 5", image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400", category: "pop-rock" },
    { id: "onerepublic", name: "OneRepublic", image: "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400", category: "pop-rock" },
    { id: "imagine-dragons", name: "Imagine Dragons", image: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400", category: "pop-rock" },
    { id: "coldplay", name: "Coldplay", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "pop-rock" },
    { id: "the-killers", name: "The Killers", image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400", category: "pop-rock" }
  ],
  "indie-pop": [
    { id: "lorde", name: "Lorde", image: "https://images.unsplash.com/photo-1607748862156-7c548e7e98f4?w=400", category: "indie-pop" },
    { id: "lana-del-rey", name: "Lana Del Rey", image: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=400", category: "indie-pop" },
    { id: "florence-machine", name: "Florence + The Machine", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "indie-pop" },
    { id: "the-1975", name: "The 1975", image: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?w=400", category: "indie-pop" }
  ],
  "hip-hop": [
    { id: "eminem", name: "Eminem", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "hip-hop" },
    { id: "drake", name: "Drake", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "hip-hop" },
    { id: "kendrick-lamar", name: "Kendrick Lamar", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "hip-hop" },
    { id: "jay-z", name: "Jay-Z", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "hip-hop" },
    { id: "kanye-west", name: "Kanye West", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "hip-hop" },
    { id: "nas", name: "Nas", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "hip-hop" },
    { id: "biggie", name: "The Notorious B.I.G.", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "hip-hop" },
    { id: "tupac", name: "2Pac", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "hip-hop" }
  ],
  "rap": [
    { id: "j-cole", name: "J. Cole", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "rap" },
    { id: "travis-scott", name: "Travis Scott", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "rap" },
    { id: "post-malone", name: "Post Malone", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "rap" },
    { id: "tyler-the-creator", name: "Tyler, The Creator", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "rap" },
    { id: "childish-gambino", name: "Childish Gambino", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "rap" }
  ],
  "trap": [
    { id: "future", name: "Future", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "trap" },
    { id: "lil-wayne", name: "Lil Wayne", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "trap" },
    { id: "migos", name: "Migos", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "trap" },
    { id: "21-savage", name: "21 Savage", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "trap" }
  ],
  "r&b": [
    { id: "the-weeknd", name: "The Weeknd", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "r&b" },
    { id: "frank-ocean", name: "Frank Ocean", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "r&b" },
    { id: "sza", name: "SZA", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "r&b" },
    { id: "john-legend", name: "John Legend", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "r&b" },
    { id: "alicia-keys", name: "Alicia Keys", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "r&b" }
  ],
  "eletronico": [
    { id: "daft-punk", name: "Daft Punk", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "eletronico" },
    { id: "calvin-harris", name: "Calvin Harris", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "eletronico" },
    { id: "deadmau5", name: "Deadmau5", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "eletronico" },
    { id: "skrillex", name: "Skrillex", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "eletronico" },
    { id: "avicii", name: "Avicii", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "eletronico" },
    { id: "david-guetta", name: "David Guetta", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "eletronico" },
    { id: "tiesto", name: "Tiësto", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "eletronico" },
    { id: "martin-garrix", name: "Martin Garrix", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "eletronico" }
  ],
  "house": [
    { id: "disclosure", name: "Disclosure", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "house" },
    { id: "swedish-house-mafia", name: "Swedish House Mafia", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "house" },
    { id: "duke-dumont", name: "Duke Dumont", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "house" },
    { id: "diplo", name: "Diplo", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "house" }
  ],
  "techno": [
    { id: "carl-cox", name: "Carl Cox", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "techno" },
    { id: "charlotte-de-witte", name: "Charlotte de Witte", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "techno" },
    { id: "amelie-lens", name: "Amelie Lens", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "techno" },
    { id: "richie-hawtin", name: "Richie Hawtin", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "techno" }
  ],
  "dubstep": [
    { id: "nero", name: "Nero", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "dubstep" },
    { id: "flux-pavilion", name: "Flux Pavilion", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "dubstep" },
    { id: "bassnectar", name: "Bassnectar", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "dubstep" }
  ],
  "jazz": [
    { id: "miles-davis", name: "Miles Davis", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "jazz" },
    { id: "john-coltrane", name: "John Coltrane", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "jazz" },
    { id: "ella-fitzgerald", name: "Ella Fitzgerald", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "jazz" },
    { id: "louis-armstrong", name: "Louis Armstrong", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "jazz" },
    { id: "duke-ellington", name: "Duke Ellington", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "jazz" },
    { id: "charlie-parker", name: "Charlie Parker", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "jazz" },
    { id: "bill-evans", name: "Bill Evans", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "jazz" }
  ],
  "blues": [
    { id: "bb-king", name: "B.B. King", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "blues" },
    { id: "muddy-waters", name: "Muddy Waters", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "blues" },
    { id: "robert-johnson", name: "Robert Johnson", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "blues" },
    { id: "stevie-ray-vaughan", name: "Stevie Ray Vaughan", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "blues" }
  ],
  "fusion": [
    { id: "weather-report", name: "Weather Report", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "fusion" },
    { id: "herbie-hancock", name: "Herbie Hancock", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "fusion" },
    { id: "chick-corea", name: "Chick Corea", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "fusion" }
  ],
  "swing": [
    { id: "benny-goodman", name: "Benny Goodman", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "swing" },
    { id: "count-basie", name: "Count Basie", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "swing" },
    { id: "glenn-miller", name: "Glenn Miller", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "swing" }
  ],
  "reggae": [
    { id: "bob-marley", name: "Bob Marley", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "reggae" },
    { id: "jimmy-cliff", name: "Jimmy Cliff", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "reggae" },
    { id: "burning-spear", name: "Burning Spear", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "reggae" }
  ],
  "country": [
    { id: "johnny-cash", name: "Johnny Cash", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "country" },
    { id: "dolly-parton", name: "Dolly Parton", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "country" },
    { id: "willie-nelson", name: "Willie Nelson", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "country" },
    { id: "garth-brooks", name: "Garth Brooks", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "country" }
  ],
  "folk": [
    { id: "bob-dylan", name: "Bob Dylan", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "folk" },
    { id: "joni-mitchell", name: "Joni Mitchell", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "folk" },
    { id: "simon-garfunkel", name: "Simon & Garfunkel", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "folk" },
    { id: "fleet-foxes", name: "Fleet Foxes", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "folk" }
  ],
  "punk": [
    { id: "the-ramones", name: "The Ramones", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "punk" },
    { id: "the-clash", name: "The Clash", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "punk" },
    { id: "sex-pistols", name: "Sex Pistols", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "punk" },
    { id: "green-day", name: "Green Day", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "punk" }
  ],
  "funk": [
    { id: "james-brown", name: "James Brown", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "funk" },
    { id: "parliament-funkadelic", name: "Parliament-Funkadelic", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "funk" },
    { id: "prince", name: "Prince", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "funk" },
    { id: "sly-stone", name: "Sly & The Family Stone", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", category: "funk" }
  ],
  "soul": [
    { id: "aretha-franklin", name: "Aretha Franklin", image: "https://images.unsplash.com/photo-1594736797933-d0cffcc39ba0?w=400", category: "soul" },
    { id: "stevie-wonder", name: "Stevie Wonder", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400", category: "soul" },
    { id: "marvin-gaye", name: "Marvin Gaye", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", category: "soul" },
    { id: "otis-redding", name: "Otis Redding", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", category: "soul" }
  ]
};

const MAIN_CATEGORIES = [
  { id: "rock-classico", name: "Rock Clássico", icon: "🎸" },
  { id: "rock-alternativo", name: "Rock Alternativo", icon: "🎤" },
  { id: "pop", name: "Pop", icon: "✨" },
  { id: "hip-hop", name: "Hip-Hop", icon: "🎵" },
  { id: "eletronico", name: "Eletrônico", icon: "🎧" },
  { id: "jazz", name: "Jazz", icon: "🎺" },
  { id: "reggae", name: "Reggae", icon: "🌴" },
  { id: "country", name: "Country", icon: "🤠" },
  { id: "folk", name: "Folk", icon: "🎻" },
  { id: "punk", name: "Punk", icon: "⚡" },
  { id: "funk", name: "Funk", icon: "🕺" },
  { id: "soul", name: "Soul", icon: "❤️" }
];

const CATEGORY_RELATIONS: Record<string, string[]> = {
  "rock-classico": ["hard-rock", "blues", "metal", "rock-alternativo"],
  "hard-rock": ["metal", "rock-classico", "punk"],
  "metal": ["hard-rock", "punk", "rock-classico"],
  "rock-alternativo": ["grunge", "indie", "punk", "rock-classico"],
  "grunge": ["rock-alternativo", "indie", "punk"],
  "indie": ["rock-alternativo", "indie-pop", "folk", "grunge"],
  "pop": ["pop-rock", "indie-pop", "soul", "funk"],
  "pop-rock": ["rock-alternativo", "pop", "indie"],
  "indie-pop": ["indie", "pop", "folk"],
  "hip-hop": ["rap", "trap", "r&b", "funk"],
  "rap": ["hip-hop", "trap", "r&b"],
  "trap": ["hip-hop", "rap", "r&b"],
  "r&b": ["hip-hop", "soul", "funk", "pop"],
  "eletronico": ["house", "techno", "dubstep"],
  "house": ["eletronico", "techno", "funk"],
  "techno": ["eletronico", "house", "dubstep"],
  "dubstep": ["eletronico", "techno"],
  "jazz": ["blues", "fusion", "swing", "soul"],
  "blues": ["jazz", "rock-classico", "soul", "country"],
  "fusion": ["jazz", "funk", "soul"],
  "swing": ["jazz", "soul", "funk"],
  "reggae": ["funk", "soul", "hip-hop"],
  "country": ["folk", "blues", "soul"],
  "folk": ["country", "indie", "indie-pop"],
  "punk": ["rock-alternativo", "grunge", "metal", "hard-rock"],
  "funk": ["soul", "hip-hop", "r&b", "reggae"],
  "soul": ["r&b", "funk", "jazz", "blues"]
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const getAllArtists = (): Artist[] => {
    return Object.values(ARTIST_DATABASE).flat();
  };

  const getRelatedArtists = (): Artist[] => {
    if (selectedCategories.length === 0 && expandedCategories.size === 0) return [];
    
    const relatedCategories = new Set<string>();
    
    // Add relations from selected categories
    selectedCategories.forEach(category => {
      CATEGORY_RELATIONS[category]?.forEach(related => relatedCategories.add(related));
    });
    
    // Add relations from expanded categories
    expandedCategories.forEach(category => {
      CATEGORY_RELATIONS[category]?.forEach(related => relatedCategories.add(related));
    });

    return getAllArtists().filter(artist => 
      relatedCategories.has(artist.category) ||
      selectedCategories.includes(artist.category) ||
      expandedCategories.has(artist.category)
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
    
    // Expand related categories when selecting an artist
    const relatedCategories = CATEGORY_RELATIONS[artist.category] || [];
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      relatedCategories.slice(0, 3).forEach(cat => newExpanded.add(cat)); // Limit to 3 to keep it manageable
      return newExpanded;
    });
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

      {/* Related Artists - Expanding sections */}
      {(showRelated || expandedCategories.size > 0) && !searchTerm && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">Descubra mais artistas similares:</h4>
          
          {/* Group related artists by category */}
          {Array.from(new Set([
            ...selectedCategories.flatMap(cat => CATEGORY_RELATIONS[cat] || []),
            ...Array.from(expandedCategories).flatMap(cat => CATEGORY_RELATIONS[cat] || [])
          ])).slice(0, 6).map((categoryId) => {
            const category = MAIN_CATEGORIES.find(c => c.id === categoryId);
            const artists = ARTIST_DATABASE[categoryId] || [];
            
            if (artists.length === 0) return null;
            
            return (
              <div key={categoryId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs">{category?.icon}</span>
                  <h5 className="text-xs font-medium text-muted-foreground">{category?.name}</h5>
                  <div className="flex-1 h-px bg-border"></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {artists.slice(0, 6).map((artist) => {
                    const selected = isSelected(artist.id);
                    const disabled = !selected && !canSelect;
                    
                    return (
                      <div
                        key={artist.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-smooth opacity-80",
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
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                        <span className="text-xs font-medium truncate">{artist.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {expandedCategories.size > 0 && (
            <div className="text-center">
              <button
                onClick={() => {
                  // Expand more categories based on current selections
                  const newCategories = Array.from(expandedCategories)
                    .flatMap(cat => CATEGORY_RELATIONS[cat] || [])
                    .filter(cat => !expandedCategories.has(cat))
                    .slice(0, 2);
                  
                  setExpandedCategories(prev => {
                    const newExpanded = new Set(prev);
                    newCategories.forEach(cat => newExpanded.add(cat));
                    return newExpanded;
                  });
                }}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Descobrir mais estilos similares...
              </button>
            </div>
          )}
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