import { supabase } from '../lib/supabaseClient';
import type { Item } from '../models';
import {
  toItem,
  toItemInsertRow,
  toItemUpdateRow,
  toTag,
  type ItemRow,
  type NewItemInput,
  type TagRow,
} from './mappers';
import { resolveTags } from './tagsRepository';

const ITEM_SELECT = '*, item_tags(tags(*))';

interface ItemRowWithTags extends ItemRow {
  item_tags: { tags: TagRow }[] | null;
}

function rowToItem(row: ItemRowWithTags): Item {
  const tags = (row.item_tags ?? []).map((join) => toTag(join.tags));
  return toItem(row, tags);
}

async function fetchItemById(id: string): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .eq('id', id)
    .single();
  if (error) {
    throw error;
  }
  return rowToItem(data as ItemRowWithTags);
}

async function linkTags(itemId: string, tags: { id: string }[]): Promise<void> {
  if (tags.length === 0) {
    return;
  }
  const { error } = await supabase
    .from('item_tags')
    .insert(tags.map((tag) => ({ item_id: itemId, tag_id: tag.id })));
  if (error) {
    throw error;
  }
}

export async function listItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select(ITEM_SELECT)
    .order('created_at', { ascending: false });
  if (error) {
    throw error;
  }
  return (data as ItemRowWithTags[]).map(rowToItem);
}

export async function createItem(input: NewItemInput): Promise<Item> {
  const row = toItemInsertRow(input);
  const { data, error } = await supabase
    .from('items')
    .insert(row)
    .select()
    .single();
  if (error) {
    throw error;
  }
  const itemRow = data as ItemRow;

  const resolvedTags = await resolveTags(input.tags.map((tag) => tag.name));
  await linkTags(itemRow.id, resolvedTags);

  return toItem(itemRow, resolvedTags);
}

export async function updateItem(
  id: string,
  updates: Partial<Item>
): Promise<Item> {
  const { tags, ...fields } = updates;
  const row = toItemUpdateRow(fields);

  if (Object.keys(row).length > 0) {
    const { error } = await supabase.from('items').update(row).eq('id', id);
    if (error) {
      throw error;
    }
  }

  if (tags) {
    const resolvedTags = await resolveTags(tags.map((tag) => tag.name));
    const { error: deleteError } = await supabase
      .from('item_tags')
      .delete()
      .eq('item_id', id);
    if (deleteError) {
      throw deleteError;
    }
    await linkTags(id, resolvedTags);
  }

  return fetchItemById(id);
}

export async function deleteItem(id: string): Promise<void> {
  // item_tags rows cascade-delete via their FK — no separate cleanup needed.
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) {
    throw error;
  }
}
