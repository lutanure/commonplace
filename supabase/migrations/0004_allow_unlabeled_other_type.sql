-- Fixes a real bug: Settings > Manage Types lets a user remove a custom
-- type by clearing customTypeLabel on every item that used it, leaving
-- those items as type='other' with no label (the generic "Other" bucket —
-- already handled everywhere on the client: getItemTypeLabel falls back to
-- "Other"/"Link", getItemDisplayColor falls back to the clay color,
-- getDistinctCustomTypeLabels already skips blank labels so no phantom
-- custom type reappears). The original items_custom_type_label_check
-- required every type='other' row to carry a non-blank label, so that
-- UPDATE was rejected by Postgres — surfacing to the user as "Only 0 of 1
-- items were updated."
--
-- The other half of the original constraint (a non-'other' type must NOT
-- carry a stray label) is unchanged and still enforced below.
alter table public.items drop constraint items_custom_type_label_check;

alter table public.items add constraint items_custom_type_label_check check (
  type = 'other' or custom_type_label is null
);
