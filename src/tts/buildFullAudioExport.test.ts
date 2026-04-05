import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DecodedPcmAudio } from './concatAudioBlobs';

const concatAudioBlobsMock = vi.fn();
const concatAudioBlobsToPcmMock = vi.fn();
const encodeMp3FromPcmMock = vi.fn();

vi.mock('./concatAudioBlobs', () => ({
  concatAudioBlobs: (...args: unknown[]) => concatAudioBlobsMock(...args),
  concatAudioBlobsToPcm: (...args: unknown[]) => concatAudioBlobsToPcmMock(...args),
}));

vi.mock('./encodeMp3', () => ({
  encodeMp3FromPcm: (...args: unknown[]) => encodeMp3FromPcmMock(...args),
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

    const { buildFullAudioExport, MP3_FALLBACK_WARNING } = await import('./buildFullAudioExport');
    const result = await buildFullAudioExport(sourceBlobs, 'mp3');

    expect(result).toEqual({
      blob: wavBlob,
      warning: MP3_FALLBACK_WARNING,
    });
  });
});
