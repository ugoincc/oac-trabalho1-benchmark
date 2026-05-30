import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { SIZES, runMemoryBound } from '../functions/memoryBound.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RUNS = 5;
const WARMUP = 1;
const REPORT_FILE = path.join(__dirname, 'relatorio_memoria.txt');

const fmt = (n, d = 2) =>
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
    `RAM Total: ${fmt(os.totalmem() / 1024 ** 3)} GB\n` +
    `=================================\n\n`
  );
}

function separator(char = '-', len = 72) {
  return char.repeat(len) + '\n';
}

export async function main() {
  console.log(
    '\n=== PROGRAMA MEMORY-BOUND: Inversão de Cores por Nível de Cache ===',
  );
  console.log(`Config: ${RUNS} execuções por tamanho, ${WARMUP} warmup\n`);

  let tableBody = '';
  let detailsBlock = '';
  const tableHeader =
    `${'Tamanho'.padEnd(20)} | ${'CPU Médio'.padEnd(14)} | ${'Throughput Médio'.padEnd(17)} | ${'DP'.padEnd(12)} | ${'Mínimo'.padEnd(12)} | Máximo\n` +
    separator('-');

  for (const sizeConfig of SIZES) {
    console.log(`\n>>> ${sizeConfig.label} (${sizeConfig.reps} reps/run) <<<`);

    process.stdout.write('  Warmup... ');
    for (let i = 0; i < WARMUP; i++) runMemoryBound(sizeConfig);
    console.log('OK.');

    const throughputs = [];
    const cpuTimes = [];
    let runsDetail = '';

    for (let i = 0; i < RUNS; i++) {
      process.stdout.write(`  Run ${i + 1}/${RUNS}... `);
      const { cpuTimeMs, throughputGBs } = runMemoryBound(sizeConfig);
      throughputs.push(throughputGBs);
      cpuTimes.push(cpuTimeMs);
      console.log(`${fmt(throughputGBs)} GB/s  (${fmt(cpuTimeMs)} ms CPU)`);
      runsDetail += `  Run ${i + 1}: ${fmt(cpuTimeMs)} ms (CPU) → ${fmt(throughputGBs)} GB/s\n`;
    }

    const st = getStats(throughputs);
    const sc = getStats(cpuTimes);

    tableBody +=
      `${sizeConfig.label.padEnd(20)} | ` +
      `${(fmt(sc.mean) + ' ms').padEnd(14)} | ` +
      `${(fmt(st.mean) + ' GB/s').padEnd(17)} | ` +
      `±${(fmt(st.stdDev) + ' GB/s').padEnd(11)} | ` +
      `${(fmt(st.min) + ' GB/s').padEnd(12)} | ` +
      `${fmt(st.max)} GB/s\n`;

    detailsBlock +=
      `\n--- ${sizeConfig.label.trim()} ---\n` +
      runsDetail +
      `[TEMPO DE CPU] Média: ${fmt(sc.mean)} ms  ±${fmt(sc.stdDev)} ms  Min: ${fmt(sc.min)} ms  Max: ${fmt(sc.max)} ms\n` +
      `[THROUGHPUT]   Média: ${fmt(st.mean)} GB/s  ±${fmt(st.stdDev)} GB/s  Min: ${fmt(st.min)} GB/s  Max: ${fmt(st.max)} GB/s\n`;
  }

  console.log('\n' + separator('='));
  console.log('RESUMO — THROUGHPUT POR NÍVEL DE CACHE:');
  console.log(separator('=') + tableHeader + tableBody);

  const report =
    `RELATÓRIO - PROGRAMA MEMORY-BOUND (Throughput de Memória)\n` +
    `==========================================================\n\n` +
    getSystemSpecs() +
    `Config: ${RUNS} execuções por tamanho, ${WARMUP} warmup\n` +
    `Método: inversão de cores (leitura + escrita do buffer inteiro)\n` +
    `Ferramenta: process.cpuUsage() — tempo de CPU em modo usuário\n\n` +
    separator('=') +
    'DETALHES POR NÍVEL DE CACHE\n' +
    separator('=') +
    detailsBlock +
    '\n' +
    separator('=') +
    'RESUMO — THROUGHPUT POR NÍVEL DE CACHE\n' +
    separator('=') +
    tableHeader +
    tableBody +
    separator('-');

  fs.writeFileSync(REPORT_FILE, report);
  console.log(`[SUCESSO] Relatório salvo em: ${REPORT_FILE}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
