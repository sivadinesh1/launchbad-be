
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
add column updated_by bigint;