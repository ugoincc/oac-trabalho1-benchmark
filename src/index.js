import { main as runCpu } from './tests/cpuRunner.js';
import { main as runMemory } from './tests/memoryRunner.js';

console.log('=== INICIANDO TODOS OS TESTES ===\n');

await runCpu();
await runMemory();

console.log('\n=== TODOS OS TESTES CONCLUÍDOS ===');
