import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { runSequentialBlur } from "../functions/mainBlur.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RUNS = 3;
const WARMUP = 2;
const REPORT_FILE = path.join(__dirname, "relatorio_sequencial.txt");

const fmt = (n, d = 4) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

function getStats(arr) {
  const n = arr.length;
  const mean = arr.reduce((a, b) => a + b, 0) / n;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  return {
    mean: fmt(mean),
    stdDev: fmt(Math.sqrt(variance)),
    min: fmt(Math.min(...arr)),
    max: fmt(Math.max(...arr)),
  };
}

async function runTest(testName, testFunction) {
  console.log(`\n>>> Iniciando Teste: ${testName} <<<`);
  let logContent = `=== RELATÓRIO: ${testName} ===\n`;
  logContent += `Data: ${new Date().toISOString()}\n`;
  logContent += `Config: ${RUNS} execuções, ${WARMUP} warmups\n\n`;

  // Warmup
  process.stdout.write("Aquecendo (Warmup)... ");
  for (let i = 0; i < WARMUP; i++) {
    await testFunction(true);
  }
  console.log("OK.");

  // Medições
  const times = [];
  console.log("Executando medições...");

  for (let i = 0; i < RUNS; i++) {
    process.stdout.write(`Execução ${i + 1}/${RUNS}... `);
    const duration = await testFunction(true); // true para silent mode
    times.push(duration);
    console.log(`${fmt(duration, 2)} ms`);
    logContent += `Run ${i + 1}: ${fmt(duration)} ms\n`;
  }

  // Estatísticas
  const stats = getStats(times);
  const resultSummary =
    `\n--- RESULTADOS FINAIS (${testName}) ---\n` +
    `Média:         ${stats.mean} ms\n` +
    `Desvio Padrão: ±${stats.stdDev} ms\n` +
    `Mínimo:        ${stats.min} ms\n` +
    `Máximo:        ${stats.max} ms\n` +
    `-----------------------------------\n\n`;

  console.log(resultSummary);
  logContent += resultSummary;

  return logContent;
}

function getSystemSpecs() {
  const cpus = os.cpus();
  const cpu = cpus[0];
  return (
    `=== ESPECIFICAÇÕES DO SISTEMA ===\n` +
    `SO:           ${os.type()} ${os.release()} (${os.arch()})\n` +
    `CPU:          ${cpu.model.trim()}\n` +
    `Núcleos:      ${cpus.length} lógicos\n` +
    `RAM Total:    ${fmt(os.totalmem() / 1024 ** 3, 2)} GB\n` +
    `RAM Livre:    ${fmt(os.freemem() / 1024 ** 3, 2)} GB\n` +
    `=================================\n\n`
  );
}

export async function main() {
  fs.writeFileSync(
    REPORT_FILE,
    "RELATÓRIO DE PERFORMANCE SEQUENCIAL\n===================================\n\n" +
    getSystemSpecs()
  );

  try {
    // 1. Teste Blur
    const blurResults = await runTest("Blur Sequencial", runSequentialBlur);
    fs.appendFileSync(REPORT_FILE, blurResults);

    console.log(`\n[SUCESSO] Relatório salvo em: ${REPORT_FILE}`);
  } catch (error) {
    console.error("Erro durante os testes:", error);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
