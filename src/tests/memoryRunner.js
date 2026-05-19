import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { runInvertColors } from "../functions/mainInvert.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const RUNS = 3;
const WARMUP = 2;
const REPORT_FILE = path.join(__dirname, "relatorio_memoria.txt");

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

async function runTest(testName, testFunction) {
  console.log(`\n>>> Iniciando Teste: ${testName} <<<`);
  let logContent = `=== RELATÓRIO: ${testName} ===\n`;
  logContent += `Data: ${new Date().toISOString()}\n`;
  logContent += `Config: ${RUNS} execuções, ${WARMUP} warmups\n\n`;

  process.stdout.write("Aquecendo (Warmup)... ");
  for (let i = 0; i < WARMUP; i++) {
    await testFunction(true);
  }
  console.log("OK.");

  const times = [];
  const mems = [];
  console.log("Executando medições...");

  for (let i = 0; i < RUNS; i++) {
    process.stdout.write(`Execução ${i + 1}/${RUNS}... `);
    const { duration, memDelta } = await testFunction(true);
    times.push(duration);
    mems.push(memDelta / 1024);
    console.log(`${fmt(duration, 2)} ms | heap: ${fmt(memDelta / 1024, 2)} KB`);
    logContent += `Run ${i + 1}: ${fmt(duration)} ms | heap delta: ${fmt(memDelta / 1024, 2)} KB\n`;
  }

  const timeStats = getStats(times);
  const memStats = getStats(mems);

  const resultSummary =
    `\n--- RESULTADOS FINAIS (${testName}) ---\n` +
    `[TEMPO]\n` +
    `  Média:         ${timeStats.mean} ms\n` +
    `  Desvio Padrão: ±${timeStats.stdDev} ms\n` +
    `  Mínimo:        ${timeStats.min} ms\n` +
    `  Máximo:        ${timeStats.max} ms\n` +
    `[MEMÓRIA (heap delta)]\n` +
    `  Média:         ${memStats.mean} KB\n` +
    `  Desvio Padrão: ±${memStats.stdDev} KB\n` +
    `  Mínimo:        ${memStats.min} KB\n` +
    `  Máximo:        ${memStats.max} KB\n` +
    `-----------------------------------\n\n`;

  console.log(resultSummary);
  logContent += resultSummary;

  return logContent;
}

export async function main() {
  fs.writeFileSync(
    REPORT_FILE,
    "RELATÓRIO DE PERFORMANCE - MEMÓRIA\n===================================\n\n" +
    getSystemSpecs()
  );

  try {
    const invertResults = await runTest("Inversão de Cores", runInvertColors);
    fs.appendFileSync(REPORT_FILE, invertResults);

    console.log(`\n[SUCESSO] Relatório salvo em: ${REPORT_FILE}`);
  } catch (error) {
    console.error("Erro durante os testes:", error);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
