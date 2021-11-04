alter table payment_detail
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;

ALTER TABLE payment_detail 
change pymt_ref_id payment_ref_id bigint;