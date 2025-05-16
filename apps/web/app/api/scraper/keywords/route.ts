import { prisma } from '@mercari-scraper/database';

export async function GET() {
  const keywords = await prisma.scraperKeyword.findMany({
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
