
update sale_return set return_date = (select date_format(str_to_date(return_date,'%d-%m-%Y'),'%Y-%m-%d'))
where return_date != '';

update sale_return set return_date = '9999-01-20' where return_date = '';

ALTER TABLE sale_return 
modify return_date datetime;

alter table sale_return
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;