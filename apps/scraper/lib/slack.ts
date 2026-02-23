export async function notifySlack({
  createdCount,
  appUrl
}: {
  createdCount: number;
  appUrl?: string;
}): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return;

  const linkPart = appUrl ? ` <${appUrl}|View results>` : '';
  const text = `:white_check_mark: Mercari scraper completed. ${createdCount} new item${createdCount === 1 ? '' : 's'} found.${linkPart}`;

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
