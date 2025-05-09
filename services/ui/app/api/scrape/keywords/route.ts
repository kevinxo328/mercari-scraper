import { prisma } from '@mercari-scraper/db';

export async function GET() {
  const keywords = await prisma.scrapeKeyword.findMany({
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return new Response(JSON.stringify(keywords), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
