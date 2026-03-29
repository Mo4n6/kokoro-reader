import { describe, expect, it } from 'vitest';
import { classifyTTSFailure } from './errors';

describe('classifyTTSFailure', () => {
  it('maps huggingface single-token resolve URLs to model id invalid message', () => {
    const error = new Error('Failed to fetch https://huggingface.co/q8/resolve/main/model.onnx');

    expect(classifyTTSFailure(error)).toMatchObject({
      code: 'KOKORO_MODEL_ID_INVALID',
      message: "KOKORO_MODEL_ID_INVALID: Expected model repo id like owner/name, got 'q8'.",
    });
  });

  it('keeps fetch failures as model fetch errors for valid owner/name URLs', () => {
    const error = new Error('Failed to fetch https://huggingface.co/onnx-community/Kokoro-82M-ONNX/resolve/main/model.onnx');

    expect(classifyTTSFailure(error)).toMatchObject({
      code: 'KOKORO_MODEL_FETCH_FAILED',
    });
  });
});
