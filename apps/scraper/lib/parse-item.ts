export type MercariPrice = {
  price: number;
  currency: string;
};

export type MercariImageAttributes = {
  currentSrc?: string | null;
  src?: string | null;
  dataSrc?: string | null;
  srcset?: string | null;
};

export function parseMercariPrice(text: string): MercariPrice {
  const match = text
    .trim()
    .match(
      /^(?:(¥|￥|NT\$|US\$|HK\$|A\$|C\$|S\$|\$|€|£|₩)\s*)?([\d,]+)\s*(円|[A-Z]{3})?$/
    );
  const amount = match?.[2];

  if (!amount) return { price: -1, currency: '' };

  const currency = match[1] || match[3];
  const currencyMap: Record<string, string> = {
    '¥': 'JPY',
    '￥': 'JPY',
    円: 'JPY',
    NT$: 'TWD',
    US$: 'USD',
    $: 'USD',
    HK$: 'HKD',
    A$: 'AUD',
    C$: 'CAD',
    S$: 'SGD',
    '€': 'EUR',
    '£': 'GBP',
    '₩': 'KRW'
  };

  return {
    price: parseInt(amount.replace(/,/g, ''), 10),
    currency: currency ? currencyMap[currency] || currency : 'JPY'
  };
}

export function getMercariImageUrl(attributes: MercariImageAttributes) {
  const directSource = [
    attributes.currentSrc,
    attributes.src,
    attributes.dataSrc
  ].find((source) => {
    const value = source?.trim();
    return value && !value.startsWith('data:') && !value.startsWith('blob:');
  });

  if (directSource) return directSource.trim();

  const firstSrcsetSource = attributes.srcset
    ?.split(',')[0]
    ?.trim()
    .split(/\s+/)[0];

  return firstSrcsetSource?.startsWith('data:') ||
    firstSrcsetSource?.startsWith('blob:')
    ? ''
    : firstSrcsetSource || '';
}
