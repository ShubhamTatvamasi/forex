import { describe, expect, it } from 'vitest';
import { calculate, roundHalfUp2, valueOfSupply } from './engine';

describe('roundHalfUp2', () => {
  it('rounds true .xx5 boundaries up, not to even', () => {
    expect(roundHalfUp2(43.425)).toBe(43.43);
  });
});

describe('valueOfSupply', () => {
  it('applies the 1% slab with a ₹250 floor up to ₹1,00,000', () => {
    expect(valueOfSupply(48_250)).toBe(482.5);
    expect(valueOfSupply(10_000)).toBe(250);
  });
});

describe('calculate — confirmed FX-Retail/CRED trade', () => {
  // USD 500 at ₹96.30 base + ₹0.20 markup = ₹96.50 effective → ACE ₹48,250.
  const r = calculate({
    fcyAmount: 500,
    currency: 'USD',
    baseRate: 96.3,
    markupPerUnit: 0.2,
    purposeKind: 'other',
    panStatus: 'operative',
    priorLrs: 0,
    correspondentCharge: 'full_value',
    credAmountPaid: 48_320,
  });

  it('computes the effective rate and ACE', () => {
    expect(r.effectiveRate).toBeCloseTo(96.5, 4);
    expect(r.ace).toBeCloseTo(48_250, 2);
  });

  it('charges the flat ₹500 commission with 18% GST', () => {
    expect(r.commission).toBe(500);
    expect(roundHalfUp2(r.cgstOnCommission)).toBe(45);
    expect(roundHalfUp2(r.sgstOnCommission)).toBe(45);
  });

  it('charges GST on the value of supply, not the full ACE', () => {
    expect(r.supplyValue).toBe(482.5);
    expect(roundHalfUp2(r.cgstOnAce)).toBe(43.43);
    expect(roundHalfUp2(r.sgstOnAce)).toBe(43.43);
  });

  it('applies no TCS below the ₹10,00,000 threshold', () => {
    expect(r.tcs).toBe(0);
  });

  it('refunds the CRED buffer over ACE as cashback', () => {
    expect(r.credCashback).toBe(70);
  });
});

describe('calculate — TCS above the threshold', () => {
  it('charges 20% on the excess for other purposes', () => {
    const r = calculate({
      fcyAmount: 20_000,
      currency: 'USD',
      baseRate: 96.3,
      markupPerUnit: 0,
      purposeKind: 'other',
      panStatus: 'operative',
      priorLrs: 1_000_000,
      correspondentCharge: 'self',
      credAmountPaid: 0,
    });
    expect(r.tcsRatePct).toBe(20);
    expect(r.tcs).toBeCloseTo(r.ace * 0.2, 2);
  });

  it('charges 0% for loan-funded education', () => {
    const r = calculate({
      fcyAmount: 20_000,
      currency: 'USD',
      baseRate: 96.3,
      markupPerUnit: 0,
      purposeKind: 'education_loan',
      panStatus: 'operative',
      priorLrs: 1_000_000,
      correspondentCharge: 'self',
      credAmountPaid: 0,
    });
    expect(r.tcs).toBe(0);
  });
});
