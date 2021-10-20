import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export interface ILedger {
	id?: number;
	center_id: number;
	customer_id: number;
	invoice_ref_id: number;
	payment_ref_id: number;
	ledger_detail: string;
	credit_amt: number;
	debit_amt: number;
	balance_amt: number;
	ledger_date: Date;

	createdAt?: Date;
	updatedAt?: Date;
	created_by?: number;
	updated_by?: number;
}

export class Ledger implements ILedger {
	@Type(() => Number)
	id: number = 0;

	@Type(() => Number)
	center_id: number = 0;

	customer_id: number = 0;
	invoice_ref_id: number = 0;
	payment_ref_id: number = 0;

	@Type(() => Date)
	ledger_date: Date = new Date();

	ledger_detail: string = '';
	credit_amt: number = 0.0;
	debit_amt: number = 0.0;
	balance_amt: number = 0.0;

	@Type(() => Date)
	createdAt!: Date;
	@Type(() => Date)
	updatedAt!: Date;
	@Type(() => Number)
	created_by!: number;
	@Type(() => Number)
	updated_by!: number;

	// constructor(
	// 	id: number,
	// 	center_id: number,
	// 	customer_id: number,
	// 	invoice_ref_id: number,
	// 	payment_ref_id: number,
	// 	ledger_date: Date,
	// 	ledger_detail: string,
	// 	credit_amt: number,
	// 	debit_amt: number,
	// 	balance_amt: number,

	// 	createdAt: Date,
	// 	updatedAt: Date,
	// 	created_by: number,
	// 	updated_by: number,
	// ) {
	// 	this.id = id;
	// 	this.center_id = center_id;

	// 	this.customer_id = customer_id;
	// 	this.invoice_ref_id = invoice_ref_id;
	// 	this.payment_ref_id = payment_ref_id;
	// 	this.ledger_date = ledger_date;
	// 	this.ledger_detail = ledger_detail;
	// 	this.credit_amt = credit_amt;
	// 	this.debit_amt = debit_amt;
	// 	this.balance_amt = balance_amt;

	// 	this.createdAt = createdAt;
	// 	this.updatedAt = updatedAt;
	// 	this.created_by = created_by;
	// 	this.updated_by = updated_by;
	// }
}
