/**
 *
 * @param keyword
 * @param status default is on_sale
 * @param category_id default is 2 which means men clothing
 * @returns string
 */
export function getMercariUrl(
  keyword: string,
  status: string = "on_sale",
  category_id: string = "2"
) {
  const params = new URLSearchParams({
    keyword,
    status,
    category_id,
  });
  return `https://jp.mercari.com/search?${params.toString()}`;
}
