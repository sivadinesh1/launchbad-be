ALTER TABLE vendor CHANGE name vendor_name varchar(150);

ALTER TABLE vendor CHANGE isactive is_active varchar(1);

alter table vendor
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;