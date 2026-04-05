import * as lamejsImport from 'lamejs';
import type { DecodedPcmAudio } from './concatAudioBlobs';

const MP3_MIME = 'audio/mpeg';
const DEFAULT_BIT_RATE_KBPS = 128;
const FRAME_SIZE = 1152;

export const MP3_FALLBACK_WARNING = 'MP3 unavailable in this runtime; WAV provided instead.';

type Mp3EncoderInstance = {
  encodeBuffer: (left: Int16Array, right?: Int16Array) => Int8Array;
  flush: () => Int8Array;
};

type LameJsModule = {
  Mp3Encoder: new (channels: number, sampleRate: number, kbps: number) => Mp3EncoderInstance;
};

export type Mp3CapabilityProbe = {
  available: boolean;
  code: 'ok' | 'module_shape_invalid' | 'encoder_init_failed' | 'encoder_runtime_failed';
  reason: string;
  technicalDetail?: string;
};

let cachedProbe: Mp3CapabilityProbe | null = null;
let lastMp3Diagnostic: Mp3CapabilityProbe | null = null;

function float32ToInt16(samples: Float32Array): Int16Array {
  const output = new Int16Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index] ?? 0));
    output[index] = clamped < 0 ? Math.round(clamped * 0x8000) : Math.round(clamped * 0x7fff);
  }
  return output;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function mapEncoderError(error: unknown, stage: 'construction' | 'runtime'): Mp3CapabilityProbe {
  const message = getErrorMessage(error);

  if (message.includes('MPEGMode is not defined')) {
    return {
      available: false,
      code: 'encoder_init_failed',
      reason: 'The MP3 encoder loaded but failed due to an incompatible runtime/global symbol mismatch.',
      technicalDetail: message,
    };
  }

  return {
    available: false,
    code: stage === 'construction' ? 'encoder_init_failed' : 'encoder_runtime_failed',
    reason: stage === 'construction'
      ? 'The MP3 encoder constructor failed in this runtime.'
      : 'The MP3 encoder failed while encoding audio frames.',
    technicalDetail: message,
  };
}

function resolveLameJsModule(): LameJsModule | null {
  const candidate = (lamejsImport as { default?: unknown }).default ?? lamejsImport;
  if (typeof candidate === 'object' && candidate !== null && 'Mp3Encoder' in candidate) {
    return candidate as LameJsModule;
  }

  return null;
}

export function probeMp3EncodingCapability(): Mp3CapabilityProbe {
  if (cachedProbe) {
    return cachedProbe;
  }

  const lamejs = resolveLameJsModule();
  if (!lamejs) {
    cachedProbe = {
      available: false,
      code: 'module_shape_invalid',
      reason: 'The bundled lamejs module is unavailable or has an unexpected export shape.',
    };
    return cachedProbe;
  }

  try {
    const encoder = new lamejs.Mp3Encoder(1, 24000, DEFAULT_BIT_RATE_KBPS);
    encoder.encodeBuffer(new Int16Array(FRAME_SIZE));
    encoder.flush();
    cachedProbe = { available: true, code: 'ok', reason: 'MP3 encoder probe passed.' };
    return cachedProbe;
  } catch (error) {
    cachedProbe = mapEncoderError(error, 'construction');
    return cachedProbe;
  }
}

export function getLastMp3EncodingDiagnostic(): Mp3CapabilityProbe | null {
  return lastMp3Diagnostic;
}

export async function encodeMp3FromPcm(decodedAudio: DecodedPcmAudio): Promise<Blob | null> {
  const capability = probeMp3EncodingCapability();
  if (!capability.available) {
    lastMp3Diagnostic = capability;
    return null;
  }

  const lamejs = resolveLameJsModule();
  if (!lamejs) {
    lastMp3Diagnostic = {
      available: false,
      code: 'module_shape_invalid',
      reason: 'The bundled lamejs module is unavailable or has an unexpected export shape.',
    };
    return null;
  }

  const channelCount = Math.min(2, Math.max(1, decodedAudio.channels.length));
  const leftChannel = float32ToInt16(decodedAudio.channels[0] ?? new Float32Array(0));
  const rightChannel = channelCount > 1
    ? float32ToInt16(decodedAudio.channels[1] ?? decodedAudio.channels[0] ?? new Float32Array(0))
    : undefined;

  try {
    const encoder = new lamejs.Mp3Encoder(channelCount, decodedAudio.sampleRate, DEFAULT_BIT_RATE_KBPS);
    const chunks: BlobPart[] = [];

    for (let offset = 0; offset < leftChannel.length; offset += FRAME_SIZE) {
      const leftChunk = leftChannel.subarray(offset, Math.min(offset + FRAME_SIZE, leftChannel.length));
      const rightChunk = rightChannel?.subarray(offset, Math.min(offset + FRAME_SIZE, rightChannel.length));
      const encodedChunk = channelCount > 1
        ? encoder.encodeBuffer(leftChunk, rightChunk)
        : encoder.encodeBuffer(leftChunk);

      if (encodedChunk.length > 0) {
        chunks.push(Uint8Array.from(encodedChunk));
      }
    }

    const flushChunk = encoder.flush();
    if (flushChunk.length > 0) {
      chunks.push(Uint8Array.from(flushChunk));
    }

    lastMp3Diagnostic = null;
    return new Blob(chunks, { type: MP3_MIME });
  } catch (error) {
    lastMp3Diagnostic = mapEncoderError(error, 'runtime');
    if (import.meta.env.DEV) {
      console.debug('[tts][mp3] MP3 encoder failed; falling back to WAV.', lastMp3Diagnostic);
    }
    return null;
  }
}
