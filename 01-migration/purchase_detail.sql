
alter table purchase_detail
add column center_id bigint after purchase_id,
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint,
add column hsn_code varchar(50);

ALTER TABLE purchase_detail 
change qty quantity int(11),
change purchase_price purchase_price decimal(10,2),
change mrp mrp decimal(10,2),
change taxable_value after_tax_value decimal(10,2),
change cgst cgs_t decimal(10,2),
change sgst sgs_t decimal(10,2),
change igst igs_t decimal(10,2);

update purchase_detail set batchdate = (select date_format(str_to_date(batchdate,'%d-%m-%Y'),'%Y-%m-%d'))
where batchdate != '';

update purchase_detail set batchdate = '9999-01-20' where batchdate = '';

ALTER TABLE purchase_detail 
change batchdate batch_date date;

update purchase_detail set batch_date = null where batch_date = '9999-01-20';

update purchase_detail pd set center_id = (select center_id from purchase p where p.id = pd.purchase_id);

update purchase_detail pd set hsn_code = (select hsn_code from product p where p.id = pd.product_id);