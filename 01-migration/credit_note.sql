alter table credit_note
add column center_id bigint,
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;