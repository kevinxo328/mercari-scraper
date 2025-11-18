/**
 *
 * @param keyword
 * @param status default is on_sale
 * @param category_id default is 2 which means men clothing
 * @returns string
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
