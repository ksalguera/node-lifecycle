import { classify } from '../src/index.js';
import { schedule } from './fixtures/schedule.js';

describe('classify()', () => {
  const currentTime = new Date('2025-06-02T00:00:00Z');
  const oldTimeZone = process.env.TZ;

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(currentTime);
    process.env.TZ = 'UTC';
  });

  afterAll(() => {
    jest.useRealTimers();
    process.env.TZ = oldTimeZone;
  });

  it('marks v23 as EOL', () => {
    const res = classify('v23.7.0', schedule);
    expect(res.major).toBe(23);
    expect(res.status).toBe('eol');
    expect(res.eol).toBe('2025-06-01');
    expect((res.daysToEol ?? 0)).toBeLessThanOrEqual(0);
  });

  it('marks 24 as current (no LTS yet)', () => {
    const res = classify('24.1.0', schedule);
    expect(res.major).toBe(24);
    expect(res.status).toBe('current');
    expect(res.eol).toBe('2026-04-30');
    expect((res.daysToEol ?? 0)).toBeGreaterThan(300);
  });

  it('marks 22 as active-lts / maintenance and not EOL', () => {
    const res = classify('22.5.0', schedule);
    expect(['active-lts', 'maintenance']).toContain(res.status);
    expect(res.eol).toBe('2027-04-30');
  });

  it('returns unknown for majors not in schedule', () => {
    const res = classify('99.0.0', schedule);
    expect(res.status).toBe('unknown');
  });

  it('handles missing end date (unknown)', () => {
    const broken = { ...schedule, '30': { start: '2030-01-01' } as any };
    const res = classify('30.0.0', broken);
    expect(res.status).toBe('unknown');
  });

  it('classifies maintenance correctly when maintenance date is past but not EOL', () => {
    const s = {
      ...schedule,
      '26': {
        start: '2027-04-01',
        lts: '2027-10-01',
        maintenance: '2029-10-01',
        end: '2030-04-30',
      },
    };

    const future = new Date('2029-12-01T00:00:00Z');
    jest.setSystemTime(future);

    const res = classify('26.2.0', s);
    expect(res.status).toBe('maintenance');

    jest.setSystemTime(new Date('2025-06-02T00:00:00Z'));
  });
});

