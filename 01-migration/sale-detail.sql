-- updates to sale details..

alter table sale_detail add column center_id bigint;

ALTER TABLE sale_detail 
CHANGE qty quantity int(11);

ALTER TABLE sale_detail 
CHANGE  taxable_value after_tax_value  decimal(10,2);

ALTER TABLE sale_detail 
CHANGE  cgst cgs_t  decimal(10,2);

ALTER TABLE sale_detail 
CHANGE  sgst sgs_t  decimal(10,2);

ALTER TABLE sale_detail 
CHANGE  igst igs_t  decimal(10,2);




update sale_detail set batchdate = (select date_format(str_to_date(batchdate,'%d-%m-%Y'),'%Y-%m-%d')) where batchdate != '';

update sale_detail set batchdate = '9999-01-20' where batchdate = '';

ALTER TABLE sale_detail MODIFY batchdate datetime; 

update sale_detail set batchdate = null where batchdate = '9999-01-20';

alter table sale_detail
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
