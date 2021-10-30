-- Processing Sale table : lr_date
update sale set lr_date = (select date_format(str_to_date(lr_date,'%d-%m-%Y'),'%Y-%m-%d')) where lr_date != '';

update sale set lr_date = '9999-01-20' where lr_date = '';


ALTER TABLE sale MODIFY lr_date date;  

update sale set lr_date = null where lr_date = '9999-01-20';


-- Processing Sale table : Drop received_date

ALTER TABLE sale
  DROP COLUMN received_date;
  
  -- Processing Sale table : Drop order_date
update sale set order_date = (select date_format(str_to_date(order_date,'%d-%m-%Y'),'%Y-%m-%d')) where order_date != ''; 


update sale set order_date = '9999-01-20' where order_date = '';

ALTER TABLE sale MODIFY order_date date; 

update sale set order_date = null where order_date = '9999-01-20';

update sale set invoice_date = (select date_format(str_to_date(invoice_date,'%d-%m-%Y'),'%Y-%m-%d')) where invoice_date != ''; 


  -- Processing Sale table : Drop sale_datetime
update sale set sale_datetime =
(select date_format(str_to_date(sale_datetime,'%d-%m-%Y %k:%i:%s'),'%Y-%m-%d %k:%i:%s'));

ALTER TABLE sale CHANGE sale_datetime sale_date_time datetime;

ALTER TABLE sale CHANGE total_qty total_quantity int(20);

ALTER TABLE sale CHANGE sale_type invoice_type varchar(50);

update sale set invoice_type = 'gstInvoice' where invoice_type = 'gstinvoice';

update sale set invoice_type = 'stockIssue' where invoice_type = 'stockissue';

ALTER TABLE sale CHANGE taxable_value after_tax_value decimal(10,2);

ALTER TABLE sale CHANGE cgst cgs_t decimal(10,2);
ALTER TABLE sale CHANGE sgst sgs_t decimal(10,2);
ALTER TABLE sale CHANGE igst igs_t decimal(10,2);
ALTER TABLE sale CHANGE roundoff round_off decimal(10,2);


ALTER TABLE sale  DROP COLUMN tax_applicable;

alter table sale
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;







  
  

