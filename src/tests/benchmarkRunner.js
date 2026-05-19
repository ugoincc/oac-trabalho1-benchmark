import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { SIZES, runBenchmark } from "../functions/mainBenchmark.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RUNS   = 5;
const WARMUP = 1;
const REPORT_FILE = path.join(__dirname, "relatorio_benchmark.txt");

const fmt    = (n, d = 2) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

function getStats(arr) {
  const n    = arr.length;
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  return {
    mean,
    stdDev: Math.sqrt(variance),
    min: Math.min(...arr),
    max: Math.max(...arr),
  };
}

function getSystemSpecs() {
  const cpus = os.cpus();
  const cpu  = cpus[0];
  return (
    `=== ESPECIFICAÇÕES DO SISTEMA ===\n` +
    `SO:        ${os.type()} ${os.release()} (${os.arch()})\n` +
    `CPU:       ${cpu.model.trim()}\n` +
    `Núcleos:   ${cpus.length} lógicos\n` +
    `RAM Total: ${fmt(os.totalmem() / 1024 ** 3)} GB\n` +
    `RAM Livre: ${fmt(os.freemem()  / 1024 ** 3)} GB\n` +
    `=================================\n\n`
  );
}

function separator(char = "-", len = 72) {
  return char.repeat(len) + "\n";
}

export async function main() {
  let report =
    "RELATÓRIO DE BENCHMARK - THROUGHPUT DE MEMÓRIA\n" +
    separator("=") + "\n" +
    getSystemSpecs() +
    `Config: ${RUNS} execuções por tamanho, ${WARMUP} warmup\n` +
    `Método: inversão de cores (leitura + escrita do buffer inteiro)\n\n`;

  const tableHeader =
    `${"Tamanho".padEnd(20)} | ${"Throughput Médio".padEnd(17)} | ${"DP".padEnd(12)} | ${"Mínimo".padEnd(12)} | Máximo\n` +
    separator("-");

  let tableBody = "";

  for (const sizeConfig of SIZES) {
    console.log(`\n>>> ${sizeConfig.label} (${sizeConfig.reps} reps/run) <<<`);

    process.stdout.write("  Warmup... ");
    for (let i = 0; i < WARMUP; i++) runBenchmark(sizeConfig);
    console.log("OK.");

    const throughputs = [];
    for (let i = 0; i < RUNS; i++) {
      process.stdout.write(`  Run ${i + 1}/${RUNS}... `);
      const { duration, throughputGBs } = runBenchmark(sizeConfig);
      throughputs.push(throughputGBs);
      console.log(`${fmt(throughputGBs)} GB/s  (${fmt(duration)} ms)`);
    }

    const stats = getStats(throughputs);
    const row =
      `${sizeConfig.label.padEnd(20)} | ` +
      `${(fmt(stats.mean) + " GB/s").padEnd(17)} | ` +
      `±${(fmt(stats.stdDev) + " GB/s").padEnd(11)} | ` +
      `${(fmt(stats.min)  + " GB/s").padEnd(12)} | ` +
      `${fmt(stats.max)} GB/s\n`;

    tableBody += row;
  }

  report += separator("=");
  report += "RESUMO DE THROUGHPUT POR NÍVEL DE CACHE\n";
  report += separator("=");
  report += tableHeader;
  report += tableBody;
  report += separator("-");

  console.log("\n" + separator("="));
  console.log("RESUMO FINAL:");
  console.log(separator("="));
  console.log(tableHeader + tableBody);

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`[SUCESSO] Relatório salvo em: ${REPORT_FILE}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
