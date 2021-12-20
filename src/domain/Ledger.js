let Ledger = {
	id: 0,
	center_id: 0,
	customer_id: 0,
	invoice_ref_id: 0,
	payment_ref_id: 0,

	ledger_date: new Date(),

	ledger_detail: '',
	credit_amt: 0.0,
	debit_amt: 0.0,
	balance_amt: 0.0,
	created_by: '',
};

module.exports = { Ledger };
