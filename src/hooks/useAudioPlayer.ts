import { useCallback, useRef, useState } from 'react';

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private onStateChange?: (state: AudioPlayerState) => void;

  constructor(onStateChange?: (state: AudioPlayerState) => void) {
    this.onStateChange = onStateChange;
  }

  async initializeContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  async playAudioFromUrl(url: string) {
    await this.initializeContext();
    
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    this.currentAudio = new Audio(url);
    this.currentAudio.crossOrigin = 'anonymous';
    
    this.currentAudio.addEventListener('loadedmetadata', () => {
      this.notifyStateChange();
    });

    this.currentAudio.addEventListener('timeupdate', () => {
      this.notifyStateChange();
    });

    this.currentAudio.addEventListener('ended', () => {
      this.notifyStateChange();
    });

    this.currentAudio.addEventListener('error', (e) => {
      console.error('Erro ao reproduzir áudio:', e);
    });

    try {
      await this.currentAudio.play();
      this.notifyStateChange();
    } catch (error) {
      console.error('Erro ao iniciar reprodução:', error);
    }
  }

  async playAudioFromBlob(blob: Blob) {
    const url = URL.createObjectURL(blob);
    await this.playAudioFromUrl(url);
  }

  async generateDemoAudio(): Promise<Blob> {
    // Generate a simple demo audio using Web Audio API
    await this.initializeContext();
    
    if (!this.audioContext) {
      throw new Error('AudioContext não inicializado');
    }

    const sampleRate = this.audioContext.sampleRate;
    const duration = 10; // 10 seconds
    const bufferSize = sampleRate * duration;
    
    const audioBuffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    // Generate a simple tone with fade in/out
    for (let i = 0; i < bufferSize; i++) {
      const time = i / sampleRate;
      let amplitude = 0.3;
      
      // Fade in/out
      if (time < 1) amplitude *= time;
      if (time > duration - 1) amplitude *= (duration - time);
      
      // Generate a pleasant tone (440Hz + harmonics)
      channelData[i] = amplitude * (
        Math.sin(2 * Math.PI * 440 * time) * 0.5 +
        Math.sin(2 * Math.PI * 220 * time) * 0.3 +
        Math.sin(2 * Math.PI * 880 * time) * 0.2
      );
    }

    // Convert AudioBuffer to WAV blob
    const wavBlob = this.audioBufferToWav(audioBuffer);
    return wavBlob;
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channelData = buffer.getChannelData(0);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // PCM data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  pause() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.notifyStateChange();
    }
  }

  resume() {
    if (this.currentAudio) {
      this.currentAudio.play();
      this.notifyStateChange();
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.notifyStateChange();
    }
  }

  setVolume(volume: number) {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0, Math.min(1, volume));
      this.notifyStateChange();
    }
  }

  seekTo(time: number) {
    if (this.currentAudio) {
      this.currentAudio.currentTime = time;
      this.notifyStateChange();
    }
  }

  getState(): AudioPlayerState {
    if (!this.currentAudio) {
      return {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1
      };
    }

    return {
      isPlaying: !this.currentAudio.paused,
      currentTime: this.currentAudio.currentTime,
      duration: this.currentAudio.duration || 0,
      volume: this.currentAudio.volume
    };
  }

  private notifyStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  destroy() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export function useAudioPlayer() {
  const audioManagerRef = useRef<AudioManager | null>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1
  });

  const initializePlayer = useCallback(() => {
    if (!audioManagerRef.current) {
      audioManagerRef.current = new AudioManager(setPlayerState);
    }
    return audioManagerRef.current;
  }, []);

  const playDemo = useCallback(async () => {
    const manager = initializePlayer();
    try {
      const demoBlob = await manager.generateDemoAudio();
      await manager.playAudioFromBlob(demoBlob);
    } catch (error) {
      console.error('Erro ao reproduzir demo:', error);
    }
  }, [initializePlayer]);

  const playFromUrl = useCallback(async (url: string) => {
    const manager = initializePlayer();
    await manager.playAudioFromUrl(url);
  }, [initializePlayer]);

  const playFromBlob = useCallback(async (blob: Blob) => {
    const manager = initializePlayer();
    await manager.playAudioFromBlob(blob);
  }, [initializePlayer]);

  const pause = useCallback(() => {
    audioManagerRef.current?.pause();
  }, []);

  const resume = useCallback(() => {
    audioManagerRef.current?.resume();
  }, []);

  const stop = useCallback(() => {
    audioManagerRef.current?.stop();
  }, []);

  const setVolume = useCallback((volume: number) => {
    audioManagerRef.current?.setVolume(volume);
  }, []);

  const seekTo = useCallback((time: number) => {
    audioManagerRef.current?.seekTo(time);
  }, []);

  return {
    playerState,
    playDemo,
    playFromUrl,
    playFromBlob,
    pause,
    resume,
    stop,
    setVolume,
    seekTo
  };
}