/**
 * @param {Buffer} src
 * @param {Buffer} dst
 * @param {number} width
 * @param {number} height
 */
function invertColors(src, dst, width, height) {
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    dst[idx]     = 255 - src[idx];
    dst[idx + 1] = 255 - src[idx + 1];
    dst[idx + 2] = 255 - src[idx + 2];
    dst[idx + 3] = src[idx + 3];
  }
}

export { invertColors };
