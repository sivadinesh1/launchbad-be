

ALTER TABLE brand 
change name brand_name varchar(150),
change isactive is_active varchar(1);

alter table brand
add column created_by bigint,
add column updatedAt datetime,
add column updated_by bigint;

ALTER TABLE brand 
change createdon createdAt datetime;
