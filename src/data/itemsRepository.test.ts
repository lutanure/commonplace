import { supabase } from '../lib/supabaseClient';
import {
  createItem,
  deleteItem,
  listItems,
  updateItem,
} from './itemsRepository';
import { resolveTags } from './tagsRepository';

jest.mock('../lib/supabaseClient', () => ({
  supabase: { from: jest.fn() },
}));
jest.mock('./tagsRepository', () => ({ resolveTags: jest.fn() }));

const mockedFrom = supabase.from as jest.Mock;
const mockedResolveTags = resolveTags as jest.Mock;

// A fake PostgREST query builder. Every chain method returns the same
// builder so any call sequence (`.select().eq().single()`,
// `.insert().select().single()`, `.update().eq()`, ...) is supported, and
// the builder itself is thenable so `await`-ing it at any point in the
// chain resolves to the one result configured for this `from()` call —
// matching how each `supabase.from(...)` call in itemsRepository only
// ever awaits once, at the end of its own chain.
function makeBuilder(result: { data: unknown; error: unknown }) {
  const chainMethods = {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    single: jest.fn(),
  };
  const builder = {
    ...chainMethods,
    then: (
      resolve: (value: typeof result) => unknown,
      reject: (reason: unknown) => unknown
    ) => Promise.resolve(result).then(resolve, reject),
  };
  for (const method of Object.keys(
    chainMethods
  ) as (keyof typeof chainMethods)[]) {
    builder[method].mockReturnValue(builder);
  }
  return builder;
}

const itemRow = {
  id: 'item-1',
  user_id: 'user-1',
  title: 'A title',
  type: 'idea',
  custom_type_label: null,
  category: null,
  capture_type: 'manual',
  source_name: null,
  source_url: null,
  media_uri: null,
  original_text: null,
  summary: null,
  relevant_info: null,
  entities: null,
  user_note: null,
  why_saved: null,
  is_pinned: false,
  pinned_at: null,
  created_at: '2020-01-01T00:00:00.000Z',
  updated_at: '2020-01-01T00:00:00.000Z',
};

const tag = { id: 'tag-1', name: 'Travel' };

beforeEach(() => {
  mockedFrom.mockReset();
  mockedResolveTags.mockReset();
});

describe('listItems', () => {
  it('selects items with their joined tags, newest first', async () => {
    const builder = makeBuilder({
      data: [{ ...itemRow, item_tags: [{ tags: tag }] }],
      error: null,
    });
    mockedFrom.mockReturnValueOnce(builder);

    const items = await listItems();

    expect(mockedFrom).toHaveBeenCalledWith('items');
    expect(builder.select).toHaveBeenCalledWith('*, item_tags(tags(*))');
    expect(builder.order).toHaveBeenNthCalledWith(1, 'is_pinned', {
      ascending: false,
    });
    expect(builder.order).toHaveBeenNthCalledWith(2, 'pinned_at', {
      ascending: false,
      nullsFirst: false,
    });
    expect(builder.order).toHaveBeenNthCalledWith(3, 'created_at', {
      ascending: false,
    });
    expect(items).toHaveLength(1);
    expect(items[0].tags).toEqual([tag]);
  });

  it('throws on a query error', async () => {
    mockedFrom.mockReturnValueOnce(
      makeBuilder({ data: null, error: new Error('boom') })
    );
    await expect(listItems()).rejects.toThrow('boom');
  });
});

describe('createItem', () => {
  it('inserts the item row, resolves tags, and links them', async () => {
    const insertBuilder = makeBuilder({ data: itemRow, error: null });
    const linkBuilder = makeBuilder({ data: null, error: null });
    mockedFrom
      .mockReturnValueOnce(insertBuilder)
      .mockReturnValueOnce(linkBuilder);
    mockedResolveTags.mockResolvedValue([tag]);

    const item = await createItem({
      title: 'A title',
      type: 'idea',
      captureType: 'manual',
      tags: [{ id: 'local-1', name: 'Travel' }],
    });

    expect(mockedFrom).toHaveBeenNthCalledWith(1, 'items');
    expect(insertBuilder.insert).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'A title', type: 'idea' })
    );
    expect(mockedResolveTags).toHaveBeenCalledWith(['Travel']);
    expect(mockedFrom).toHaveBeenNthCalledWith(2, 'item_tags');
    expect(linkBuilder.insert).toHaveBeenCalledWith([
      { item_id: 'item-1', tag_id: 'tag-1' },
    ]);
    expect(item.tags).toEqual([tag]);
  });

  it('does not attempt to link tags when there are none', async () => {
    const insertBuilder = makeBuilder({ data: itemRow, error: null });
    mockedFrom.mockReturnValueOnce(insertBuilder);
    mockedResolveTags.mockResolvedValue([]);

    await createItem({
      title: 'A title',
      type: 'idea',
      captureType: 'manual',
      tags: [],
    });

    expect(mockedFrom).toHaveBeenCalledTimes(1);
  });

  it('throws on an insert error', async () => {
    mockedFrom.mockReturnValueOnce(
      makeBuilder({ data: null, error: new Error('boom') })
    );
    await expect(
      createItem({
        title: 'A title',
        type: 'idea',
        captureType: 'manual',
        tags: [],
      })
    ).rejects.toThrow('boom');
  });
});

describe('updateItem', () => {
  it('updates only the item row when no tags are given', async () => {
    const updateBuilder = makeBuilder({ data: null, error: null });
    const fetchBuilder = makeBuilder({
      data: { ...itemRow, title: 'New title', item_tags: [] },
      error: null,
    });
    mockedFrom
      .mockReturnValueOnce(updateBuilder)
      .mockReturnValueOnce(fetchBuilder);

    const item = await updateItem('item-1', { title: 'New title' });

    expect(mockedFrom).toHaveBeenNthCalledWith(1, 'items');
    expect(updateBuilder.update).toHaveBeenCalledWith({ title: 'New title' });
    expect(updateBuilder.eq).toHaveBeenCalledWith('id', 'item-1');
    expect(mockedResolveTags).not.toHaveBeenCalled();
    expect(item.title).toBe('New title');
  });

  // Regression test: Manage Types' custom-type deletion relies on
  // `updateItem(id, { customTypeLabel: undefined })` actually clearing the
  // column in the database patch, not silently omitting it. This proves
  // the mapper layer does the right thing — the real bug turned out to be
  // a DB CHECK constraint rejecting the resulting `custom_type_label:
  // null` row for type='other' items (fixed in
  // supabase/migrations/0004_allow_unlabeled_other_type.sql), not this
  // undefined-to-null translation.
  it('translates an explicit `undefined` field to `null` in the patch sent to Supabase, rather than omitting it', async () => {
    const updateBuilder = makeBuilder({ data: null, error: null });
    const fetchBuilder = makeBuilder({
      data: { ...itemRow, custom_type_label: null, item_tags: [] },
      error: null,
    });
    mockedFrom
      .mockReturnValueOnce(updateBuilder)
      .mockReturnValueOnce(fetchBuilder);

    await updateItem('item-1', { customTypeLabel: undefined });

    expect(updateBuilder.update).toHaveBeenCalledWith({
      custom_type_label: null,
    });
  });

  // Regression test: ManageTypesScreen counts a failed update via
  // Promise.allSettled's rejection status, which only reflects reality if
  // a real database error (e.g. a CHECK constraint violation) actually
  // surfaces as a thrown/rejected error here, rather than being swallowed.
  it('throws when Supabase returns an update error (e.g. a constraint violation)', async () => {
    mockedFrom.mockReturnValueOnce(
      makeBuilder({ data: null, error: new Error('constraint violated') })
    );

    await expect(
      updateItem('item-1', { customTypeLabel: undefined })
    ).rejects.toThrow('constraint violated');
  });

  it('replaces item_tags links when tags are given', async () => {
    const deleteBuilder = makeBuilder({ data: null, error: null });
    const linkBuilder = makeBuilder({ data: null, error: null });
    const fetchBuilder = makeBuilder({
      data: { ...itemRow, item_tags: [{ tags: tag }] },
      error: null,
    });
    mockedFrom
      .mockReturnValueOnce(deleteBuilder)
      .mockReturnValueOnce(linkBuilder)
      .mockReturnValueOnce(fetchBuilder);
    mockedResolveTags.mockResolvedValue([tag]);

    const item = await updateItem('item-1', { tags: [tag] });

    expect(mockedFrom).toHaveBeenNthCalledWith(1, 'item_tags');
    expect(deleteBuilder.delete).toHaveBeenCalled();
    expect(deleteBuilder.eq).toHaveBeenCalledWith('item_id', 'item-1');
    expect(mockedFrom).toHaveBeenNthCalledWith(2, 'item_tags');
    expect(linkBuilder.insert).toHaveBeenCalledWith([
      { item_id: 'item-1', tag_id: 'tag-1' },
    ]);
    expect(item.tags).toEqual([tag]);
  });
});

describe('deleteItem', () => {
  it('deletes the item by id', async () => {
    const builder = makeBuilder({ data: null, error: null });
    mockedFrom.mockReturnValueOnce(builder);

    await deleteItem('item-1');

    expect(mockedFrom).toHaveBeenCalledWith('items');
    expect(builder.delete).toHaveBeenCalled();
    expect(builder.eq).toHaveBeenCalledWith('id', 'item-1');
  });

  it('throws on a delete error', async () => {
    mockedFrom.mockReturnValueOnce(
      makeBuilder({ data: null, error: new Error('boom') })
    );
    await expect(deleteItem('item-1')).rejects.toThrow('boom');
  });
});
