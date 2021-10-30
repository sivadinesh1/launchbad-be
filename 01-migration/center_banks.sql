
ALTER TABLE center_banks 
change bankname bank_name varchar(100),
change accountname account_name varchar(150),
change accountno account_no varchar(50),
change ifsccode ifsc_code varchar(50),
change createddate createdAt datetime,
change updateddate updatedAt datetime,
change updatedby updated_by bigint,
change createdby created_by bigint ;