import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { getMercariImageUrl, parseMercariPrice } from './parse-item';

describe('parseMercariPrice', () => {
  it('parses the current Mercari yen price format', () => {
    assert.deepEqual(parseMercariPrice('¥10,500'), {
      price: 10500,
      currency: 'JPY'
    });
  });

  it('continues to parse the previous yen price format', () => {
    assert.deepEqual(parseMercariPrice('10,500円'), {
      price: 10500,
      currency: 'JPY'
    });
  });

  it('parses the localized Taiwan dollar price format', () => {
    assert.deepEqual(parseMercariPrice('NT$2,398'), {
      price: 2398,
      currency: 'TWD'
    });
  });

  it('parses prices without a visible currency symbol as yen', () => {
    assert.deepEqual(parseMercariPrice('2,398'), {
      price: 2398,
      currency: 'JPY'
    });
  });

  it('parses other localized currency prefixes', () => {
    assert.deepEqual(parseMercariPrice('US$12,398'), {
      price: 12398,
      currency: 'USD'
    });
  });

  it('returns an invalid price when no yen amount is present', () => {
    assert.deepEqual(parseMercariPrice(''), { price: -1, currency: '' });
  });
});

describe('getMercariImageUrl', () => {
  it('prefers the loaded image URL and falls back to the source attribute', () => {
    assert.equal(
      getMercariImageUrl({
        currentSrc: '',
        src: 'https://static.mercdn.net/thumb/item/webp/m123_1.jpg'
      }),
      'https://static.mercdn.net/thumb/item/webp/m123_1.jpg'
    );
  });

  it('ignores placeholder URLs when a real image source is available', () => {
    assert.equal(
      getMercariImageUrl({
        currentSrc: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP',
        src: 'https://static.mercdn.net/thumb/item/webp/m123_1.jpg'
      }),
      'https://static.mercdn.net/thumb/item/webp/m123_1.jpg'
    );
  });

  it('falls back to lazy-loading attributes when src is not populated', () => {
    assert.equal(
      getMercariImageUrl({
        currentSrc: '',
        src: '',
        dataSrc: 'https://static.mercdn.net/thumb/item/webp/m123_1.jpg'
      }),
      'https://static.mercdn.net/thumb/item/webp/m123_1.jpg'
    );
  });
});
