import { concatAudioBlobs, concatAudioBlobsToPcm } from './concatAudioBlobs';
import { encodeMp3FromPcm } from './encodeMp3';

export type ExportFormat = 'wav' | 'mp3';

export const MP3_FALLBACK_WARNING = 'MP3 unavailable in this runtime; WAV provided instead.';

export async function buildFullAudioExport(blobs: Blob[], exportFormat: ExportFormat): Promise<{ blob: Blob; warning: string | null }> {
  const wavBlob = await concatAudioBlobs(blobs);
  if (exportFormat !== 'mp3') {
    return { blob: wavBlob, warning: null };
  }

  const decodedPcm = await concatAudioBlobsToPcm(blobs);
  const mp3Blob = await encodeMp3FromPcm(decodedPcm);
  if (!mp3Blob) {
    return { blob: wavBlob, warning: MP3_FALLBACK_WARNING };
  }

  return { blob: mp3Blob, warning: null };
}
