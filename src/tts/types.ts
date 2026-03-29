export interface TTSSegment {
  id: string;
  text: string;
}

export interface TTSVoice {
  id: string;
  name: string;
  language?: string;
  provider: string;
}

export interface TTSSynthesisOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  format?: string;
}

export interface TTSSynthesisResult {
  segmentId: string;
  blob: Blob;
  url: string;
}

export interface TTSProvider {
  listVoices(): Promise<TTSVoice[]>;
  synthesize(segment: TTSSegment, options?: TTSSynthesisOptions): Promise<TTSSynthesisResult>;
  warmup(): Promise<void>;
}
