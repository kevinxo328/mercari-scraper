import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
import os from 'os';
import path from 'path';

export default async function globalSetup() {
  const timestamp = Date.now();
  const samplesFile = path.join(
    os.tmpdir(),
    `mercari-scraper-samples-${timestamp}.jsonl`
  );
  const pidFile = path.join(
    os.tmpdir(),
    `mercari-scraper-pid-${timestamp}.txt`
  );
  const metaFile = path.join(os.tmpdir(), 'mercari-scraper-monitor-meta.json');
  const resultsFile = path.join(os.tmpdir(), 'mercari-scraper-results.json');

  writeFileSync(
    metaFile,
    JSON.stringify({ samplesFile, pidFile, resultsFile })
  );

  const samplerPath = path.join(process.cwd(), 'sampler.mjs');

  const child = spawn(process.execPath, [samplerPath, samplesFile], {
    detached: true,
    stdio: 'ignore'
  });
  child.unref();

  writeFileSync(pidFile, String(child.pid));

  console.log(`[monitor] Started resource sampler (PID: ${child.pid})`);
}
