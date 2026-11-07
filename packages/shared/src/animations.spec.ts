import { describe, expect, it } from 'vitest';
import { agendaQuerySchema } from './animations.ts';

const issuePaths = (result: { success: boolean; error?: { issues: { path: PropertyKey[] }[] } }) =>
  result.error?.issues.map((issue) => issue.path.join('.')) ?? [];

describe('agendaQuerySchema', () => {
  it('002-AS6: accepts an existing day, with or without a time', () => {
    expect(agendaQuerySchema.parse({ date: '2026-11-01' })).toEqual({ date: '2026-11-01' });
    expect(agendaQuerySchema.parse({ date: '2026-11-01', at: '15:00' })).toEqual({
      date: '2026-11-01',
      at: '15:00',
    });
  });

  it.each([
    [{ date: '2026-11-31' }, 'date'],
    [{ date: '1er novembre' }, 'date'],
    [{}, 'date'],
    [{ date: '2026-11-01', at: '25:00' }, 'at'],
    [{ date: '2026-11-01', at: '15h' }, 'at'],
    [{ date: '2026-11-01', at: '15:00:30' }, 'at'],
  ])('002-AS6: rejects a day that does not exist or an unreadable time (%j)', (query, field) => {
    const result = agendaQuerySchema.safeParse(query);
    expect(result.success).toBe(false);
    expect(issuePaths(result)).toEqual([field]);
  });
});
