import { invertColors } from './helpers/invertColors.js';

export const SIZES = [
  { label: '32 KB  (L1 cache)', bytes: 32 * 1024, reps: 5000 },
  { label: '512 KB (L2 cache)', bytes: 512 * 1024, reps: 500 },
  { label: '8 MB   (L3 cache)', bytes: 8 * 1024 * 1024, reps: 50 },
  { label: '128 MB (RAM)      ', bytes: 128 * 1024 * 1024, reps: 3 },
];

// @returns {{ cpuTimeMs: number, throughputGBs: number }}
export function runMemoryBound({ bytes, reps }) {
  const pixels = bytes / 4;
  const src = Buffer.alloc(bytes, 0x80);
  const dst = Buffer.alloc(bytes);

  const cpuStart = process.cpuUsage();
  for (let i = 0; i < reps; i++) {
    invertColors(src, dst, pixels, 1);
  }
  const cpuUsed = process.cpuUsage(cpuStart);
  const cpuTimeMs = cpuUsed.user / 1000;

  const totalBytes = bytes * 2 * reps; // read + write
  const throughputGBs = totalBytes / 1e9 / (cpuTimeMs / 1000);

  return { cpuTimeMs, throughputGBs };
}
