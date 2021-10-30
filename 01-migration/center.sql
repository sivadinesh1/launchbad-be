





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






  
  

