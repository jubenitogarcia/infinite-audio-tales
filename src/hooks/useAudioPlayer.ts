import { useCallback, useRef, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dhdzdyxbdqqcyvxyfptz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZHpkeXhiZHFxY3l2eHlmcHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5OTI5MDYsImV4cCI6MjA0ODU2ODkwNn0.Hp6eUfAJl-e1RhzUjfS3DG5gOgNhqHkq_mzZFqh_sGE'
);

export interface AudioPlayerState {
  isPlaying: boolean;
  isGenerating: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  currentSegment?: string;
  totalSegments?: number;
  generatedSegments?: number;
}

export interface PodcastData {
  title: string;
  description: string;
  preferences: {
    duration: string;
    intensity: string;
    format: string;
  };
  genres: string[];
  artists: string[];
}

export class RealTimeAudioStreamer {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;
  private currentSource: AudioBufferSourceNode | null = null;
  private onStateChange?: (state: AudioPlayerState) => void;
  private startTime = 0;
  private pausedTime = 0;

  constructor(onStateChange?: (state: AudioPlayerState) => void) {
    this.onStateChange = onStateChange;
  }

  async connect(): Promise<void> {
    try {
      // Initialize audio context
      this.audioContext = new AudioContext();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Connect to WebSocket
      const { data: { session } } = await supabase.auth.getSession();
      const wsUrl = `wss://dhdzdyxbdqqcyvxyfptz.supabase.co/functions/v1/podcast-streaming`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket conectado');
        this.notifyStateChange();
      };

      this.ws.onmessage = async (event) => {
        await this.handleWebSocketMessage(event);
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        this.notifyStateChange();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket erro:', error);
      };

    } catch (error) {
      console.error('Erro ao conectar:', error);
      throw error;
    }
  }

  async handleWebSocketMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      console.log('Mensagem recebida:', data);

      switch (data.type) {
        case 'connected':
          console.log('Conexão estabelecida');
          break;
          
        case 'status':
        case 'script_ready':
        case 'generating_segment':
          this.notifyStateChange();
          break;
          
        case 'audio_segment':
          await this.processAudioSegment(data);
          break;
          
        case 'generation_complete':
          this.notifyStateChange();
          break;
          
        case 'error':
          console.error('Erro do servidor:', data.message);
          break;
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  }

  async processAudioSegment(data: any) {
    if (!this.audioContext || !data.audioData) return;

    try {
      // Decode base64 audio data
      const binaryString = atob(data.audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Decode audio buffer
      const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
      
      // Add to queue
      this.audioQueue.push(audioBuffer);
      
      // Start playing if not already playing
      if (!this.isPlaying) {
        await this.playNextInQueue();
      }
      
    } catch (error) {
      console.error('Erro ao processar segmento de áudio:', error);
    }
  }

  async playNextInQueue() {
    if (!this.audioContext || this.audioQueue.length === 0) return;

    this.isPlaying = true;
    const audioBuffer = this.audioQueue.shift()!;
    
    this.currentSource = this.audioContext.createBufferSource();
    this.currentSource.buffer = audioBuffer;
    this.currentSource.connect(this.audioContext.destination);
    
    this.currentSource.onended = () => {
      if (this.audioQueue.length > 0) {
        this.playNextInQueue();
      } else {
        this.isPlaying = false;
        this.notifyStateChange();
      }
    };
    
    this.currentSource.start(0);
    this.startTime = this.audioContext.currentTime;
    this.notifyStateChange();
  }

  async startStream(userPreferences: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket não conectado');
    }

    this.ws.send(JSON.stringify({
      type: 'start_stream',
      preferences: userPreferences.preferences,
      genres: userPreferences.genres,
      artists: userPreferences.artists
    }));
  }

  pause() {
    if (this.currentSource && this.isPlaying) {
      this.currentSource.stop();
      this.currentSource = null;
      this.isPlaying = false;
      this.pausedTime = this.audioContext ? this.audioContext.currentTime - this.startTime : 0;
      this.notifyStateChange();
    }
  }

  resume() {
    if (!this.isPlaying && this.audioQueue.length > 0) {
      this.playNextInQueue();
    }
  }

  stop() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'stop_stream' }));
    }
    
    if (this.currentSource) {
      this.currentSource.stop();
      this.currentSource = null;
    }
    
    this.audioQueue = [];
    this.isPlaying = false;
    this.notifyStateChange();
  }

  setVolume(volume: number) {
    // Volume control would be implemented with GainNode
    this.notifyStateChange();
  }

  getState(): AudioPlayerState {
    const currentTime = this.audioContext ? 
      (this.isPlaying ? this.audioContext.currentTime - this.startTime : this.pausedTime) : 0;

    return {
      isPlaying: this.isPlaying,
      isGenerating: this.audioQueue.length > 0 || (this.ws?.readyState === WebSocket.OPEN && !this.isPlaying),
      currentTime,
      duration: 0, // Would be calculated based on total expected duration
      volume: 1,
      totalSegments: 0,
      generatedSegments: 0
    };
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  disconnect() {
    this.stop();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export function useRealTimeAudioPlayer() {
  const streamerRef = useRef<RealTimeAudioStreamer | null>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    isGenerating: false,
    currentTime: 0,
    duration: 0,
    volume: 1
  });

  const initializeStreamer = useCallback(async () => {
    if (!streamerRef.current) {
      streamerRef.current = new RealTimeAudioStreamer(setPlayerState);
      await streamerRef.current.connect();
    }
    return streamerRef.current;
  }, []);

  const startInfiniteStream = useCallback(async (userPreferences: any) => {
    try {
      const streamer = await initializeStreamer();
      await streamer.startStream(userPreferences);
    } catch (error) {
      console.error('Erro ao iniciar streaming:', error);
      throw error;
    }
  }, [initializeStreamer]);

  const pause = useCallback(() => {
    streamerRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    streamerRef.current?.resume();
  }, []);

  const stop = useCallback(() => {
    streamerRef.current?.stop();
  }, []);

  const setVolume = useCallback((volume: number) => {
    streamerRef.current?.setVolume(volume);
  }, []);

  const disconnect = useCallback(() => {
    streamerRef.current?.disconnect();
    streamerRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    playerState,
    startInfiniteStream,
    pause,
    resume,
    stop,
    setVolume,
    disconnect
  };
}