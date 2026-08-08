import type { Tag } from '../models';
import { parseTagsInput } from './tags';

describe('parseTagsInput', () => {
  it('splits comma-separated input into trimmed tags', () => {
    const tags = parseTagsInput('Travel, Japan, Food');
    expect(tags.map((tag) => tag.name)).toEqual(['Travel', 'Japan', 'Food']);
  });

  it('drops empty and whitespace-only entries', () => {
    expect(parseTagsInput(' , , ')).toEqual([]);
    expect(parseTagsInput('Travel, , Japan')).toHaveLength(2);
  });

  it('returns an empty array for empty input', () => {
    expect(parseTagsInput('')).toEqual([]);
  });

  it('dedupes case-insensitively within the same input, keeping the first-seen name', () => {
    const tags = parseTagsInput('Travel, travel, TRAVEL');
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe('Travel');
  });

  it('assigns each new tag a unique generated id', () => {
    const tags = parseTagsInput('Travel, Japan');
    expect(tags[0].id).not.toBe(tags[1].id);
    expect(tags[0].id.length).toBeGreaterThan(0);
  });

  it('preserves an existing tag id when the name matches case-insensitively', () => {
    const existing: Tag[] = [{ id: 'tag-123', name: 'Travel' }];
    const tags = parseTagsInput('Travel, Japan', existing);

    expect(tags).toEqual([
      { id: 'tag-123', name: 'Travel' },
      { id: expect.any(String), name: 'Japan' },
    ]);
    expect(tags[1].id).not.toBe('tag-123');
  });

  it('matches an existing tag regardless of the casing typed this time', () => {
    const existing: Tag[] = [{ id: 'tag-123', name: 'Travel' }];
    const tags = parseTagsInput('travel, JAPAN', existing);

    expect(tags[0]).toEqual({ id: 'tag-123', name: 'travel' });
    expect(tags[1].name).toBe('JAPAN');
  });

  it('mints a fresh id when a previously-existing tag is dropped from the input', () => {
    const existing: Tag[] = [{ id: 'tag-123', name: 'Travel' }];
    const tags = parseTagsInput('Japan', existing);

    expect(tags).toHaveLength(1);
    expect(tags[0].id).not.toBe('tag-123');
    expect(tags[0].name).toBe('Japan');
  });
});
