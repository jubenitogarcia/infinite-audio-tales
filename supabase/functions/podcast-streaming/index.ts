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

      if (data.type === "generate_podcast") {
        await generateAndStreamPodcast(socket, data);
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

  async function generateAndStreamPodcast(socket: WebSocket, data: any) {
    const { title, description, preferences, genres, artists } = data;
    
    try {
      // Step 1: Generate podcast script using Gemini
      socket.send(JSON.stringify({ 
        type: "status", 
        message: "Gerando roteiro com IA..." 
      }));

      const scriptResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_AI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Crie um roteiro detalhado para um podcast de ${preferences.duration} minutos sobre "${title}".
              
              Descrição: ${description}
              Gêneros musicais: ${genres.join(', ')}
              Artistas de referência: ${artists.slice(0, 5).join(', ')}
              Intensidade: ${preferences.intensity}
              
              O roteiro deve incluir:
              1. [NARRAÇÃO] Introdução cativante (30 segundos)
              2. [NARRAÇÃO] Desenvolvimento principal com 5 segmentos de 2-3 minutos cada
              3. [MÚSICA] Indicações de música de fundo apropriada para cada momento
              4. [EFEITOS] Momentos específicos para efeitos sonoros
              5. [NARRAÇÃO] Conclusão impactante (30 segundos)
              
              Formate EXATAMENTE assim:
              [NARRAÇÃO|00:00-00:30] Texto da introdução...
              [MÚSICA|00:00-10:00] Estilo: ambiente suave, inspirado em ${genres[0]}
              [EFEITOS|00:15-00:17] Som de páginas virando
              [NARRAÇÃO|00:30-03:00] Primeiro segmento...
              
              Continue este padrão para todo o episódio.`
            }]
          }]
        })
      });

      if (!scriptResponse.ok) {
        throw new Error('Falha na geração do roteiro');
      }

      const scriptData = await scriptResponse.json();
      const script = scriptData.candidates[0].content.parts[0].text;
      
      console.log("Script gerado:", script);
      
      // Parse script segments
      const segments = parseScript(script);
      
      socket.send(JSON.stringify({ 
        type: "script_ready", 
        segments: segments.length,
        message: "Roteiro criado! Iniciando geração de áudio..." 
      }));

      // Step 2: Generate and stream audio for each segment
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        socket.send(JSON.stringify({ 
          type: "generating_segment", 
          current: i + 1,
          total: segments.length,
          segmentType: segment.type,
          message: `Gerando ${segment.type} ${i + 1}/${segments.length}...` 
        }));

        try {
          const audioData = await generateAudioSegment(segment);
          
          if (audioData) {
            socket.send(JSON.stringify({ 
              type: "audio_segment", 
              segmentId: segment.id,
              segmentType: segment.type,
              startTime: segment.startTime,
              duration: segment.duration,
              audioData: audioData,
              message: `Reproduzindo ${segment.type}...`
            }));

            // Small delay to prevent overwhelming the client
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Error generating segment ${i}:`, error);
          socket.send(JSON.stringify({ 
            type: "segment_error", 
            segmentId: segment.id,
            error: error.message 
          }));
        }
      }

      socket.send(JSON.stringify({ 
        type: "generation_complete", 
        message: "Podcast gerado com sucesso!" 
      }));

    } catch (error) {
      console.error("Error generating podcast:", error);
      socket.send(JSON.stringify({ 
        type: "error", 
        message: error.message 
      }));
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