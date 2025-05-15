import { type NextRequest } from 'next/server';
import { prisma } from '@repo/database';
import { parseCommaSeparatedString } from '@/lib/utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page');
  const limit = searchParams.get('limit');
  const keywords = searchParams.get('keywords');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const keywordsArray = parseCommaSeparatedString(keywords);

  const scrapeResults = await prisma.scraperResult.findMany({
    where: {
      keywords: {
        some: {
          keyword: {
            in: keywordsArray.length > 0 ? keywordsArray : undefined
          }
        }
      },
      price: {
        gte: Number(minPrice) || undefined,
        lte: Number(maxPrice) || undefined
      }
    },
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
