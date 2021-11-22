alter table stock
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;

alter table stock
add column is_active varchar(1) ;

alter table stock
add column center_id bigint; 

update stock set is_active = 'A';