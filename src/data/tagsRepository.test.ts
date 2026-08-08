import { supabase } from '../lib/supabaseClient';
import { resolveTags } from './tagsRepository';

jest.mock('../lib/supabaseClient', () => ({
  supabase: { rpc: jest.fn() },
}));

const mockedRpc = supabase.rpc as jest.Mock;

describe('resolveTags', () => {
  beforeEach(() => {
    mockedRpc.mockReset();
  });

  it('returns an empty array without calling the RPC when given no names', async () => {
    const result = await resolveTags([]);
    expect(result).toEqual([]);
    expect(mockedRpc).not.toHaveBeenCalled();
  });

  it('calls the resolve_tags RPC, not a raw upsert', async () => {
    mockedRpc.mockResolvedValue({
      data: [{ id: 'tag-1', user_id: 'u1', name: 'Travel', created_at: 't' }],
      error: null,
    });

    await resolveTags(['Travel']);

    expect(mockedRpc).toHaveBeenCalledWith('resolve_tags', {
      p_names: ['Travel'],
    });
  });

  it('preserves the existing canonical casing of a tag that already exists', async () => {
    // Simulates the DB already having "Travel" stored, and the RPC's
    // deliberate no-op UPDATE returning that existing row untouched even
    // though the caller passed a different-cased "travel".
    mockedRpc.mockResolvedValue({
      data: [{ id: 'tag-1', user_id: 'u1', name: 'Travel', created_at: 't' }],
      error: null,
    });

    const result = await resolveTags(['travel']);

    expect(result).toEqual([{ id: 'tag-1', name: 'Travel' }]);
  });

  it('orders the result to match the order names were given in', async () => {
    mockedRpc.mockResolvedValue({
      data: [
        { id: 'tag-2', user_id: 'u1', name: 'film', created_at: 't' },
        { id: 'tag-1', user_id: 'u1', name: 'Travel', created_at: 't' },
      ],
      error: null,
    });

    const result = await resolveTags(['Travel', 'film']);

    expect(result).toEqual([
      { id: 'tag-1', name: 'Travel' },
      { id: 'tag-2', name: 'film' },
    ]);
  });

  it('throws when the RPC returns an error', async () => {
    mockedRpc.mockResolvedValue({ data: null, error: new Error('boom') });
    await expect(resolveTags(['Travel'])).rejects.toThrow('boom');
  });
});
