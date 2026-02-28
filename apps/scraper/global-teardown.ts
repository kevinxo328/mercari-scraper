import { appendFileSync, existsSync, readFileSync, unlinkSync } from 'fs';
import os from 'os';
import path from 'path';
import { notifySlackSummary } from './lib/slack';

interface Sample {
  ts: number;
  freeMem: number;
  totalMem: number;
  cpuPercent: number;
}

interface Meta {
  samplesFile: string;
  pidFile: string;
  resultsFile: string;
}

interface ScraperResult {
  createdCount?: number;
  appUrl?: string;
  error?: string;
}

function fmt(bytes: number): string {
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

function fmtDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function cleanup(...files: string[]) {
  for (const f of files) {
    try {
      unlinkSync(f);
    } catch {
      // ignore missing files
    }
  }
}

export default async function globalTeardown() {
  const metaFile = path.join(os.tmpdir(), 'mercari-scraper-monitor-meta.json');

  if (!existsSync(metaFile)) {
    console.log('[monitor] No monitor session found, skipping summary');
    return;
  }

  const meta: Meta = JSON.parse(readFileSync(metaFile, 'utf-8'));
  const { samplesFile, pidFile, resultsFile } = meta;

  // Kill sampler process
  if (existsSync(pidFile)) {
    const pid = parseInt(readFileSync(pidFile, 'utf-8'), 10);
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // Process may have already exited
    }
  }

  if (!existsSync(samplesFile)) {
    console.log('[monitor] No samples collected');
    cleanup(metaFile, pidFile, samplesFile);
    return;
  }

  const lines = readFileSync(samplesFile, 'utf-8')
    .trim()
    .split('\n')
    .filter(Boolean);
  const samples: Sample[] = lines.map((l) => JSON.parse(l));

  if (samples.length === 0) {
    console.log('[monitor] No samples collected');
    cleanup(metaFile, pidFile, samplesFile);
    return;
  }

  const totalMem = samples[0].totalMem;
  const durationMs = samples[samples.length - 1].ts - samples[0].ts;

  const usedMems = samples.map((s) => totalMem - s.freeMem);
  const peakRam = Math.max(...usedMems);
  const avgRam = usedMems.reduce((a, b) => a + b, 0) / usedMems.length;

  // Skip first sample for CPU (no delta on first reading)
  const cpuValues = samples.slice(1).map((s) => s.cpuPercent);
  const avgCpu =
    cpuValues.length > 0
      ? cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length
      : 0;
  const peakCpu = cpuValues.length > 0 ? Math.max(...cpuValues) : 0;

  // Console output
  console.log('\n=== Resource Usage ===');
  console.log(`Duration  : ${fmtDuration(durationMs)}`);
  console.log(`Samples   : ${samples.length}`);
  console.log(`RAM total : ${fmt(totalMem)}`);
  console.log(
    `RAM peak  : ${fmt(peakRam)} (${Math.round((peakRam / totalMem) * 100)}%)`
  );
  console.log(
    `RAM avg   : ${fmt(avgRam)} (${Math.round((avgRam / totalMem) * 100)}%)`
  );
  console.log(`CPU avg   : ${avgCpu.toFixed(1)}%`);
  console.log(`CPU peak  : ${peakCpu.toFixed(1)}%`);
  console.log('======================\n');

  // Slack notification
  const scraperResult: ScraperResult | null = existsSync(resultsFile)
    ? JSON.parse(readFileSync(resultsFile, 'utf-8'))
    : null;

  await notifySlackSummary({
    result: scraperResult,
    resource: { durationMs, totalMem, peakRam, avgCpu, peakCpu }
  });

  // GitHub Actions Step Summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    const md = [
      '### Resource Usage',
      '',
      '| Metric | Value |',
      '|--------|-------|',
      `| Duration | ${fmtDuration(durationMs)} |`,
      `| Samples | ${samples.length} |`,
      `| RAM total | ${fmt(totalMem)} |`,
      `| RAM peak | ${fmt(peakRam)} (${Math.round((peakRam / totalMem) * 100)}%) |`,
      `| RAM avg | ${fmt(avgRam)} (${Math.round((avgRam / totalMem) * 100)}%) |`,
      `| CPU avg | ${avgCpu.toFixed(1)}% |`,
      `| CPU peak | ${peakCpu.toFixed(1)}% |`,
      ''
    ].join('\n');

    appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
  }

  cleanup(metaFile, pidFile, samplesFile, resultsFile);
}
