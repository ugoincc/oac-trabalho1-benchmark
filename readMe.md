# OAC Trabalho 1 — CPU/Memory Benchmark

Dois programas com comportamentos computacionais distintos para análise de tempo de CPU.

## Programas

### CPU-bound — Convolução Gaussiana
Aplica um filtro de blur (kernel 9×9) sobre uma imagem sintética de 2000×1500px.
Para cada pixel, realiza 81 operações de multiplicação e soma em ponto flutuante — o gargalo é a capacidade de cálculo da CPU.

### Memory-bound — Throughput de Memória
Executa inversão de cores (uma subtração por byte) em buffers de tamanhos crescentes, cobrindo os níveis de cache L1, L2, L3 e RAM.
A computação por byte é mínima — o gargalo é a banda de memória disponível em cada nível.

## Medição

Ambos usam `process.cpuUsage()`, que retorna o tempo gasto pelo processo em modo usuário (em microssegundos), excluindo tempo de espera por I/O ou preempção do SO. Os valores são convertidos para milissegundos nos relatórios.

## Requisitos

- Node.js 18+

## Instalação

```bash
npm install
```

## Como rodar

```bash
npm start         # roda os dois programas em sequência
npm run cpu       # só o CPU-bound
npm run memory    # só o memory-bound
```

Os relatórios são salvos em:

- `src/tests/relatorio_cpu.txt`
- `src/tests/relatorio_memoria.txt`
