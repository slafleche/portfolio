import { describe, expect, it } from 'vitest';
import { paddings, margins } from '@/styles/helpers/spacing.helper';
import { m } from 'css-calipers';

describe('spacing.helper', () => {
  it('applies shared axis shortcuts', () => {
    const styles = paddings({
      all: m(8),
      horizontal: m(4),
    });
    expect(styles).toEqual({ padding: '8px 4px' });
  });

  it('resolves explicit sides to four-value shorthand', () => {
    const styles = margins({
      vertical: m(10),
      horizontal: m(6),
      left: m(20),
    });
    expect(styles).toEqual({ margin: '10px 6px 10px 20px' });
  });

  it('passes through spacing keywords', () => {
    expect(margins({ all: 'auto' })).toEqual({ margin: 'auto' });
  });

  it('throws on invalid input types', () => {
    expect(() =>
      paddings('8px' as unknown as Parameters<typeof paddings>[0]),
    ).toThrow(/spacing intent object/);
  });

  it('derives three-value shorthand when vertical differs', () => {
    const styles = margins({
      top: m(16),
      bottom: m(8),
      horizontal: m(4),
    });
    expect(styles).toEqual({ margin: '16px 4px 8px' });
  });

  it('builds four-value shorthand when all sides differ', () => {
    const styles = paddings({
      top: m(1),
      right: m(2),
      bottom: m(3),
      left: m(4),
    });
    expect(styles).toEqual({ padding: '1px 2px 3px 4px' });
  });

  it('mixes keywords with measurements per side', () => {
    const styles = paddings({
      vertical: 'auto',
      horizontal: m(12),
      left: 'inherit',
    });
    expect(styles).toEqual({ padding: 'auto 12px auto inherit' });
  });
});
