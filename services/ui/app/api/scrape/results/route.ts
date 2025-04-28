import { type NextRequest } from 'next/server';
import { dbClient } from '@/utils/db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');

  const scrapeResults = await dbClient.scrapeResult.findMany({
    orderBy: {
      updatedAt: 'desc'
    },
    take: Number(limit) || 10,
    skip: Number(page) ? (Number(page) - 1) * (Number(limit) || 10) : 0
  });

  return new Response(JSON.stringify(scrapeResults), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
