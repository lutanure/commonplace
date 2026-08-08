import { generateLocalId } from './id';

describe('generateLocalId', () => {
  it('starts with the given prefix and matches the expected shape', () => {
    expect(generateLocalId('tag')).toMatch(/^tag-[0-9a-z]+-[0-9a-z]+$/);
    expect(generateLocalId('item')).toMatch(/^item-[0-9a-z]+-[0-9a-z]+$/);
  });

  it('produces different ids on successive calls', () => {
    const first = generateLocalId('tag');
    const second = generateLocalId('tag');
    expect(first).not.toBe(second);
  });
});
