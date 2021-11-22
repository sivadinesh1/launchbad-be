ALTER TABLE enquiry 
change estatus e_status varchar(1),
change createddate createdAt datetime,
change updateddate updatedAt datetime,
change updatedby updated_by bigint,
change createdby created_by bigint ;