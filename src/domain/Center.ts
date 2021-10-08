import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface ICenter {
	id?: number;
	company_id: number;

	name: string;
	address1: string;
	address2: string;
	address3: string;
	state_id: number;
	pin: string;
	district: string;
	country: string;
	location: string;
	gst: string;
	bank_name: string;
	account_name: string;
	account_no: string;
	ifsc_code: string;
	branch: string;
	phone: string;
	mobile: string;
	mobile2: string;
	whatsapp: string;
	email: string;
	tagline: string;
	logo_name: string;
	logo_url: string;
	side_logo_name: string;
	side_logo_url: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Center implements ICenter {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	company_id: number;

	name: string;
	address1: string;
	address2: string;
	address3: string;
	state_id: number;
	pin: string;
	district: string;
	country: string;
	location: string;
	gst: string;
	bank_name: string;
	account_name: string;
	account_no: string;
	ifsc_code: string;
	branch: string;
	phone: string;
	mobile: string;
	mobile2: string;
	whatsapp: string;
	email: string;
	tagline: string;
	logo_name: string;
	logo_url: string;
	side_logo_name: string;
	side_logo_url: string;

	@Type(() => Date)
	createdAt: Date;
	@Type(() => Date)
	updatedAt: Date;
	@Type(() => Number)
	created_by: number;
	@Type(() => Number)
	updated_by: number;

	constructor(
		id: number,
		company_id: number,

		name: string,
		address1: string,
		address2: string,
		address3: string,
		state_id: number,
		pin: string,
		district: string,
		country: string,
		location: string,
		gst: string,
		bank_name: string,
		account_name: string,
		account_no: string,
		ifsc_code: string,
		branch: string,
		phone: string,
		mobile: string,
		mobile2: string,
		whatsapp: string,
		email: string,
		tagline: string,
		logo_name: string,
		logo_url: string,
		side_logo_name: string,
		side_logo_url: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.company_id = company_id;

		this.name = name;
		this.address1 = address1;
		this.address2 = address2;
		this.address3 = address3;
		this.state_id = state_id;
		this.pin = pin;
		this.district = district;
		this.country = country;
		this.location = location;
		this.gst = gst;
		this.bank_name = bank_name;
		this.account_name = account_name;
		this.account_no = account_no;
		this.ifsc_code = ifsc_code;
		this.branch = branch;
		this.phone = phone;
		this.mobile = mobile;
		this.mobile2 = mobile2;
		this.whatsapp = whatsapp;
		this.email = email;
		this.tagline = tagline;
		this.logo_name = logo_name;
		this.logo_url = logo_url;
		this.side_logo_name = side_logo_name;
		this.side_logo_url = side_logo_url;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
