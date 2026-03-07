/**
 * generate-categories.ts
 *
 * Crawls Mercari Japan's category hierarchy from the browser's IndexedDB
 * (populated by the Mercari web app), generates English translations via
 * the Anthropic API, and writes the result to
 * packages/database/src/data/mercari-categories.json.
 *
 * Usage:
 *   pnpm tsx apps/scraper/scripts/generate-categories.ts
 *
 * Required env vars:
 *   ANTHROPIC_API_KEY  - for English translation (optional; falls back to JP names)
 */

import { chromium } from '@playwright/test';
import { mkdirSync,writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MercariCategory {
  code: string;
  name: string;
  enName: string;
  children?: MercariCategory[];
}

interface MercariCategoriesJSON {
  tree: MercariCategory[];
  map: Record<
    string,
    { code: string; name: string; enName: string; parentCode: string | null }
  >;
}

interface RawCategory {
  id: string;
  name: string;
  parentCategoryId?: string;
  displayOrder?: string;
}

// ---------------------------------------------------------------------------
// Translation via Anthropic API
// ---------------------------------------------------------------------------

async function translateBatch(names: string[]): Promise<string[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not set — skipping English translation');
    return names;
  }

  const prompt = `Translate the following Japanese Mercari product category names to concise English.
Return ONLY a JSON array of translated strings in the same order, no explanations.
Japanese names: ${JSON.stringify(names)}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      console.error(`Anthropic API error: ${response.status}`);
      return names;
    }

    const data = (await response.json()) as {
      content: Array<{ text: string }>;
    };
    const content = data.content[0].text.trim();

    // Extract JSON array from response
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]) as string[];
      if (parsed.length === names.length) return parsed;
    }
    return names;
  } catch (e) {
    console.error('Translation error:', e);
    return names;
  }
}

async function translateAll(
  names: string[],
  batchSize = 50
): Promise<string[]> {
  const results: string[] = [];
  for (let i = 0; i < names.length; i += batchSize) {
    const batch = names.slice(i, i + batchSize);
    console.log(
      `Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(names.length / batchSize)}...`
    );
    const translated = await translateBatch(batch);
    results.push(...translated);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Root categories (top level shown on /categories page)
// ---------------------------------------------------------------------------

const ROOT_CATEGORIES = [
  { id: '3088', name: 'ファッション' },
  { id: '3', name: 'ベビー・キッズ' },
  { id: '1328', name: 'ゲーム・おもちゃ・グッズ' },
  { id: '6386', name: 'ホビー・楽器・アート' },
  { id: '1027', name: 'チケット' },
  { id: '5', name: '本・雑誌・漫画' },
  { id: '9879', name: 'CD・DVD・ブルーレイ' },
  { id: '7', name: 'スマホ・タブレット・パソコン' },
  { id: '3888', name: 'テレビ・オーディオ・カメラ' },
  { id: '4136', name: '生活家電・空調' },
  { id: '8', name: 'スポーツ' },
  { id: '2634', name: 'アウトドア・釣り・旅行用品' },
  { id: '6', name: 'コスメ・美容' },
  { id: '3134', name: 'ダイエット・健康' },
  { id: '1844', name: '食品・飲料・酒' },
  { id: '113', name: 'キッチン・日用品・その他' },
  { id: '4', name: '家具・インテリア' },
  { id: '69', name: 'ペット用品' },
  { id: '5597', name: 'DIY・工具' },
  { id: '1206', name: 'フラワー・ガーデニング' },
  { id: '9', name: 'ハンドメイド・手芸' },
  { id: '1318', name: '車・バイク・自転車' }
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Launching browser to read Mercari category data...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Navigate to Mercari categories to trigger IndexedDB population
  await page.goto('https://jp.mercari.com/categories', {
    waitUntil: 'networkidle'
  });

  // Wait for categories to load into IndexedDB
  await page.waitForTimeout(3000);

  console.log('Extracting categories from IndexedDB...');
  const allCats = await page.evaluate(async () => {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open('master');
      req.onsuccess = () => resolve(req.result);
      req.onerror = reject;
    });

    return new Promise<
      Array<{
        id: string;
        name: string;
        parentCategoryId?: string;
        displayOrder?: string;
      }>
    >((resolve, reject) => {
      const tx = db.transaction('itemCategories', 'readonly');
      const req = tx.objectStore('itemCategories').getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = reject;
    });
  });

  await browser.close();
  console.log(`Extracted ${allCats.length} categories`);

  // Build children map
  const childrenOf: Record<string, RawCategory[]> = {};
  allCats.forEach((c) => {
    const pid = c.parentCategoryId;
    if (pid) {
      if (!childrenOf[pid]) childrenOf[pid] = [];
      childrenOf[pid].push(c);
    }
  });
  Object.values(childrenOf).forEach((arr) => {
    arr.sort(
      (a, b) => Number(a.displayOrder ?? 999) - Number(b.displayOrder ?? 999)
    );
  });

  // Collect all unique Japanese names for translation
  const allNames: string[] = [
    ...ROOT_CATEGORIES.map((r) => r.name),
    ...allCats.map((c) => c.name)
  ];
  const uniqueNames = [...new Set(allNames)];

  console.log(`Translating ${uniqueNames.length} unique category names...`);
  const translatedNames = await translateAll(uniqueNames);

  const nameToEn: Record<string, string> = {};
  uniqueNames.forEach((n, i) => {
    nameToEn[n] = translatedNames[i] ?? n;
  });

  // Build flat map
  const map: MercariCategoriesJSON['map'] = {};
  ROOT_CATEGORIES.forEach((r) => {
    map[r.id] = {
      code: r.id,
      name: r.name,
      enName: nameToEn[r.name] ?? r.name,
      parentCode: null
    };
  });
  allCats.forEach((c) => {
    map[c.id] = {
      code: c.id,
      name: c.name,
      enName: nameToEn[c.name] ?? c.name,
      parentCode: c.parentCategoryId ?? null
    };
  });

  // Build tree recursively
  function buildTree(nodeId: string): MercariCategory {
    const node = map[nodeId];
    const children = (childrenOf[nodeId] ?? []).map((c) => buildTree(c.id));
    const result: MercariCategory = {
      code: nodeId,
      name: node?.name ?? '',
      enName: node?.enName ?? ''
    };
    if (children.length > 0) result.children = children;
    return result;
  }

  const tree: MercariCategory[] = ROOT_CATEGORIES.map((r) => {
    const children = (childrenOf[r.id] ?? []).map((c) => buildTree(c.id));
    return {
      code: r.id,
      name: r.name,
      enName: nameToEn[r.name] ?? r.name,
      children
    };
  });

  const output: MercariCategoriesJSON = { tree, map };

  // Write output
  const outDir = path.resolve(__dirname, '../../../packages/database/src/data');
  mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'mercari-categories.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
  console.log(`Written to ${outPath}`);
  console.log(`  Tree roots: ${tree.length}`);
  console.log(`  Map entries: ${Object.keys(map).length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
