
#payment_mode

ALTER TABLE payment_mode 
change commission_fee commission_fee decimal(10,2);

alter table payment_mode
change pymt_mode_name payment_mode_name varchar(50);

alter table payment_mode
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
