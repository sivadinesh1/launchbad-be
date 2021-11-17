export class CenterBanks {
	id;

	center_id;

	bank_name;
	account_name;
	account_no;
	ifsc_code;
	branch;
	is_default;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,

		bank_name,
		account_name,
		account_no,
		ifsc_code,
		branch,
		is_default,
		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.bank_name = bank_name;
		this.account_name = account_name;
		this.account_no = account_no;
		this.ifsc_code = ifsc_code;
		this.branch = branch;
		this.is_default = is_default;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
