
ALTER TABLE customer 
change isactive is_active varchar(1),
change panno pan_no varchar(50);

update customer set createdon = '9999-01-20' where createdon = '';

ALTER TABLE customer 
change createdon createdAt datetime;

update customer set createdAt = null where createdAt = '9999-01-20';



alter table customer
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;