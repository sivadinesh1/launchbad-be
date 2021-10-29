import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export class Vendor {
	id;

	center_id;

	vendor_name;
	address1;
	address2;
	address3;
	district;

	state_id;
	pin;
	gst;
	phone;
	mobile;
	mobile2;
	whatsapp;
	email;
	is_active;

	credit_amt;

	balance_amt;

	last_paid_date;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		vendor_name,
		address1,
		address2,
		address3,
		district,
		state_id,
		pin,
		gst,
		phone,
		mobile,
		mobile2,
		whatsapp,
		email,
		is_active,
		credit_amt,
		balance_amt,
		last_paid_date,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.vendor_name = vendor_name;
		this.address1 = address1;
		this.address2 = address2;
		this.address3 = address3;
		this.district = district;
		this.state_id = state_id;
		this.pin = pin;
		this.gst = gst;
		this.phone = phone;
		this.mobile = mobile;
		this.mobile2 = mobile2;
		this.whatsapp = whatsapp;
		this.email = email;
		this.is_active = is_active;
		this.credit_amt = credit_amt;
		this.balance_amt = balance_amt;
		this.last_paid_date = last_paid_date;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
