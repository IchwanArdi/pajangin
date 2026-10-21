import { describe, expect, it } from 'vitest';
import { storagePathFromUrl } from './account-deletion.js';

describe('storagePathFromUrl', () => {
  it('extracts an object path from a Supabase public URL', () => {
    expect(
      storagePathFromUrl(
        'https://demo.supabase.co/storage/v1/object/public/business-assets/biz-1/hero-123.webp',
      ),
    ).toBe('biz-1/hero-123.webp');
  });

  it('decodes URL-encoded paths', () => {
    expect(
      storagePathFromUrl(
        'https://demo.supabase.co/storage/v1/object/public/business-assets/biz-1/foto%20menu.jpg',
      ),
    ).toBe('biz-1/foto menu.jpg');
  });

  it('ignores external URLs and invalid values', () => {
    expect(storagePathFromUrl('https://images.example.com/photo.jpg')).toBeNull();
    expect(storagePathFromUrl('not-a-url')).toBeNull();
    expect(storagePathFromUrl(null)).toBeNull();
  });
});
