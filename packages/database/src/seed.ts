import { prisma } from "./client";

import type { ScraperKeyword } from "../generated/client";

const DEFAULT_KEYWORD = [
  // Add your own keyword to pre-populate the database with
  {
    keyword: "ancellm",
  },
] as Array<ScraperKeyword>;

(async () => {
  try {
    await Promise.all(
      DEFAULT_KEYWORD.map((item) =>
        prisma.scraperKeyword.upsert({
          where: {
            keyword: item.keyword,
          },
          update: {
            ...item,
          },
          create: {
            ...item,
          },
        }),
      ),
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
