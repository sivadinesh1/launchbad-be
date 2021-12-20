
update payment set pymt_date = (select date_format(str_to_date(pymt_date,'%d-%m-%Y'),'%Y-%m-%d'))
where pymt_date != '';

update payment set pymt_date = '9999-01-20' where pymt_date = '';

ALTER TABLE payment 
change pymt_date payment_date datetime;

ALTER TABLE payment 
change pymt_mode_ref_id payment_mode_ref_id bigint;

ALTER TABLE payment 
change pymt_ref payment_ref varchar(200),
change createdby created_by bigint;

alter table payment
add column excess_amount decimal(12,2) default 0,
add column createdAt datetime,
add column updatedAt datetime,
add column updated_by bigint,
add is_delete varchar(1) default 'N';

update payment set cancelled_date = (select date_format(str_to_date(cancelled_date,'%d-%m-%Y'),'%Y-%m-%d'))
where cancelled_date != '';

update payment set cancelled_date = '9999-01-20' where cancelled_date = '';

ALTER TABLE payment 
modify cancelled_date datetime;

update payment set cancelled_date = null where cancelled_date = '9999-01-20';

update payment set excess_amount = 0.00;

