/**
 * Constructs a Mercari Japan search URL.
 * @param keyword - search keyword
 * @param categoryIds - Mercari category codes (e.g. ["11", "3092"])
 * @param minPrice - optional minimum price filter
 * @param maxPrice - optional maximum price filter
 * @returns full Mercari search URL
 */
export function getMercariUrl({
  keyword,
  categoryIds,
  minPrice,
  maxPrice
}: {
  keyword: string;
  status?: string;
  categoryIds?: string[];
  minPrice?: number | null;
  maxPrice?: number | null;
}) {
  const status = 'on_sale'; // default is on_sale
  const params = new URLSearchParams({
    keyword,
    status,
    category_id: categoryIds ? categoryIds.join('&') : '',
    ...(!!minPrice && { price_min: minPrice.toString() }),
    ...(!!maxPrice && { price_max: maxPrice.toString() })
  });
  return `https://jp.mercari.com/search?${params.toString()}`;
}
