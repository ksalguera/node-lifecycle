import { schedule } from './fixtures/schedule.js';
import {
  findActiveLTS,
  findCurrent,
  formatFriendlyDate,
} from '../src/utils.js';

describe('utils', () => {
  const NOW = new Date('2025-06-02T00:00:00Z');

  it('findActiveLTS returns [22, 20] (24 is Current)', () => {
    expect(findActiveLTS(schedule, NOW)).toEqual([22, 20]);
  });

  it('findCurrent returns 24', () => {
    expect(findCurrent(schedule, NOW)).toBe(24);
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