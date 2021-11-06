
ALTER TABLE product 
change unit uom varchar(50),
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




