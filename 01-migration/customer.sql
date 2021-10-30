
ALTER TABLE customer 
change isactive is_active varchar(1),
change panno pan_no varchar(50);


update customer set createdon = (select date_format(str_to_date(createdon,'%d-%m-%Y'),'%Y-%m-%d'))
where createdon != '';

update customer set createdon = '9999-01-20' where createdon = '';

update customer set createdAt = null where createdAt = '9999-01-20';


alter table customer
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;