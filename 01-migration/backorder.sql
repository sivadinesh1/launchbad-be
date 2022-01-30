RENAME TABLE backorder TO back_order;

ALTER TABLE back_order 
change qty quantity bigint,
change createddate createdAt datetime,
change createdby created_by bigint;

alter table back_order
add column updatedAt datetime,
add column updated_by bigint;

update back_order set order_date = (select date_format(str_to_date(order_date,'%d-%m-%Y'),'%Y-%m-%d'))
where order_date != '';

update back_order set order_date = '9999-01-20' where order_date = '';

ALTER TABLE back_order MODIFY order_date datetime; 

update back_order set order_date = null where order_date = '9999-01-20';
