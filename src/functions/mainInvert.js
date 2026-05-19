import fs from "fs";
import { PNG } from "pngjs";
import path from "path";
import { performance } from "perf_hooks";
import { fileURLToPath } from "url";
import { invertColors } from "./helpers/invertColors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT_FILE = path.join(__dirname, "../inputs/italy.png");
const OUTPUT_FILE = path.join(__dirname, "../outputs/saidaInvertSequencial.png");

function runInvertColors(silent = false) {
  return new Promise((resolve, reject) => {
    const readStream = fs.createReadStream(INPUT_FILE);

    const png = new PNG();

    png.on("parsed", () => {
      if (!silent) {
        console.log(`\n[Invert] Imagem carregada: ${INPUT_FILE}`);
        console.log(`Dimensões: ${png.width}x${png.height}`);
      }

      const outputBuffer = Buffer.alloc(png.data.length);

      const memBefore = process.memoryUsage().heapUsed;
      const start = performance.now();

      invertColors(png.data, outputBuffer, png.width, png.height);

      const end = performance.now();
      const memAfter = process.memoryUsage().heapUsed;

      const duration = end - start;
      const memDelta = memAfter - memBefore;

      if (!silent) {
        console.log(`Tempo Inversão: ${duration.toFixed(4)} ms`);
        console.log(`Heap alocada:  ${(memDelta / 1024).toFixed(2)} KB`);
      }

      png.data = outputBuffer;
      png.pack()
        .pipe(fs.createWriteStream(OUTPUT_FILE))
        .on("finish", () => resolve({ duration, memDelta }));
    });

    png.on("error", (err) => reject(err));
    readStream.on("error", (err) => reject(err));
    readStream.pipe(png);
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runInvertColors().catch(console.error);
}

export { runInvertColors };
