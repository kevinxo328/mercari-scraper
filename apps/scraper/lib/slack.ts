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
