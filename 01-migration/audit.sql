RENAME TABLE audit_tbl TO audit;
ALTER TABLE audit change actn action varchar(20);

update audit set audit_date =
(select date_format(str_to_date(audit_date,'%d-%m-%Y %k:%i:%s'),'%Y-%m-%d %k:%i:%s')) where new_value != '';


ALTER TABLE audit MODIFY audit_date datetime; 

alter table audit
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
