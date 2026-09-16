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
