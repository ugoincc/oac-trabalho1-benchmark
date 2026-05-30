import { generateGaussianKernel } from './helpers/generateGaussKernel.js';
import { applyConvolution } from './helpers/applyConvolution.js';

const WIDTH = 2000;
const HEIGHT = 1500;
const KERNEL_SIZE = 9;
const SIGMA = 3;

const KERNEL = generateGaussianKernel(KERNEL_SIZE, SIGMA);

const src = Buffer.alloc(WIDTH * HEIGHT * 4, 0x80);
const dst = Buffer.alloc(WIDTH * HEIGHT * 4);

export function runCpuBound() {
  const cpuStart = process.cpuUsage();
  applyConvolution(src, dst, WIDTH, HEIGHT, KERNEL, 1);
  const cpuUsed = process.cpuUsage(cpuStart);
  return cpuUsed.user / 1000; // microseconds → ms
}

export const IMAGE_INFO = `${WIDTH}x${HEIGHT}px, kernel ${KERNEL_SIZE}x${KERNEL_SIZE}`;
