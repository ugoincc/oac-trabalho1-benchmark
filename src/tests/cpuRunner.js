import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { runCpuBound, IMAGE_INFO } from '../functions/cpuBound.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNS = 5;
const WARMUP = 2;
const REPORT_FILE = path.join(__dirname, 'relatorio_cpu.txt');

const fmt = (n, d = 4) =>
  n.toLocaleString('pt-BR', {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

function getStats(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
  return {
    mean,
    stdDev: Math.sqrt(variance),
    min: Math.min(...arr),
    max: Math.max(...arr),
  };
}

function getSystemSpecs() {
  const cpus = os.cpus();
  return (
    `=== ESPECIFICAÇÕES DO SISTEMA ===\n` +
    `SO:        ${os.type()} ${os.release()} (${os.arch()})\n` +
    `CPU:       ${cpus[0].model.trim()}\n` +
    `Núcleos:   ${cpus.length} lógicos\n` +
    `RAM Total: ${fmt(os.totalmem() / 1024 ** 3, 2)} GB\n` +
    `=================================\n\n`
  );
}

export async function main() {
  console.log('\n=== PROGRAMA CPU-BOUND: Convolução Gaussiana ===');
  console.log(`Imagem sintética: ${IMAGE_INFO}`);
  console.log(`Config: ${RUNS} execuções, ${WARMUP} warmups\n`);

  process.stdout.write('Warmup... ');
  for (let i = 0; i < WARMUP; i++) runCpuBound();
  console.log('OK.\n');

  const times = [];
  for (let i = 0; i < RUNS; i++) {
    process.stdout.write(`Run ${i + 1}/${RUNS}... `);
    const cpuTimeMs = runCpuBound();
    times.push(cpuTimeMs);
    console.log(`${fmt(cpuTimeMs, 2)} ms (CPU)`);
  }

  const s = getStats(times);
  const summary =
    `\n--- RESULTADOS FINAIS ---\n` +
    `[TEMPO DE CPU]\n` +
    `  Média:         ${fmt(s.mean)} ms\n` +
    `  Desvio Padrão: ±${fmt(s.stdDev)} ms\n` +
    `  Mínimo:        ${fmt(s.min)} ms\n` +
    `  Máximo:        ${fmt(s.max)} ms\n` +
    `-------------------------\n`;

  console.log(summary);

  const report =
    `RELATÓRIO - PROGRAMA CPU-BOUND (Convolução Gaussiana)\n` +
    `======================================================\n\n` +
    getSystemSpecs() +
    `Imagem sintética: ${IMAGE_INFO}\n` +
    `Kernel: ${9}x${9}, sigma=${3}\n` +
    `Config: ${RUNS} execuções, ${WARMUP} warmups\n` +
    `Ferramenta: process.cpuUsage() — tempo de CPU em modo usuário\n\n` +
    times.map((t, i) => `Run ${i + 1}: ${fmt(t)} ms`).join('\n') +
    summary;

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`[SUCESSO] Relatório salvo em: ${REPORT_FILE}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
