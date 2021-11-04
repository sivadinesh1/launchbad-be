let PurchaseLedger = {
	id: 0,
	center_id: 0,
	vendor_id: 0,
	purchase_ref_id: 0,
	payment_ref_id: 0,

	ledger_date: new Date(),

	ledger_detail: '',
	credit_amt: 0.0,
	debit_amt: 0.0,
	balance_amt: 0.0,
	created_by: '',
	updated_by: '',
};

module.exports = { PurchaseLedger };
