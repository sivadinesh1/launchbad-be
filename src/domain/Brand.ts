import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface IBrand {
	id?: number;
	center_id: number;
	brand_name: string;
	is_active: string;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Brand implements IBrand {
	@Type(() => Number)
	id: number;

	@Type(() => Number)
	center_id: number;

	brand_name: string;
	is_active: string;

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
		brand_name: string,
		is_active: string,

		createdAt: Date,
		updatedAt: Date,
		created_by: number,
		updated_by: number,
	) {
		this.id = id;
		this.center_id = center_id;

		this.brand_name = brand_name;
		this.is_active = is_active;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
