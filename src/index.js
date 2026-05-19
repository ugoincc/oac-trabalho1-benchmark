import { main as runBlurTests      } from "./tests/sequentialRunner.js";
import { main as runMemoryTests    } from "./tests/memoryRunner.js";
import { main as runBenchmarkTests } from "./tests/benchmarkRunner.js";

console.log("=== INICIANDO TODOS OS TESTES ===\n");

await runBlurTests();
await runMemoryTests();
await runBenchmarkTests();

console.log("\n=== TODOS OS TESTES CONCLUÍDOS ===");
