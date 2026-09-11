import { schedule } from './fixtures/schedule.js';
import {
  codenameFor,
  findActiveLTS,
  findCurrent,
  formatFriendlyDate,
} from '../src/utils.js';

describe('utils', () => {
  const NOW = new Date('2025-06-02T00:00:00Z');

  it('reads newly assigned codenames from schedule data', () => {
    // Synthetic release verifies support without a hardcoded codename.
    const release = { end: '2029-04-30', codename: 'Future name' };
    expect(codenameFor(99, { '99': release })).toBe('Future name');
  });

  it('keeps known codenames as a fallback and leaves unnamed releases blank', () => {
    expect(codenameFor(24)).toBe('Krypton');
    expect(codenameFor(24, { '24': { end: '2028-04-30', codename: '' } })).toBe('Krypton');
    expect(codenameFor(25)).toBe('');
    expect(codenameFor(26)).toBe('Lithium');
    expect(codenameFor(26, { '26': { end: '2029-04-30', codename: '' } })).toBe('Lithium');
    expect(codenameFor(undefined)).toBe('');
  });

  it('findActiveLTS returns [22, 20] (24 is Current)', () => {
    expect(findActiveLTS(schedule, NOW)).toEqual([22, 20]);
  });

  it('findCurrent returns 24', () => {
    expect(findCurrent(schedule, NOW)).toBe(24);
  });

  it('excludes future releases before inferring fallback recommendations', () => {
    const fallback = {
      '22': { end: '2027-04-30' },
      '24': { end: '2028-04-30' },
      '26': { start: '2026-05-05', end: '2029-04-30' },
    };
    expect(findCurrent(fallback, NOW)).toBe(24);
    expect(findActiveLTS(fallback, NOW)).toEqual([22]);

    // Metadata for an unreleased line must not disable fallback inference.
    const withFutureLts = {
      ...fallback,
      '26': { ...fallback['26'], lts: '2026-10-28' },
    };
    expect(findCurrent(withFutureLts, NOW)).toBe(24);
    expect(findActiveLTS(withFutureLts, NOW)).toEqual([22]);
  });

  it('makes no recommendations when every release starts in the future', () => {
    const future = { '26': { start: '2026-05-05', end: '2029-04-30' } };
    expect(findCurrent(future, NOW)).toBeNull();
    expect(findActiveLTS(future, NOW)).toEqual([]);
  });

  it('formatFriendlyDate prints human date without TZ drift', () => {
    expect(formatFriendlyDate('2025-06-01')).toBe('June 1, 2025');
    expect(formatFriendlyDate('2027-04-30')).toBe('April 30, 2027');
  });

  it('returns empty string for undefined date', () => {
    expect(formatFriendlyDate()).toBe('');
  });

  it('returns original string for malformed dates', () => {
    expect(formatFriendlyDate('not-a-date')).toBe('not-a-date');
  });

  it('handles empty schedule', () => {
    expect(findActiveLTS({}, NOW)).toEqual([]);
    expect(findCurrent({}, NOW)).toBeNull();
  });
});
