ALTER TABLE enquiry_detail 
change askqty ask_quantity int(20),
change giveqty give_quantity int(11),
change createddate createdAt datetime,
change updateddate updatedAt datetime,
change updatedby updated_by bigint,
change createdby created_by bigint ;

alter table enquiry_detail
add column center_id bigint after id ;