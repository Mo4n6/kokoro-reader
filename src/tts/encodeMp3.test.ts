import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DecodedPcmAudio } from './concatAudioBlobs';

const decodedAudio: DecodedPcmAudio = {
  channels: [new Float32Array([0, 0.25, -0.25, 0.5])],
  sampleRate: 24000,
};

describe('encodeMp3FromPcm', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('returns null when encoder constructor throws', async () => {
    vi.doMock('lamejs', () => ({
      default: {
        Mp3Encoder: class {
          constructor() {
            throw new Error('constructor failed');
          }
        },
      },
    }));

    const { encodeMp3FromPcm } = await import('./encodeMp3');
    await expect(encodeMp3FromPcm(decodedAudio)).resolves.toBeNull();
  });

  it('returns null when encodeBuffer throws at runtime', async () => {
    vi.doMock('lamejs', () => ({
      default: {
        Mp3Encoder: class {
          encodeBuffer(): Int8Array {
            throw new Error('encode failed');
          }

          flush(): Int8Array {
            return new Int8Array(0);
          }
        },
      },
    }));

    const { encodeMp3FromPcm } = await import('./encodeMp3');
    await expect(encodeMp3FromPcm(decodedAudio)).resolves.toBeNull();
  });
});
