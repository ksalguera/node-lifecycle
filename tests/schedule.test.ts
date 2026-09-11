import fs from 'node:fs/promises';
import { classify, getSchedule } from '../src/index.js';
import { codenameFor, findActiveLTS, findCurrent } from '../src/utils.js';

const wgSchedule = {
  v24: {
    start: '2025-05-06',
    lts: '2025-10-28',
    maintenance: '2026-10-20',
    end: '2028-04-30',
    codename: 'Krypton',
  },
  v26: {
    start: '2026-05-05',
    lts: '2026-10-28',
    maintenance: '2027-10-20',
    end: '2029-04-30',
    codename: 'Lithium',
  },
};

const response = (data: unknown) => ({ ok: true, json: async () => data } as Response);

describe('getSchedule()', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-10T00:00:00Z'));
    jest.spyOn(fs, 'stat').mockResolvedValue({ mtimeMs: Date.now() } as any);
    jest.spyOn(fs, 'readFile').mockRejectedValue(new Error('Cache miss'));
    jest.spyOn(fs, 'mkdir').mockResolvedValue(undefined);
    jest.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Service unavailable'));
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('uses WG lifecycle metadata when both sources contain the same release', async () => {
    jest.mocked(fetch)
      .mockResolvedValueOnce(response(wgSchedule))
      .mockResolvedValueOnce(response([{ cycle: '24', eol: '2027-01-01' }]));

    const schedule = await getSchedule();

    expect(Object.keys(schedule)).toEqual(['24', '26']);
    expect(classify('24.21.0', schedule)).toMatchObject({
      status: 'active-lts', eol: '2028-04-30',
    });
    expect(findActiveLTS(schedule)).toEqual([24]);
    expect(findCurrent(schedule)).toBe(26);
    expect(codenameFor(26, schedule)).toBe('Lithium');
    const wgCacheWrite = jest.mocked(fs.writeFile).mock.calls.find(
      ([file]) => String(file).endsWith('schedule.wg.json')
    );
    expect(JSON.parse(wgCacheWrite![1] as string)).toEqual({
      '24': wgSchedule.v24, '26': wgSchedule.v26,
    });
  });

  it('classifies WG releases when the fallback service is unavailable', async () => {
    jest.mocked(fetch).mockResolvedValueOnce(response(wgSchedule));

    const schedule = await getSchedule();

    expect(classify('26.8.2', schedule).status).toBe('current');
    expect(findActiveLTS(schedule)).toEqual([24]);
  });

  it('retains future releases but excludes them until their start date', async () => {
    jest.mocked(fetch).mockResolvedValueOnce(response({
      ...wgSchedule,
      v27: { start: '2027-04-22', end: '2030-04-30' },
    }));

    const schedule = await getSchedule();

    expect(schedule['27'].start).toBe('2027-04-22');
    expect(classify('27.0.0', schedule)).toEqual({ major: 27, status: 'unknown' });
    expect(findCurrent(schedule)).toBe(26);
    expect(findActiveLTS(schedule)).toEqual([24]);

    jest.setSystemTime(new Date('2027-04-21T23:59:59.999Z'));
    expect(classify('27.0.0', schedule).status).toBe('unknown');
    expect(findCurrent(schedule)).toBeNull();

    jest.setSystemTime(new Date('2027-04-22T00:00:00Z'));
    expect(classify('27.0.0', schedule).status).toBe('current');
    expect(findCurrent(schedule)).toBe(27);
  });

  it.each([
    ['legacy prefixed', wgSchedule],
    ['normalized', { '24': wgSchedule.v24, '26': wgSchedule.v26 }],
  ])('loads %s WG cache keys without fetching WG again', async (_name, cached) => {
    jest.mocked(fs.readFile).mockImplementation(async (file) => {
      if (String(file).endsWith('schedule.wg.json')) return JSON.stringify(cached);
      return JSON.stringify({ '24': { end: '2027-01-01' } });
    });

    const schedule = await getSchedule();

    expect(Object.keys(schedule)).toEqual(['24', '26']);
    expect(classify('24.21.0', schedule).status).toBe('active-lts');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('preserves distinct historical release lines', async () => {
    jest.mocked(fetch).mockResolvedValueOnce(response({
      'v0.10': { end: '2016-10-31' },
      'v0.12': { end: '2016-12-31' },
    }));

    expect(await getSchedule()).toEqual({
      '0.10': { end: '2016-10-31' },
      '0.12': { end: '2016-12-31' },
    });
  });

  it('keeps normalized EoL fallback data when WG is unavailable', async () => {
    jest.mocked(fetch)
      .mockRejectedValueOnce(new Error('WG unavailable'))
      .mockResolvedValueOnce(response([{ cycle: '26', eol: '2029-04-30' }]));

    const schedule = await getSchedule();

    expect(schedule).toEqual({ '26': { end: '2029-04-30' } });
    expect(classify('26.8.2', schedule).status).toBe('current');
  });
});
