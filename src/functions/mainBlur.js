import fs from "fs";
import { PNG } from "pngjs";
import path from "path";
import { performance } from "perf_hooks";
import { fileURLToPath } from "url";
import { generateGaussianKernel } from "./helpers/generateGaussKernel.js";
import { applyConvolution } from "./helpers/applyConvolution.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

//Utilizar kernels impares e sigmas = 1/3 deste valor
const kernelSize = 9;
const sigma = 3;
const BIG_BLUR_KERNEL = generateGaussianKernel(kernelSize, sigma);

const INPUT_FILE = path.join(__dirname, "../inputs/italy.png");
const OUTPUT_FILE = path.join(__dirname, "../outputs/saidaBlurSequencial.png");

function runSequentialBlur(silent = false) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(INPUT_FILE);

    readStream.on("error", (err) => reject(err));

    const png = new PNG();

    png.on("parsed", () => {
      if (!silent) {
        console.log(`\n[Sequencial] Imagem carregada: ${INPUT_FILE}`);
        console.log(`Dimensões: ${png.width}x${png.height}`);
      }

      const outputBuffer = Buffer.alloc(png.data.length);
      png.data.copy(outputBuffer);

      const start = performance.now();

      applyConvolution(
        png.data,
        outputBuffer,
        png.width,
        png.height,
        BIG_BLUR_KERNEL,
        1
      );

      const end = performance.now();
      const duration = end - start;

      if (!silent) {
        console.log(`Tempo Sequencial (Blur): ${duration.toFixed(4)} ms`);
      }

      png.data = outputBuffer;
      png.pack()
        .pipe(fs.createWriteStream(OUTPUT_FILE))
        .on("finish", () => resolve(duration));
    });

    png.on("error", (err) => reject(err));

    readStream.on("error", (err) => reject(err));
    readStream.pipe(png);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSequentialBlur().catch(console.error);
}

export { runSequentialBlur };
