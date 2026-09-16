export type MercariPrice = {
  price: number;
  currency: 'JPY' | '';
};

export type MercariImageAttributes = {
  currentSrc?: string | null;
  src?: string | null;
  dataSrc?: string | null;
  srcset?: string | null;
};

export function parseMercariPrice(text: string): MercariPrice {
  const match = text.match(/(?:¥|￥)\s*([\d,]+)|([\d,]+)\s*円/);
  const amount = match?.[1] || match?.[2];

  if (!amount) return { price: -1, currency: '' };

  return {
    price: parseInt(amount.replace(/,/g, ''), 10),
    currency: 'JPY'
  };
}

export function getMercariImageUrl(attributes: MercariImageAttributes) {
  const directSource = [
    attributes.currentSrc,
    attributes.src,
    attributes.dataSrc
  ].find((source) => source?.trim());

  if (directSource) return directSource.trim();

  const firstSrcsetSource = attributes.srcset
    ?.split(',')[0]
    ?.trim()
    .split(/\s+/)[0];

  return firstSrcsetSource || '';
}
