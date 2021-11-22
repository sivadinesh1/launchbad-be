alter table payment_detail
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;

ALTER TABLE payment_detail 
change pymt_ref_id payment_ref_id bigint;

alter table payment_detail
add column center_id bigint;


update payment_detail pd  set
center_id = (select p.center_id from 
payment p
where p.id = pd.payment_ref_id 
);





