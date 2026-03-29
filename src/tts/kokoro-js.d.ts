declare module 'kokoro-js' {
  export interface KokoroLoadOptions {
    dtype?: 'fp32' | 'fp16' | 'q8' | 'q4' | 'q4f16';
    device?: 'wasm' | 'webgpu' | 'cpu' | null;
  }

  export interface KokoroVoice {
    name: string;
    language?: string;
  }

  export interface KokoroRawAudio {
    toWav(): Blob;
  }

  export interface KokoroTTSInstance {
    voices?: Record<string, KokoroVoice>;
    generate(
      text: string,
      options: {
        voice?: string;
        speed?: number;
      }
    ): Promise<KokoroRawAudio | Blob | ArrayBuffer | Uint8Array>;
  }

  export class KokoroTTS {
    static from_pretrained(modelId: string, options?: KokoroLoadOptions): Promise<KokoroTTSInstance>;
  }
}
