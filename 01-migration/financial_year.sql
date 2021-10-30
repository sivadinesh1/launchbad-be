RENAME TABLE financialyear TO financial_year;


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
