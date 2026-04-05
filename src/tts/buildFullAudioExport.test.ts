import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DecodedPcmAudio } from './concatAudioBlobs';

const concatAudioBlobsMock = vi.fn();
const concatAudioBlobsToPcmMock = vi.fn();
const encodeMp3FromPcmMock = vi.fn();
const getLastMp3EncodingDiagnosticMock = vi.fn();

vi.mock('./concatAudioBlobs', () => ({
  concatAudioBlobs: (...args: unknown[]) => concatAudioBlobsMock(...args),
  concatAudioBlobsToPcm: (...args: unknown[]) => concatAudioBlobsToPcmMock(...args),
}));

vi.mock('./encodeMp3', () => ({
  MP3_FALLBACK_WARNING: 'MP3 unavailable in this runtime; WAV provided instead.',
  encodeMp3FromPcm: (...args: unknown[]) => encodeMp3FromPcmMock(...args),
  getLastMp3EncodingDiagnostic: (...args: unknown[]) => getLastMp3EncodingDiagnosticMock(...args),
}));

describe('buildFullAudioExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns WAV with warning when MP3 encoding is unavailable', async () => {
    const wavBlob = new Blob(['wav'], { type: 'audio/wav' });
    const decodedPcm: DecodedPcmAudio = {
      channels: [new Float32Array([0.1, -0.1])],
      sampleRate: 24000,
    };
    const sourceBlobs = [new Blob(['segment'], { type: 'audio/wav' })];

    concatAudioBlobsMock.mockResolvedValue(wavBlob);
    concatAudioBlobsToPcmMock.mockResolvedValue(decodedPcm);
    encodeMp3FromPcmMock.mockResolvedValue(null);
    getLastMp3EncodingDiagnosticMock.mockReturnValue({
      code: 'encoder_runtime_failed',
      reason: 'The MP3 encoder failed while encoding audio frames.',
      technicalDetail: 'encode failed',
    });

    const { buildFullAudioExport } = await import('./buildFullAudioExport');
    const result = await buildFullAudioExport(sourceBlobs, 'mp3');

    expect(result).toEqual({
      blob: wavBlob,
      warning: 'MP3 unavailable in this runtime; WAV provided instead. (encoder_runtime_failed: encode failed)',
    });
  });
});
