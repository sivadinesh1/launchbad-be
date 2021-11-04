ALTER TABLE accnt_rec_sale change centerid center_id bigint;RENAME TABLE audit_tbl TO audit;
ALTER TABLE audit change actn action varchar(20);

update audit set audit_date =
(select date_format(str_to_date(audit_date,'%d-%m-%Y %k:%i:%s'),'%Y-%m-%d %k:%i:%s')) where new_value != '';


ALTER TABLE audit MODIFY audit_date datetime; 

alter table audit
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;

#backorder

ALTER TABLE backorder 
change qty quantity bigint,
change createddate createdAt datetime,
change createdby created_by bigint;

alter table backorder
add column updatedAt datetime,
add column updated_by bigint;

update backorder set order_date = (select date_format(str_to_date(order_date,'%d-%m-%Y'),'%Y-%m-%d'))
where order_date != '';

update backorder set order_date = '9999-01-20' where order_date = '';

ALTER TABLE backorder MODIFY order_date datetime; 

update backorder set order_date = null where order_date = '9999-01-20';

#brand

ALTER TABLE brand 
change name brand_name varchar(150),
change isactive is_active varchar(1);

alter table brand
add column created_by bigint,
add column updatedAt datetime,
add column updated_by bigint;

ALTER TABLE brand 
change createdon createdAt datetime;






#center

ALTER TABLE center 
change bankname bank_name varchar(100),
change accountname account_name varchar(150),
change accountno account_no varchar(50),
change ifsccode ifsc_code varchar(50),
change location timezone varchar(100);

alter table center
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;






  
  


ALTER TABLE center_banks 
change bankname bank_name varchar(100),
change accountname account_name varchar(150),
change accountno account_no varchar(50),
change ifsccode ifsc_code varchar(50),
change createddate createdAt datetime,
change updateddate updatedAt datetime,
change updatedby updated_by bigint,
change createdby created_by bigint ;alter table credit_note
add column center_id bigint,
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
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
add column updated_by bigint;alter table customer_shipping_address
add column center_id bigint after id ,
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
update discount set startdate = (select date_format(str_to_date(startdate,'%d-%m-%Y'),'%Y-%m-%d'))
where startdate != '';

update discount set startdate = '9999-01-20' where startdate = '';

ALTER TABLE discount 
modify startdate date;

update discount set enddate = (select date_format(str_to_date(enddate,'%d-%m-%Y'),'%Y-%m-%d'))
where enddate != '';

update discount set enddate = '9999-01-20' where enddate = '';

ALTER TABLE discount 
modify enddate date;

update discount set enddate = null where enddate = '9999-01-20';

ALTER TABLE discount 
change enddate end_date date,
change startdate start_date date;

alter table discount
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;ALTER TABLE enquiry 
change estatus e_status varchar(1),
change createddate createdAt datetime,
change updateddate updatedAt datetime,
change updatedby updated_by bigint,
change createdby created_by bigint ;ALTER TABLE enquiry_detail 
change askqty ask_quantity int(20),
change giveqty give_quantity int(11),
change createddate createdAt datetime,
change updateddate updatedAt datetime,
change updatedby updated_by bigint,
change createdby created_by bigint ;

alter table enquiry_detail
add column center_id bigint after id ;RENAME TABLE financialyear TO financial_year;


ALTER TABLE financial_year 
change finyear financial_year varchar(50),
change invseq inv_seq bigint,
change pymt_seq payment_seq bigint,
change vendor_pymt_seq vendor_payment_seq bigint ;


alter table financial_year
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;

update financial_year set startdate = (select date_format(str_to_date(startdate,'%d-%m-%Y'),'%Y-%m-%d'))
where startdate != '';

update financial_year set startdate = '9999-01-20' where startdate = '';

ALTER TABLE financial_year 
modify startdate date;

update financial_year set startdate = null where startdate = '9999-01-20';

update financial_year set enddate = (select date_format(str_to_date(enddate,'%d-%m-%Y'),'%Y-%m-%d'))
where enddate != '';

update financial_year set enddate = '9999-01-20' where enddate = '';

ALTER TABLE financial_year 
modify enddate date;

update financial_year set enddate = null where enddate = '9999-01-20';


ALTER TABLE financial_year 
change enddate end_date date,
change startdate start_date date;

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
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
update payment set pymt_date = (select date_format(str_to_date(pymt_date,'%d-%m-%Y'),'%Y-%m-%d'))
where pymt_date != '';

update payment set pymt_date = '9999-01-20' where pymt_date = '';

ALTER TABLE payment 
change pymt_date payment_date datetime;

ALTER TABLE payment 
change pymt_mode_ref_id payment_mode_ref_id bigint;

ALTER TABLE payment 
change pymt_ref payment_ref varchar(200),
change createdby created_by bigint;

alter table payment
add column createdAt datetime,
add column updatedAt datetime,
add column updated_by bigint;

update payment set cancelled_date = (select date_format(str_to_date(cancelled_date,'%d-%m-%Y'),'%Y-%m-%d'))
where cancelled_date != '';

update payment set cancelled_date = '9999-01-20' where cancelled_date = '';

ALTER TABLE payment 
modify cancelled_date datetime;

update payment set cancelled_date = null where cancelled_date = '9999-01-20';

alter table payment_detail
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
#payment_mode

ALTER TABLE payment_mode 
change commission_fee commission_fee decimal(10,2);

alter table payment_mode
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
alter table permissions
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
ALTER TABLE product 
change unit unom varchar(50),
change description product_description varchar(250),
change packetsize packet_size int(11),
change hsncode hsn_code varchar(50),
change  salesprice sales_price varchar(50),
change  rackno rack_info varchar(50),
change  alternatecode alternate_code varchar(50),
change  taxrate tax_rate int(11),
change  minqty minimum_quantity int(11), 
change  reorderqty reorder_quantity int(11), 
change  avgpurprice average_purchase_price decimal(10,2), 
change  avgsaleprice average_sale_price decimal(10,2),
change updatedby updated_by bigint,
change createdby created_by bigint;

alter table product
add column product_type varchar(20);



UPDATE product SET currentstock = 0 WHERE currentstock = 'null';

ALTER TABLE product 
change currentstock current_stock int(11);

update product set maxdiscount = 0 where maxdiscount = '';

ALTER TABLE product 
change maxdiscount max_discount int(11);

update product set itemdiscount = 0;

ALTER TABLE product 
change itemdiscount item_discount int(11);


update product set unit_price = 0.00 where unit_price = '#########';
ALTER TABLE product 
change unit_price unit_price decimal(10,2);

ALTER TABLE product 
change mrp mrp decimal(10,2);

update product set purchase_price = 0.00 where purchase_price = '0';
update product set purchase_price = 0.00 where purchase_price = '#########';
ALTER TABLE product 
change purchase_price purchase_price decimal(10,2);

update product set sales_price = 0.00 where sales_price = '';

update product set sales_price = 0.00 where sales_price = 'null';

ALTER TABLE product 
change sales_price sales_price decimal(10,2);

ALTER TABLE product 
change createdon createdAt datetime;


ALTER TABLE product 
change updatedon updatedAt datetime;
#purchase

update purchase set invoice_date = (select date_format(str_to_date(invoice_date,'%d-%m-%Y'),'%Y-%m-%d'))
where invoice_date != '';

update purchase set invoice_date = '9999-01-20' where invoice_date = '';

ALTER TABLE purchase 
modify invoice_date date;


update purchase set lr_date = (select date_format(str_to_date(lr_date,'%d-%m-%Y'),'%Y-%m-%d'))
where lr_date != '';

update purchase set lr_date = '9999-01-20' where lr_date = '';

ALTER TABLE purchase 
modify lr_date date;

update purchase set received_date = (select date_format(str_to_date(received_date,'%d-%m-%Y'),'%Y-%m-%d'))
where received_date != '';

update purchase set received_date = '9999-01-20' where received_date = '';

ALTER TABLE purchase 
modify received_date date;

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


alter table purchase
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
alter table purchase_detail
add column center_id bigint after purchase_id,
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;

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

update purchase_detail set batch_date = null where batch_date = '9999-01-20';alter table purchase_ledger
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;-- updates to sale details..

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

  -- Processing Sale table : Drop sale_datetime
update sale set sale_datetime =
(select date_format(str_to_date(sale_datetime,'%d-%m-%Y %k:%i:%s'),'%Y-%m-%d %k:%i:%s'));

ALTER TABLE sale CHANGE sale_datetime sale_date_time datetime;

ALTER TABLE sale CHANGE total_qty total_quantity int(20);

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







  
  


update sale_return set return_date = (select date_format(str_to_date(return_date,'%d-%m-%Y'),'%Y-%m-%d'))
where return_date != '';

update sale_return set return_date = '9999-01-20' where return_date = '';

ALTER TABLE sale_return 
modify return_date datetime;

alter table sale_return
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
alter table sale_return_detail
add column center_id bigint after id,
add column createdAt datetime,
add column updatedAt datetime,
add column created_by bigint,
add column updated_by bigint;
