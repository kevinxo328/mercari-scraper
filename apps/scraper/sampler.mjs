import os from 'os';
import fs from 'fs';

const [samplesFile] = process.argv.slice(2);

if (!samplesFile) {
  console.error('Usage: node sampler.mjs <samplesFile>');
  process.exit(1);
}

const MAX_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const INTERVAL_MS = 10_000; // 10 seconds
const startTime = Date.now();

function getCpuTicks() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;
  for (const cpu of cpus) {
    idle += cpu.times.idle;
    total += Object.values(cpu.times).reduce((a, b) => a + b, 0);
  }
  return { idle, total };
}

let prevCpuTicks = getCpuTicks();

function sample() {
  const now = getCpuTicks();
  const deltaIdle = now.idle - prevCpuTicks.idle;
  const deltaTotal = now.total - prevCpuTicks.total;
  const cpuPercent = deltaTotal > 0 ? (1 - deltaIdle / deltaTotal) * 100 : 0;
  prevCpuTicks = now;

  const record = {
    ts: Date.now(),
    freeMem: os.freemem(),
    totalMem: os.totalmem(),
    cpuPercent: Math.round(cpuPercent * 10) / 10
  };

  fs.appendFileSync(samplesFile, JSON.stringify(record) + '\n');
}

// Take initial sample immediately
sample();

const interval = setInterval(() => {
  sample();
  if (Date.now() - startTime >= MAX_DURATION_MS) {
    clearInterval(interval);
    process.exit(0);
  }
}, INTERVAL_MS);

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
