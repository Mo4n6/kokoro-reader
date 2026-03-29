declare module 'kokoro-js' {
  export interface KokoroCreateOptions {
    model: string;
    device: 'wasm' | 'webgpu';
  }

  export interface KokoroVoice {
    id: string;
    name: string;
    language?: string;
  }

  export interface KokoroEngine {
    listVoices(): Promise<KokoroVoice[]>;
    synthesize(
      text: string,
      options: {
        voice?: string;
        speed?: number;
        pitch?: number;
        format?: string;
      }
    ): Promise<Blob | ArrayBuffer | Uint8Array>;
  }

  export function createKokoroTTS(options: KokoroCreateOptions): Promise<KokoroEngine>;
}
