import type { ItemRow, TagRow } from './mappers';
import { toItem, toItemInsertRow, toItemUpdateRow, toTag } from './mappers';

const baseRow: ItemRow = {
  id: 'row-1',
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
  created_at: '2020-01-01T00:00:00.000Z',
  updated_at: '2020-01-02T00:00:00.000Z',
};

describe('toTag', () => {
  it('maps a tag row to a Tag', () => {
    const row: TagRow = {
      id: 'tag-1',
      user_id: 'user-1',
      name: 'Travel',
      created_at: '2020-01-01T00:00:00.000Z',
    };
    expect(toTag(row)).toEqual({ id: 'tag-1', name: 'Travel' });
  });
});

describe('toItem', () => {
  it('maps a fully-populated row, converting null columns to undefined', () => {
    const item = toItem(baseRow, []);
    expect(item).toEqual({
      id: 'row-1',
      title: 'A title',
      type: 'idea',
      customTypeLabel: undefined,
      category: undefined,
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2020-01-02T00:00:00.000Z',
      captureType: 'manual',
      sourceName: undefined,
      sourceUrl: undefined,
      mediaUri: undefined,
      originalText: undefined,
      summary: undefined,
      relevantInfo: undefined,
      tags: [],
      entities: undefined,
      userNote: undefined,
      whySaved: undefined,
    });
  });

  it('passes through non-null optional columns and attaches the given tags', () => {
    const row: ItemRow = {
      ...baseRow,
      custom_type_label: null,
      category: 'travel',
      source_name: 'Instagram',
      source_url: 'https://example.com',
      media_uri: 'file:///photo.png',
      original_text: 'original',
      summary: 'summary',
      relevant_info: [{ label: 'Price', value: '$10' }],
      entities: ['Thing'],
      user_note: 'note',
      why_saved: 'why',
    };
    const tags = [{ id: 'tag-1', name: 'Travel' }];

    const item = toItem(row, tags);

    expect(item.category).toBe('travel');
    expect(item.sourceName).toBe('Instagram');
    expect(item.sourceUrl).toBe('https://example.com');
    expect(item.mediaUri).toBe('file:///photo.png');
    expect(item.originalText).toBe('original');
    expect(item.summary).toBe('summary');
    expect(item.relevantInfo).toEqual([{ label: 'Price', value: '$10' }]);
    expect(item.entities).toEqual(['Thing']);
    expect(item.userNote).toBe('note');
    expect(item.whySaved).toBe('why');
    expect(item.tags).toBe(tags);
  });
});

describe('toItemInsertRow', () => {
  it('maps every settable field to its column, defaulting absent optionals to null', () => {
    const row = toItemInsertRow({
      title: 'New item',
      type: 'idea',
      captureType: 'manual',
      tags: [],
    });

    expect(row).toEqual({
      title: 'New item',
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
    });
  });

  it('maps optional fields that are set', () => {
    const row = toItemInsertRow({
      title: 'New item',
      type: 'other',
      customTypeLabel: 'Research paper',
      captureType: 'url',
      sourceUrl: 'https://example.com',
      tags: [],
    });

    expect(row.custom_type_label).toBe('Research paper');
    expect(row.source_url).toBe('https://example.com');
  });
});

describe('toItemUpdateRow', () => {
  it('only includes keys present on the update patch', () => {
    const row = toItemUpdateRow({ title: 'Updated title' });
    expect(row).toEqual({ title: 'Updated title' });
  });

  it('maps an explicit undefined value to null, clearing the column', () => {
    const row = toItemUpdateRow({ sourceUrl: undefined });
    expect(row).toEqual({ source_url: null });
  });

  it('maps multiple present fields at once', () => {
    const row = toItemUpdateRow({
      title: 'New title',
      category: 'ideas',
      captureType: 'manual',
    });
    expect(row).toEqual({
      title: 'New title',
      category: 'ideas',
      capture_type: 'manual',
    });
  });
});
