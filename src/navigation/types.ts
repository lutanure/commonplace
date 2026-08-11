import type { TypeFilter } from '../utils/typeTaxonomy';

export type RootStackParamList = {
  Library: undefined;
  ItemDetail: { itemId: string };
  AddItem: { presetType?: TypeFilter } | undefined;
  EditItem: { itemId: string };
  Settings: undefined;
  ManageTypes: undefined;
  CustomizeQuickAdd: undefined;
};
