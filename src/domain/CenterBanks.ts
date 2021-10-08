import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface ICenterBanks {
	id?: number;
	center_id: number;

	bank_name: string;

	account_name: string;
	account_no: string;
	ifsc_code: string;
	branch: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class CenterBanks implements ICenterBanks {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	bank_name: string;
	account_name: string;
	account_no: string;
	ifsc_code: string;
	branch: string;

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
		center_id: number,

		bank_name: string,
		account_name: string,
		account_no: string,
		ifsc_code: string,
		branch: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.bank_name = bank_name;
		this.account_name = account_name;
		this.account_no = account_no;
		this.ifsc_code = ifsc_code;
		this.branch = branch;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
