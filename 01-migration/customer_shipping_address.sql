alter table customer_shipping_address
add column center_id bigint after id ,
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;