import { describe, it, expect } from 'vitest';
import { checkFeedbackQuality, generateCouponCode } from './feedback';

describe('checkFeedbackQuality', () => {
  it('approves empty feedback (silent submission)', () => {
    expect(checkFeedbackQuality('')).toBe(true);
    expect(checkFeedbackQuality('   ')).toBe(true);
  });

  it('approves feedback >= 15 chars with letters', () => {
    expect(checkFeedbackQuality('Great examples!')).toBe(true);
    expect(checkFeedbackQuality('This really helped me understand the topic')).toBe(true);
  });

  it('rejects feedback < 15 chars', () => {
    expect(checkFeedbackQuality('Too short')).toBe(false);
    expect(checkFeedbackQuality('Bad')).toBe(false);
  });

  it('rejects spam with 4+ repeated chars', () => {
    expect(checkFeedbackQuality('This is aaaaa bad')).toBe(false);
    expect(checkFeedbackQuality('HHHHHH no')).toBe(false);
  });

  it('rejects text without letters', () => {
    expect(checkFeedbackQuality('12345678901234567890')).toBe(false);
    expect(checkFeedbackQuality('!@#$%^&*()')).toBe(false);
  });

  it('approves specific short feedback if it has letters', () => {
    // Actually this should fail because it's < 15 chars
    expect(checkFeedbackQuality('Quiz confusing')).toBe(false); // 14 chars
    expect(checkFeedbackQuality('The quiz was confusing')).toBe(true); // 22 chars
  });
});

describe('generateCouponCode', () => {
  it('generates 8-char codes from the unambiguous alphabet', () => {
    const code = generateCouponCode();
    expect(code).toMatch(/^FEEDBACK-[0-9ABCDEFGHJKMNPQRSTVWXYZ]{8}$/);
  });

  it('does not repeat across many generations', () => {
    const codes = new Set(Array.from({ length: 1000 }, generateCouponCode));
    expect(codes.size).toBe(1000);
  });
});
