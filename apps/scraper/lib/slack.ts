async function sendSlackMessage(text: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      console.error(`Slack notification failed: HTTP ${res.status}`);
    }
  } catch (e) {
    console.error('Slack notification error:', e);
  }
}

export async function notifySlackSummary({
  result,
  resource
}: {
  result: {
    createdCount?: number;
    appUrl?: string;
    error?: string;
  } | null;
  resource: {
    durationMs: number;
    totalMem: number;
    peakRam: number;
    avgCpu: number;
    peakCpu: number;
  } | null;
}): Promise<void> {
  const resourceLine = resource
    ? (() => {
        const fmt = (b: number) => `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
        const s = Math.floor(resource.durationMs / 1000);
        const duration = `${Math.floor(s / 60)}m ${s % 60}s`;
        return `:bar_chart: ${duration} | RAM peak ${fmt(resource.peakRam)} | CPU avg ${resource.avgCpu.toFixed(1)}% peak ${resource.peakCpu.toFixed(1)}%`;
      })()
    : null;

  let text: string;
  if (result?.error) {
    text = `:x: Mercari scraper failed.\n\`\`\`${result.error}\`\`\``;
    if (resourceLine) text += `\n${resourceLine}`;
  } else if (result) {
    const count = result.createdCount ?? 0;
    const linkPart = result.appUrl ? ` <${result.appUrl}|View results>` : '';
    text = `:white_check_mark: Mercari scraper completed. ${count} new item${count === 1 ? '' : 's'} found.${linkPart}`;
    if (resourceLine) text += `\n${resourceLine}`;
  } else if (resourceLine) {
    text = resourceLine;
  } else {
    return;
  }

  await sendSlackMessage(text);
}

export async function notifySlack({
  createdCount,
  appUrl
}: {
  createdCount: number;
  appUrl?: string;
}): Promise<void> {
  const linkPart = appUrl ? ` <${appUrl}|View results>` : '';
  const text = `:white_check_mark: Mercari scraper completed. ${createdCount} new item${createdCount === 1 ? '' : 's'} found.${linkPart}`;
  await sendSlackMessage(text);
}

export async function notifySlackError(error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  const text = `:x: Mercari scraper failed.\n\`\`\`${message}\`\`\``;
  await sendSlackMessage(text);
}
