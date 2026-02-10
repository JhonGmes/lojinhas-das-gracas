import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../lib/utils';

describe('formatCurrency', () => {
    it('should format positive numbers correctly', () => {
        expect(formatCurrency(100)).toBe('R$ 100,00');
        expect(formatCurrency(1234.5)).toBe('R$ 1.234,50');
        expect(formatCurrency(0.99)).toBe('R$ 0,99');
    });

    it('should format zero correctly', () => {
        expect(formatCurrency(0)).toBe('R$ 0,00');
    });

    it('should handle decimal precision', () => {
        expect(formatCurrency(10.123)).toBe('R$ 10,12');
        expect(formatCurrency(10.999)).toBe('R$ 11,00');
    });

    it('should format negative numbers correctly', () => {
        expect(formatCurrency(-50)).toBe('-R$ 50,00');
    });

    it('should format large numbers correctly', () => {
        expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00');
    });
});
