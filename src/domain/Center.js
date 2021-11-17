export class Center {
	id;

	company_id;

	name;
	address1;
	address2;
	address3;
	state_id;
	pin;
	district;
	country;
	location;
	gst;
	bank_name;
	account_name;
	account_no;
	ifsc_code;
	branch;
	phone;
	mobile;
	mobile2;
	whatsapp;
	email;
	tagline;
	logo_name;
	logo_url;
	side_logo_name;
	side_logo_url;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		company_id,

		name,
		address1,
		address2,
		address3,
		state_id,
		pin,
		district,
		country,
		location,
		gst,
		bank_name,
		account_name,
		account_no,
		ifsc_code,
		branch,
		phone,
		mobile,
		mobile2,
		whatsapp,
		email,
		tagline,
		logo_name,
		logo_url,
		side_logo_name,
		side_logo_url,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
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
