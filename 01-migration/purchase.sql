update purchase set invoice_date = (select date_format(str_to_date(invoice_date,'%d-%m-%Y'),'%Y-%m-%d')) where invoice_date != '';

update purchase set invoice_date = '9999-01-20' where invoice_date = '';

ALTER TABLE purchase 
modify invoice_date date;


update purchase set lr_date = (select date_format(str_to_date(lr_date,'%d-%m-%Y'),'%Y-%m-%d'))
where lr_date != '';

update purchase set lr_date = '9999-01-20' where lr_date = '';

ALTER TABLE purchase 
modify lr_date date;

update purchase set lr_date = null where lr_date = '9999-01-20';

update purchase set received_date = (select date_format(str_to_date(received_date,'%d-%m-%Y'),'%Y-%m-%d'))
where received_date != '';

update purchase set received_date = '9999-01-20' where received_date = '';

ALTER TABLE purchase 
modify received_date date;

update purchase set received_date = null where received_date = '9999-01-20';

update purchase set order_date = (select date_format(str_to_date(order_date,'%d-%m-%Y'),'%Y-%m-%d'))
where order_date != '';

update purchase set order_date = '9999-01-20' where order_date = '';

ALTER TABLE purchase 
modify order_date date;

update purchase set order_date = null where order_date = '9999-01-20';


ALTER TABLE purchase 
change total_qty total_quantity int(11);

ALTER TABLE purchase 
change taxable_value after_tax_value decimal(10,2),
change cgst cgs_t decimal(10,2),
change sgst sgs_t decimal(10,2),
change igst igs_t decimal(10,2),
change roundoff round_off decimal(10,2)
;



update purchase set stock_inwards_datetime =
(select date_format(str_to_date(stock_inwards_datetime,'%d-%m-%Y %k:%i:%s'),'%Y-%m-%d %k:%i:%s'));

ALTER TABLE purchase 
change stock_inwards_datetime stock_inwards_date_time datetime;

update purchase set purchase_type = 'GST Invoice';

alter table purchase
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;