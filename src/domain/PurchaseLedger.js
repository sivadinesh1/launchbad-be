import { Transform, Type } from 'class-transformer';
import { IsString, IsInt } from 'class-validator';

export class PurchaseLedger {
	id;

	center_id;

	vendor_id;
	purchase_ref_id;
	payment_ref_id;

	ledger_date;

	ledger_detail;
	credit_amt;
	debit_amt;
	balance_amt;

	createdAt;

	updatedAt;

	created_by;

	updated_by;

	constructor(
		id,
		center_id,
		vendor_id,
		purchase_ref_id,
		payment_ref_id,
		ledger_date,
		ledger_detail,
		credit_amt,
		debit_amt,
		balance_amt,

		createdAt,
		updatedAt,
		created_by,
		updated_by,
	) {
		this.id = id;
		this.center_id = center_id;

		this.vendor_id = vendor_id;
		this.purchase_ref_id = purchase_ref_id;
		this.payment_ref_id = payment_ref_id;
		this.ledger_date = ledger_date;
		this.ledger_detail = ledger_detail;
		this.credit_amt = credit_amt;
		this.debit_amt = debit_amt;
		this.balance_amt = balance_amt;

		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.created_by = created_by;
		this.updated_by = updated_by;
	}
}
