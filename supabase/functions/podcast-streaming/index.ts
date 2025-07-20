import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GOOGLE_AI_API_KEY = "AIzaSyC7C3ZMZeBbQwpP6z1KjnJ0RomcC-WTt-M";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let currentStream: ReadableStream | null = null;
  
  socket.onopen = () => {
    console.log("WebSocket connected");
    socket.send(JSON.stringify({ type: "connected", message: "Podcast streaming ready" }));
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);

      if (data.type === "start_stream") {
        await startInfiniteStream(socket, data);
      } else if (data.type === "stop_stream") {
        if (currentStream) {
          currentStream.cancel();
          currentStream = null;
        }
        socket.send(JSON.stringify({ type: "stream_stopped" }));
      }
    } catch (error) {
      console.error("Error processing message:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: error.message 
      }));
    }
  };

  async function startInfiniteStream(socket: WebSocket, data: any) {
    const { preferences, genres, artists } = data;
    let isStreaming = true;
    let segmentCounter = 0;
    
    try {
      socket.send(JSON.stringify({ 
        type: "stream_started", 
        message: "Iniciando streaming ao vivo..." 
      }));

      while (isStreaming && socket.readyState === WebSocket.OPEN) {
        segmentCounter++;
        
        // Gerar contexto dinâmico baseado nos gostos musicais
        const topics = await generateContextualTopic(genres, artists, preferences);
        
        socket.send(JSON.stringify({ 
          type: "generating_content", 
          segment: segmentCounter,
          message: "Criando conteúdo ao vivo..." 
        }));

        // Decidir tipo de segmento baseado no fluxo natural
        const segmentType = decideSegmentType(segmentCounter);
        
        try {
          const audioData = await generateLiveSegment(segmentType, topics, genres, artists);
          
          if (audioData && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ 
              type: "audio_segment", 
              segmentId: `live_${segmentCounter}`,
              segmentType: segmentType,
              audioData: audioData,
              message: `Ao vivo: ${segmentType}...`
            }));
          }
          
          // Pausa dinâmica entre segmentos
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Error generating live segment ${segmentCounter}:`, error);
          // Continue streaming mesmo com erro
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

    } catch (error) {
      console.error("Error in infinite stream:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: error.message 
      }));
    }
  }

  async function generateContextualTopic(genres: string[], artists: string[], preferences: any): Promise<string> {
    const topicResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Crie um tópico interessante para um podcast musical ao vivo.
            
            Gêneros preferidos: ${genres.join(', ')}
            Artistas de referência: ${artists.slice(0, 3).join(', ')}
            Intensidade: ${preferences.intensity}
            
            O tópico deve ser:
            - Relacionado à música e cultura
            - Envolvente e conversacional
            - Adequado para o estilo ${preferences.intensity}
            - Entre 1-2 frases
            
            Responda apenas com o tópico, sem formatação extra.`
          }]
        }]
      })
    });

    if (!topicResponse.ok) {
      return `Vamos falar sobre ${genres[0]} e a influência de ${artists[0]} na música atual.`;
    }

    const topicData = await topicResponse.json();
    return topicData.candidates[0].content.parts[0].text.trim();
  }

  function decideSegmentType(segmentNumber: number): string {
    const cycle = segmentNumber % 6;
    switch (cycle) {
      case 1: return 'narração';
      case 2: return 'música';
      case 3: return 'narração';
      case 4: return 'efeitos';
      case 5: return 'narração';
      case 0: return 'música';
      default: return 'narração';
    }
  }

  async function generateLiveSegment(type: string, topic: string, genres: string[], artists: string[]): Promise<string | null> {
    try {
      if (type === 'narração') {
        return await generateSpeech(`${topic} Vamos explorar como ${artists[0]} influenciou o ${genres[0]}.`);
      } else if (type === 'música') {
        return await generateMusic(`Música ambiente ${genres[0]} inspirada em ${artists[0]}`);
      } else if (type === 'efeitos') {
        return await generateSoundEffect('Transição musical suave');
      }
      return null;
    } catch (error) {
      console.error(`Error generating live ${type}:`, error);
      return null;
    }
  }

  function parseScript(script: string) {
    const segments = [];
    const lines = script.split('\n');
    let segmentId = 0;

    for (const line of lines) {
      const match = line.match(/^\[(NARRAÇÃO|MÚSICA|EFEITOS)\|(\d{2}:\d{2})-(\d{2}:\d{2})\]\s*(.*)/);
      if (match) {
        const [, type, startStr, endStr, content] = match;
        const startTime = timeToSeconds(startStr);
        const endTime = timeToSeconds(endStr);
        
        segments.push({
          id: `segment_${segmentId++}`,
          type: type.toLowerCase(),
          startTime,
          duration: endTime - startTime,
          content: content.trim()
        });
      }
    }

    return segments;
  }

  function timeToSeconds(timeStr: string): number {
    const [minutes, seconds] = timeStr.split(':').map(Number);
    return minutes * 60 + seconds;
  }

  async function generateAudioSegment(segment: any): Promise<string | null> {
    try {
      if (segment.type === 'narração') {
        return await generateSpeech(segment.content);
      } else if (segment.type === 'música') {
        return await generateMusic(segment.content);
      } else if (segment.type === 'efeitos') {
        return await generateSoundEffect(segment.content);
      }
      return null;
    } catch (error) {
      console.error(`Error generating ${segment.type}:`, error);
      return null;
    }
  }

  async function generateSpeech(text: string): Promise<string> {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Neural2-A',
          ssmlGender: 'NEUTRAL'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.0,
          pitch: 0.0,
          volumeGainDb: 0.0
        }
      })
    });

    if (!response.ok) {
      throw new Error('Falha na geração de fala');
    }

    const data = await response.json();
    return data.audioContent;
  }

  async function generateMusic(description: string): Promise<string> {
    // For music generation, we'll use a prompt to generate a musical description
    // and then synthesize it as speech instructions for now
    // In a real implementation, you would use Google's MusicLM or similar
    
    const musicPrompt = `[Música instrumental suave] ${description}`;
    
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text: "[Som ambiente musical]" },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Neural2-B',
          ssmlGender: 'FEMALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.6,
          pitch: -5.0,
          volumeGainDb: -10.0
        }
      })
    });

    if (!response.ok) {
      throw new Error('Falha na geração de música');
    }

    const data = await response.json();
    return data.audioContent;
  }

  async function generateSoundEffect(description: string): Promise<string> {
    // Generate sound effects as synthesized audio
    const effectPrompt = `[Efeito sonoro: ${description}]`;
    
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: { text: effectPrompt },
        voice: {
          languageCode: 'pt-BR',
          name: 'pt-BR-Neural2-C',
          ssmlGender: 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 1.5,
          pitch: 5.0,
          volumeGainDb: -5.0
        }
      })
    });

    if (!response.ok) {
      throw new Error('Falha na geração de efeitos');
    }

    const data = await response.json();
    return data.audioContent;
  }

  socket.onclose = () => {
    console.log("WebSocket disconnected");
    if (currentStream) {
      currentStream.cancel();
      currentStream = null;
    }
  };

  return response;
});