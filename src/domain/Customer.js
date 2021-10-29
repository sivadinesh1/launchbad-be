import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export class Customer {
	id;

	center_id;

	state_id;

	name;
	address1;
	address2;
	address3;
	district;
	pin;
	gst;
	phone;
	whatsapp;

	mobile;
	mobile2;
	email;
	is_active;
	contact;
	tin;
	pan_no;

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
		state_id,
		name,
		address1,
		address2,
		address3,
		district,
		pin,
		gst,
		phone,
		whatsapp,

		mobile,
		mobile2,
		email,
		is_active,
		contact,
		tin,
		pan_no,
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
		this.state_id = state_id;
		this.name = name;
		this.address1 = address1;
		this.address2 = address2;
		this.address3 = address3;
		this.district = district;
		this.pin = pin;
		this.gst = gst;
		this.phone = phone;
		this.whatsapp = whatsapp;

		this.mobile = mobile;
		this.mobile2 = mobile2;
		this.email = email;
		this.is_active = is_active;
		this.contact = contact;
		this.tin = tin;
		this.pan_no = pan_no;
		this.credit_amt = credit_amt;
		this.balance_amt = balance_amt;
		this.last_paid_date = last_paid_date;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
