import { describe, expect, it } from 'vitest';

import {
  contentTypeForExt,
  isRemoteImage,
  mimeToImageExt,
  vendorPublicObjectPath,
} from '@/utils/media';

describe('isRemoteImage', () => {
  it('accepts only absolute https urls', () => {
    expect(isRemoteImage('https://cdn.example/a.jpg')).toBe(true);
    expect(isRemoteImage('http://cdn.example/a.jpg')).toBe(false);
    expect(isRemoteImage('vendor-id/logo/1.jpg')).toBe(false);
    expect(isRemoteImage(null)).toBe(false);
  });
});

describe('vendor public object helpers', () => {
  it('keeps the vendor id as the first path segment', () => {
    const path = vendorPublicObjectPath('abc-123', 'logo', 'jpg');
    expect(path.startsWith('abc-123/logo/')).toBe(true);
    expect(path.endsWith('.jpg')).toBe(true);
    const servicePath = vendorPublicObjectPath('abc-123', 'service', 'jpg', 'svc-1');
    expect(servicePath.startsWith('abc-123/service/svc-1/')).toBe(true);
  });

  it('maps mime and extensions consistently', () => {
    expect(mimeToImageExt('image/png')).toBe('png');
    expect(contentTypeForExt('webp')).toBe('image/webp');
  });
});
