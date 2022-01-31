var pool = require('../config/db');
const { prisma } = require('../config/prisma');

// Repors
const FinancialYearRepo = require('../repos/financial-year.repo');
const SaleRepo = require('../repos/sale.repo');
const SaleDetailRepo = require('../repos/sale-detail.repo');
const ItemHistoryRepo = require('../repos/item-history.repo');
const EnquiryRepo = require('../repos/enquiry.repo');
const CustomerRepo = require('../repos/customer.repo');
const AuditRepo = require('../repos/audit.repo');
const StockRepo = require('../repos/stock.repo');
const SaleLedgerRepo = require('../repos/sale-ledger.repo');

// Services
const { addSaleLedgerRecord } = require('./accounts.service');

// model
const { Ledger } = require('../domain/Ledger');
const { Audit } = require('../domain/Audit');

// Utils
const {
	getTimezone,
	formatSequenceNumber,
	currentTimeInTimeZone,
	toTimeZoneFormat,
	promisifyQuery,
} = require('../utils/utils');

const getNextInvSequenceNo = async (center_id, invoice_type) => {
	let nextInvSeqNo;
	if (invoice_type === 'gstInvoice') {
		nextInvSeqNo = await FinancialYearRepo.getNextInvSequenceNo(center_id);
	} else if (invoice_type === 'stockIssue') {
		nextInvSeqNo = await FinancialYearRepo.getNextStockIssueSequenceNoAsync(
			center_id
		);
	}

	return nextInvSeqNo;
};

const getSalesMaster = async (sales_id) => {
	let query = `select s.*, c.name, c.address1, c.address2, c.district 
	from sale s,
	customer c where s.customer_id = c.id and s.id = '${sales_id}' `;

	return promisifyQuery(query);
};

const insertSale = async (saleMaster, saleDetails) => {
	try {
		const status = await prisma.$transaction(async (prisma) => {
			// 1. Update Sequence Generator and form a formatted sale invoice
			let invNo =
				saleMaster.invoice_no === undefined ||
				saleMaster.invoice_no === null
					? ''
					: saleMaster.invoice_no;

			// confirmed sale
			if (
				saleMaster.status === 'C' &&
				saleMaster.revision === 0 &&
				saleMaster.inv_gen_mode === 'A'
			) {
				let result = await FinancialYearRepo.updateInvoiceSequence(
					saleMaster.center_id,
					prisma
				);
				invNo = formatSequenceNumber(result.inv_seq);
				saleMaster.invoice_no = invNo;
			} else if (
				// draft or stock issue
				saleMaster.status === 'D' &&
				saleMaster.invoice_type === 'gstInvoice' &&
				saleMaster.inv_gen_mode === 'A' &&
				saleMaster.invoice_no.startsWith('D') === false
			) {
				let result =
					await FinancialYearRepo.updateDraftInvoiceSequenceGenerator(
						saleMaster.center_id,
						prisma
					);
				invNo = formatSequenceNumber(result.draft_inv_seq, 'D/');
				saleMaster.invoice_no = invNo;
				console.log('draft invoice ' + invNo);
			} else if (
				// draft or stock issue
				saleMaster.status === 'D' &&
				saleMaster.inv_gen_mode === 'A' &&
				saleMaster.invoice_type === 'stockIssue' &&
				saleMaster.invoice_no.startsWith('SI') === false
			) {
				let result =
					await FinancialYearRepo.updateStockIssueSequenceGenerator(
						saleMaster.center_id,
						prisma
					);
				invNo = formatSequenceNumber(result.draft_inv_seq, 'SI/');
				saleMaster.invoice_no = invNo;
			}

			// sale master insert/update
			let sale_master;
			if (saleMaster.id === null) {
				sale_master = await SaleRepo.addSaleMaster(saleMaster, prisma);
			} else {
				sale_master = await SaleRepo.editSaleMaster(saleMaster, prisma);
			}

			let detailsInserted = await insertSaleDetails(
				saleMaster,
				saleDetails,
				sale_master,
				prisma
			);

			if (
				(saleMaster.status === 'C' && saleMaster.id === null) ||
				(saleMaster.status === 'C' &&
					saleMaster.id !== null &&
					saleMaster.revision === 0)
			) {
				let result = await prepareAndAddSaleLedgerEntry(
					sale_master,
					prisma
				);
				let result991 = await updateCustomerBalanceAmt(
					sale_master,
					prisma
				);
			} else if (saleMaster.status === 'C' && saleMaster.id !== null) {
				let saleLedger = await prepareAndAddSaleLedgerReversalEntry(
					sale_master,
					prisma
				);

				let saleLedger1 = await prepareSaleLedgerEntryAfterReversal(
					sale_master,
					prisma
				);

				// check if customer has changed
				if (saleMaster.hasCustomerChange) {
					let result =
						await SaleLedgerRepo.updateSaleLedgerCustomerChange(
							saleMaster.center_id,
							sale_master.id,
							saleMaster.old_customer_id,
							prisma
						);

					// audit
					let audit = await prepareAndAddCustomerChangeAudit(
						saleMaster,
						sale_master,
						prisma
					);
				}
				let result991 = await updateCustomerBalanceAmt(
					sale_master,
					prisma
				);
			}

			return {
				status: 'success',
				id: sale_master.id,
				invoice_no: saleMaster.invoice_no,
			};
		});
		return status;
	} catch (error) {
		console.log('Error while inserting Sale ' + error);
		throw error;
	}
};

async function insertSaleDetails(saleMaster, saleDetails, sale_master, prisma) {
	for await (const item of saleDetails) {
		try {
			let result;

			if (item.id === null || item.id === 0) {
				result = await SaleDetailRepo.addSaleDetail(
					item,
					sale_master.id,
					sale_master.updated_by,
					prisma
				);
			} else {
				result = await SaleDetailRepo.editSaleDetail(
					item,
					sale_master.id,
					sale_master.updated_by,
					prisma
				);
			}

			// after sale details is updated, then update stock (as this is sale, reduce available stock) tbl & product tbl
			let qty_to_update = item.quantity - item.old_val;

			let result2 = await StockRepo.stockMinus(
				qty_to_update,
				item.stock_id,
				saleMaster.updated_by,
				prisma
			);

			let itemHistory = await prepareItemHistory(
				item,
				sale_master.id,
				result.id,
				saleMaster,
				prisma
			);

			if (
				saleMaster.status === 'C' ||
				(saleMaster.status === 'D' &&
					saleMaster.invoice_type === 'stockIssue')
			) {
				if (itemHistory.txn_qty !== 0) {
					let result3 = await ItemHistoryRepo.addItemHistory(
						itemHistory,
						prisma
					);
				}
			}

			if (
				saleMaster.enquiry_ref !== 0 &&
				saleMaster.enquiry_ref !== null
			) {
				await EnquiryRepo.updateEnquiryAfterSale(
					saleMaster.enquiry_ref,
					sale_master.id,
					prisma
				);
			}
		} catch (error) {
			throw new Error(
				`error :: insertSaleDetails sale.services.js ` + error.message
			);
		}
	}
}

function updateCustomerBalanceAmt(sale_master, prisma) {
	return new Promise(async (resolve, reject) => {
		try {
			let balanceAmt = await SaleLedgerRepo.getCustomerBalance(
				sale_master.customer_id,
				sale_master.center_id,
				prisma
			);

			let result91 = await CustomerRepo.updateCustomerBalance(
				sale_master.customer_id,
				balanceAmt,
				prisma
			);
			resolve('success');
		} catch (error) {
			reject(error);
		}
	});
}

function prepareAndAddSaleLedgerEntry(sale_master, prisma) {
	return new Promise(async (resolve, reject) => {
		let saleLedger = Ledger;
		try {
			let previousBalance = await SaleLedgerRepo.getCustomerBalance(
				sale_master.customer_id,
				sale_master.center_id,
				prisma
			);

			saleLedger.center_id = sale_master.center_id;
			saleLedger.customer_id = sale_master.customer_id;
			saleLedger.invoice_ref_id = sale_master.id;
			saleLedger.ledger_detail = 'Invoice';
			saleLedger.balance_amt =
				Number(previousBalance) + Number(sale_master.net_total);
			saleLedger.credit_amt = sale_master.net_total;
			saleLedger.created_by = sale_master.updated_by;
			saleLedger.updated_by = sale_master.updated_by;

			let result = await SaleLedgerRepo.addSaleLedgerEntry(
				saleLedger,
				prisma
			);

			resolve(result);
		} catch (error) {
			console.log('error in prepareSaleLedgerEntry:: ' + error);
			reject(error);
		}
	});
}

function prepareSaleLedgerEntryAfterReversal(sale_master, prisma) {
	return new Promise(async (resolve, reject) => {
		let saleLedger = Ledger;
		try {
			let previousBalance = await SaleLedgerRepo.getCustomerBalance(
				sale_master.customer_id,
				sale_master.center_id,
				prisma
			);

			saleLedger.center_id = sale_master.center_id;
			saleLedger.customer_id = sale_master.customer_id;
			saleLedger.invoice_ref_id = sale_master.id;
			saleLedger.ledger_detail = 'Invoice';
			saleLedger.balance_amt =
				Number(previousBalance) + Number(sale_master.net_total);
			saleLedger.credit_amt = sale_master.net_total;
			saleLedger.created_by = sale_master.updated_by;
			saleLedger.updated_by = sale_master.updated_by;

			let result = await SaleLedgerRepo.addSaleLedgerEntry(
				saleLedger,
				prisma
			);
		} catch (error) {
			console.log(
				'error in prepareSaleLedgerEntryAfterReversal:: ' + error
			);
			reject(error);
		}
		resolve(saleLedger);
	});
}

async function prepareAndAddSaleLedgerReversalEntry(sale_master, prisma) {
	return new Promise(async (resolve, reject) => {
		let saleLedger = Ledger;
		try {
			let previousBalance = await SaleLedgerRepo.getCustomerBalance(
				sale_master.customer_id,
				sale_master.center_id,
				prisma
			);

			let credit_amt =
				await SaleLedgerRepo.getCreditAmtForInvoiceReversal(
					sale_master.customer_id,
					sale_master.center_id,
					sale_master.id,
					prisma
				);

			saleLedger.center_id = sale_master.center_id;
			saleLedger.customer_id = sale_master.customer_id;
			saleLedger.invoice_ref_id = sale_master.id;
			saleLedger.ledger_detail = 'Invoice Reversal';
			saleLedger.debit_amt = credit_amt;
			saleLedger.balance_amt =
				Number(previousBalance) - Number(credit_amt);
			saleLedger.credit_amt = sale_master.net_total;
			saleLedger.created_by = sale_master.updated_by;
			saleLedger.updated_by = sale_master.updated_by;

			let result = await SaleLedgerRepo.addSaleLedgerEntry(
				saleLedger,
				prisma
			);
		} catch (error) {
			console.log('error in prepareSaleLedgerReversalEntry:: ' + error);
			reject(error);
		}
		resolve(saleLedger);
	});
}

async function prepareAndAddCustomerChangeAudit(
	saleMaster,
	sale_master,
	prisma
) {
	let audit = new Audit();
	try {
		audit.center_id = saleMaster.center_id;
		audit.revision = 0;
		audit.module = 'Ledger';
		audit.module_ref_id = sale_master.id;
		audit.module_ref_det_id = sale_master.id;
		audit.action = 'Customer Updated';
		audit.old_value = saleMaster.old_customer_id.toString();
		audit.new_value = saleMaster.customer_id.toString();
		audit.created_by = saleMaster.updated_by;
		audit.updated_by = saleMaster.updated_by;

		let auditResult = await AuditRepo.addAudit(audit, prisma);

		return audit;
	} catch (error) {
		throw new Error(
			`error :: prepareAndAddCustomerChangeAudit sales.service.js ` +
				error.message
		);
	}
}

async function prepareItemHistory(
	item,
	sale_id,
	sale_detail_id,
	saleMaster,
	prisma
) {
	const product_count = await StockRepo.stockCount(item.product_id, prisma);

	// to avoid duplicate entry of history items when editing completed records
	// with same qty. (status = 'c'). If status=C & k.qty - k.old_val !== 0 then updateHistoryTable
	let skipHistoryUpdate = false;

	// if sale details id is missing its new else update
	let saleDetailId = item.id === undefined ? sale_detail_id : item.id;
	let txn_qty =
		item.id === undefined ? item.quantity : item.quantity - item.old_val;
	let action_type = 'Sold';
	let saleId = sale_id === undefined ? item.sale_id : sale_id;

	// revision '0' is Status 'C' new record. txn_qty === 0 means (item.qty - item.old_val)
	if (
		saleMaster.revision === 0 &&
		txn_qty === 0 &&
		saleMaster.invoice_type !== 'stockIssue'
	) {
		txn_qty = item.quantity;
	}

	//txn -ve means subtract from qty
	// example old value (5) Edited and sold (3)
	// now txn_qty will be (3) (sold qty)
	if (txn_qty < 0) {
		action_type = `Edited: ${item.old_val} To: ${item.quantity}`;
		txn_qty = item.old_val - item.quantity;
	} else if (txn_qty > 0 && saleMaster.revision > 0) {
		action_type = `Edited: ${item.old_val} To: ${item.quantity}`;
		txn_qty = item.quantity - item.old_val;
	}

	// completed txn (if revision > 0) txn_qty 0 means no changes happened
	if (
		saleMaster.revision > 0 &&
		txn_qty === 0 &&
		saleMaster.invoice_type !== 'stockIssue'
	) {
		skipHistoryUpdate = true;
	}

	if (
		saleMaster.revision === 0 &&
		txn_qty === 0 &&
		saleMaster.invoice_type === 'stockIssue'
	) {
		skipHistoryUpdate = true;
	}

	// convert -ve to positive number
	//~ bitwise operator. Bitwise does not negate a number exactly. eg:  ~1000 is -1001, not -1000 (a = ~a + 1)
	txn_qty = ~txn_qty + 1;

	let itemHistory = {
		center_id: saleMaster.center_id,
		module: 'Sale',
		product_ref_id: item.product_id,
		sale_id: saleId,
		sale_det_id: saleDetailId,
		action: '',
		action_type: action_type,
		mrp: item.mrp,
		txn_qty: txn_qty,
		stock_level: product_count,
		txn_date: new Date(),
		sale_return_id: 0,
		sale_return_det_id: 0,
		purchase_id: 0,
		purchase_det_id: 0,
		purchase_return_id: 0,
		purchase_return_det_id: 0,

		created_by: saleMaster.updated_by,
		updated_by: saleMaster.updated_by,
	};

	return itemHistory;
}

// check
const updateProductAsync = async (k) => {
	let query = ` update product set current_stock = (select sum(available_stock) 
								from stock where product_id = '${k.product_id}' ) where id = '${k.product_id}' `;

	return promisifyQuery(query);
};

const insertAuditTblforDeleteSaleDetailsRecAsync = async (element, sale_id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let query = `
	INSERT INTO audit (module, module_ref_id, module_ref_det_id, action, old_value, new_value, audit_date, center_id)
	VALUES
		('Sales', '${sale_id}', '${element.id}', 'delete', 
		(SELECT CONCAT('[{', result, '}]') as final
		FROM (
			SELECT GROUP_CONCAT(CONCAT_WS(',', CONCAT('"saleId": ', sale_id), CONCAT('"productId": "', product_id, '"'), CONCAT('"quantity": "', quantity, '"')) SEPARATOR '},{') as result
			FROM (
				SELECT sale_id, product_id, quantity
				FROM sale_detail where id = '${element.id}'
			) t1
		) t2)
		, '', '${today}', (select center_id from sale where id = '${sale_id}')
		) `;

	return promisifyQuery(query);
};

const deleteSaleDetailsRecAsync = (element) => {
	let query = `
	delete from sale_detail where id = '${element.id}' `;

	return promisifyQuery(query);
};

const deleteSaleDetail = async (id) => {
	let query = `
				delete from sale_detail where id = '${id}' `;

	return promisifyQuery(query);
};

const updatePrintCounter = (sale_id) => {
	let today = currentTimeInTimeZone('DD-MM-YYYY HH:mm:ss');

	let query = ` update sale
	set print_count = CASE
		 WHEN print_count= -1 then print_count + 2
		 ELSE print_count + 1
		END
		where id = '${sale_id}' `;

	return promisifyQuery(query);
};

const getPrintCounter = (sale_id) => {
	let today = currentTimeInTimeZone('DD-MM-YYYY HH:mm:ss');

	let query = ` select print_count from sale where id = '${sale_id}'  `;

	return promisifyQuery(query);
};

const duplicateinvoice_noCheck = (invoice_no, center_id) => {
	let today = currentTimeInTimeZone('DD-MM-YYYY HH:mm:ss');

	let query = ` select count(*) as count from sale where invoice_no = '${invoice_no}' and center_id = '${center_id}' `;

	let data = promisifyQuery(query);
	return data[0].count;
};

// convert stock issue to sale
// 1. update sale table with status 'C' & sale type as 'gstInvoice'
// 2. insert ledger with payment details
const convertSale = async (requestBody) => {
	let center_id = requestBody.center_id;
	let sales_id = requestBody.sales_id;
	let old_invoice_no = requestBody.old_invoice_no;
	let old_stock_issued_date = requestBody.old_stock_issued_date;
	let customer_id = requestBody.customer_id;
	let net_total = requestBody.net_total;

	let today = currentTimeInTimeZone('YYYY-MM-DD');

	try {
		// (1) Updates inv_seq in tbl financial_year, then {returns} formatted sequence {YY/MM/inv_seq}
		const status = await prisma.$transaction(async (prisma) => {
			let result = await FinancialYearRepo.updateInvoiceSequence(
				center_id,
				prisma
			);
			invNo = formatSequenceNumber(result.inv_seq);

			// await updateSequenceGenerator({
			// 	invoice_type: 'gstInvoice',
			// 	center_id: center_id,
			// 	invoice_date: today,
			// });
			// let invNo = await getSequenceNo({
			// 	invoice_type: 'gstInvoice',
			// 	center_id: center_id,
			// 	invoice_date: today,
			// });

			let query = ` update sale set invoice_no = '${invNo}', invoice_type = "gstInvoice", status = "C", stock_issue_ref = '${old_invoice_no}', revision = '1',
	invoice_date = '${today}', 
	stock_issue_date_ref =
	'${toTimeZoneFormat(old_stock_issued_date, 'YYYY-MM-DD')}'
	
	where id = ${sales_id} `;

			let data = promisifyQuery(query);
			await addSaleLedgerRecord(
				{
					center_id: center_id,
					customer_ctrl: { id: customer_id },
					net_total: net_total,
				},
				sales_id
			);

			return {
				result: 'success',
				invoice_no: invNo,
			};
		});
		return status;
	} catch (error) {
		console.log('Error while inserting Sale ' + error);
	}
};

// const deleteSaleMaster = async (sale_id) => {
// 	let query = `
// 		delete from sale where
// 	id = '${sale_id}' `;

// 	let data = promisifyQuery(query);
// 	return {
// 		result: 'success',
// 	};
// };

const deleteSaleMasterTxn = async (sale_id, center_id, user_id) => {
	try {
		const status = await prisma.$transaction(async (prisma) => {
			let result1 = await SaleRepo.deleteSaleMaster(sale_id, prisma);

			let result2 = await prepareAndDoSaleMasterDeleteAudit(
				center_id,
				sale_id,
				user_id,
				prisma
			);

			return {
				result: 'success',
			};
		});
		return status;
	} catch (error) {
		console.log('Error while deleteSaleMasterTxn Sale ' + error);
		throw error;
	}
};

async function prepareAndDoSaleMasterDeleteAudit(
	center_id,

	sale_id,

	user_id,
	prisma
) {
	try {
		let audit = {
			center_id: center_id,
			revision: 0,
			module: 'Sale',
			module_ref_id: sale_id,
			module_ref_det_id: '0',
			action: 'delete',
			old_value: sale_id,
			new_value: '',
			created_by: user_id,
			updated_by: user_id,
		};

		let auditResult = await AuditRepo.addAudit(audit, prisma);

		return audit;
	} catch (error) {
		throw new Error(
			`error :: prepareAndDoSaleDeleteAudit sale.service.js ` +
				error.message
		);
	}
}

const updateGetPrintCounter = async (sale_id) => {
	let response = await updatePrintCounter(sale_id);
	let counter = await getPrintCounter(sale_id);
	return { counter };
};

const deleteSaleTxn = async (sale_id, center_id, user_id) => {
	try {
		const status = await prisma.$transaction(async (prisma) => {
			let saleDetails = await SaleDetailRepo.getSaleDetailsTxn(
				sale_id,
				prisma
			);

			let retValue = await deleteSaleDetailsTxn(
				saleDetails,
				sale_id,
				center_id,
				user_id,
				prisma
			);

			return {
				result: 'success',
				id: sale_id,
				//		invoice_no: saleMaster.invoice_no,
			};
		});
		return status;
	} catch (error) {
		console.log('Error while deleteSaleTxn Sale ' + error);
		throw error;
	}
};

const deleteSaleDetailsTxn = async (
	saleDetails,
	sale_id,
	center_id,
	user_id,
	prisma
) => {
	for await (const item of saleDetails) {
		try {
			// step 1
			// prepare audit table
			let result1 = await prepareAndDoSaleDeleteAudit(
				center_id,
				item.id,
				sale_id,
				user_id,
				prisma
			);

			// step 2
			// delete sale details
			let result2 = await SaleDetailRepo.deleteSaleDetailById(
				item.id,
				prisma
			);

			// step 3
			let result3 = await StockRepo.stockAdd(
				item.quantity,
				item.stock_id,
				user_id,
				prisma
			);

			// step 4

			let itemHistory = await prepareItemHistoryDelete(
				center_id,
				sale_id,
				item.id,
				item.product_id,
				item.stock_id,
				item.quantity,
				item.mrp,
				user_id,
				prisma
			);

			result3 = await ItemHistoryRepo.addItemHistory(itemHistory, prisma);
		} catch (error) {
			throw new Error(
				`error :: deleteSaleDetailsTxn sale.services.js ` +
					error.message
			);
		}
	}
};

async function prepareAndDoSaleDeleteAudit(
	center_id,
	sale_detail_id,
	sale_id,

	user_id,
	prisma
) {
	let old_value = await SaleRepo.getOldValue(sale_detail_id, prisma);

	try {
		let audit = {
			center_id: center_id,
			revision: 0,
			module: 'Sale',
			module_ref_id: sale_id,
			module_ref_det_id: sale_detail_id,
			action: 'delete',
			old_value: old_value,
			new_value: '',
			created_by: user_id,
			updated_by: user_id,
		};

		let auditResult = await AuditRepo.addAudit(audit, prisma);

		return audit;
	} catch (error) {
		throw new Error(
			`error :: prepareAndDoSaleDeleteAudit sale.service.js ` +
				error.message
		);
	}
}

const prepareItemHistoryDelete = async (
	center_id,
	sale_id,
	sale_detail_id,
	product_id,
	stock_id,
	quantity,
	mrp,
	user_id,
	prisma
) => {
	const product_count = await StockRepo.stockCount(product_id, prisma);

	let itemHistory = {
		center_id: center_id,
		module: 'Sale',
		product_ref_id: product_id,
		sale_id: sale_id,
		sale_det_id: sale_detail_id,
		action: 'SAL',
		action_type: `Deleted`,
		mrp: `${mrp}`,

		txn_qty: quantity,
		stock_level: product_count,
		txn_date: new Date(),
		sale_return_id: 0,
		sale_return_det_id: 0,
		purchase_id: '0',
		purchase_det_id: '0',
		purchase_return_id: 0,
		purchase_return_det_id: 0,

		created_by: user_id,
	};

	return itemHistory;
};

const getSalesDetails = async (sales_id) => {
	let result = await SaleDetailRepo.getSaleDetails(sales_id);
	return result;
};

const deleteSalesDetailsEachTxn = async (requestBody, center_id, user_id) => {
	let sale_detail_id = requestBody.id;
	let sale_id = requestBody.sale_id;
	let quantity = requestBody.quantity;
	let product_id = requestBody.product_id;
	let stock_id = requestBody.stock_id;
	let mrp = requestBody.mrp;
	let audit_needed = requestBody.audit_needed;

	try {
		const status = await prisma.$transaction(async (prisma) => {
			if (audit_needed) {
				// step 1
				// prepare audit table
				let result1 = await prepareAndDoSaleDeleteAudit(
					center_id,
					sale_detail_id,
					sale_id,
					user_id,
					prisma
				);
			}

			// step 2
			// delete sale details
			let result2 = await SaleDetailRepo.deleteSaleDetailById(
				sale_detail_id,
				prisma
			);

			// step 3 - Update Stock
			let result3 = await StockRepo.stockAdd(
				quantity,
				stock_id,
				user_id,
				prisma
			);

			let itemHistory = await prepareItemHistoryDelete(
				center_id,
				sale_id,
				sale_detail_id,
				product_id,
				stock_id,
				quantity,
				mrp,
				user_id,
				prisma
			);

			result3 = await ItemHistoryRepo.addItemHistory(itemHistory, prisma);
			return {
				result: 'success',
			};
		});
		return status;
	} catch (error) {
		console.log('Error while deleteSalesDetailsEachTxn Sale ' + error);
		throw error;
	}
};

// return {
// 	result: 'success',
// };
// } else {
// return {
// 	result: 'failed',
// };
// }

module.exports = {
	getSalesMaster,

	insertSale,

	updateProductAsync,

	getNextInvSequenceNo,
	insertAuditTblforDeleteSaleDetailsRecAsync,
	deleteSaleDetailsRecAsync,

	deleteSaleDetail,
	updatePrintCounter,
	getPrintCounter,
	duplicateinvoice_noCheck,

	convertSale,
	getSalesDetails,
	updateGetPrintCounter,
	deleteSaleTxn,
	deleteSaleMasterTxn,
	deleteSalesDetailsEachTxn,
};

// const [updateInvoiceSequenceGenerator] = await prisma.$transaction([
// 	prisma.$executeRaw`
// 	update financial_year set inv_seq = inv_seq + 1 where
// 	center_id = ${cloneReq.center_id} and
// 	CURDATE() between start_date and end_date; `,
// ]);

// const result = await prisma.$executeRaw`update financial_year set inv_seq = inv_seq + 1 where
// center_id = ${cloneReq.center_id} and
// CURDATE() between start_date and end_date;`;
