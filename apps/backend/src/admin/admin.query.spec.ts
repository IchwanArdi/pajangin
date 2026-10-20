import { describe, expect, it } from 'vitest';
import { daysAgo, parseEnum, parseLimit, parsePage, parseText, totalPages } from './admin.query.js';

// Regression tests untuk parsing query URL yang dipakai /admin/pengguna dan /admin/bisnis.
describe('admin query helpers', () => {
  it('falls back to page 1 for invalid values', () => {
    expect(parsePage(undefined)).toBe(1);
    expect(parsePage('0')).toBe(1);
    expect(parsePage('-3')).toBe(1);
    expect(parsePage('abc')).toBe(1);
    expect(parsePage('4')).toBe(4);
  });

  it('keeps limit within safe bounds', () => {
    expect(parseLimit(undefined)).toBe(20);
    expect(parseLimit('0')).toBe(1);
    expect(parseLimit('25')).toBe(25);
    expect(parseLimit('500')).toBe(100);
  });

  it('trims and caps search text', () => {
    expect(parseText('  demo  ')).toBe('demo');
    expect(parseText('x'.repeat(200))).toHaveLength(120);
  });

  it('accepts only allowed enum values', () => {
    expect(parseEnum('YA', ['ya', 'tidak'] as const)).toBe('ya');
    expect(parseEnum('lain', ['ya', 'tidak'] as const)).toBeUndefined();
  });

  it('always exposes at least one page', () => {
    expect(totalPages(0, 20)).toBe(1);
    expect(totalPages(20, 20)).toBe(1);
    expect(totalPages(21, 20)).toBe(2);
  });

  it('returns a date in the past', () => {
    expect(daysAgo(30).getTime()).toBeLessThan(Date.now());
  });
});
