
ALTER TABLE item_history 
change actn action varchar(20),
change actn_type action_type varchar(100);

update item_history set txn_date = 
(select date_format(str_to_date(txn_date,'%d-%m-%Y %k:%i:%s'),'%Y-%m-%d %k:%i:%s'))
where id not in (3952,3953,3954,3955);

ALTER TABLE item_history 
modify txn_date datetime;

alter table item_history
add column createdAt datetime,
add column created_by bigint;
