alter table purchase_ledger
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;