import prisma from '../config/prisma';
import { ISale } from '../domain/Sale';
import { ISaleDetail } from '../domain/SaleDetail';

import FinancialYearRepo from '../repos/financial-year.repo';
import SaleRepo from '../repos/sale.repo';
import SaleDetailRepo from '../repos/sale-detail.repo';

import ItemHistoryRepo from '../repos/item-history.repo';

import EnquiryRepo from '../repos/enquiry.repo';
import CustomerRepo from '../repos/customer.repo';
import AuditRepo from '../repos/audit.repo';

var pool = require('../config/db');
const { addSaleLedgerRecord, addReverseSaleLedgerRecord, addSaleLedgerAfterReversalRecord } = require('../services/accounts.service');

import { IStock } from '../domain/Stock';
import StockRepo from '../repos/stock.repo';
import { ItemHistory } from '../domain/ItemHistory';
import SaleLedgerRepo from '../repos/sale-ledger.repo';
import { ILedger, Ledger } from '../domain/Ledger';
import { Audit } from '../domain/Audit';

// import { getTimezone } from '../utils/utils';

const { getTimezone, formatSequenceNumber, toTimeZone, currentTimeInTimeZone, toTimeZoneFormat, promisifyQuery } = require('../utils/utils');

const { insertItemHistoryTable, updateStockViaId } = require('../services/stock.service');

export const getNextInvSequenceNo = async (center_id: any, invoice_type: any) => {
	let nextInvSeqNo;
	if (invoice_type === 'gstInvoice') {
		nextInvSeqNo = await FinancialYearRepo.getNextInvSequenceNo(center_id);
	} else if (invoice_type === 'stockIssue') {
		nextInvSeqNo = await FinancialYearRepo.getNextStockIssueSequenceNo(center_id);
	}

	return nextInvSeqNo;
};

const getSalesMaster = async (sales_id: number) => {
	let query = `select s.*, c.name, c.address1, c.address2, c.district 
	from sale s,
	customer c where s.customer_id = c.id and s.id = '${sales_id}' `;

	return promisifyQuery(query);
};

const getSalesDetails = async (sales_id: any) => {
	let result = await SaleDetailRepo.getSaleDetails(sales_id);
	return result;

	// let query = ` select sd.*, sd.id as id, sd.sale_id as sale_id,
	// 						sd.product_id as product_id, sd.qty as qty,sd.unit_price as unit_price,
	// 						sd.mrp as mrp, sd.batch_date as batch_date, sd.tax as tax, sd.igs_t as igs_t,
	// 						sd.cgs_t as cgs_t, sd.sgs_t as sgs_t, sd.after_tax_value as tax_value,
	// 						sd.total_value as total_value, p.product_code, p.product_description, p.packet_size, p.tax_rate,
	// 						p.hsn_code, p.unit,
	// 						s.id as stock_pk, s.mrp as stock_mrp, s.available_stock as stock_available_stock
	// 						from
	// 						sale_detail sd, product p, stock s
	// 						where
	// 						p.id = sd.product_id and s.product_id = p.id and
	// 						s.id = sd.stock_id and sd.sale_id = '${sales_id}' `;

	// return promisifyQuery(query);
};

export const insertSale = async (saleMaster: ISale, saleDetails: ISaleDetail[], timezone: string) => {
	console.log('check timezone' + getTimezone());
	try {
		const status = await prisma.$transaction(async (prisma) => {
			// 1. Update Sequence Generator and form a formatted sale invoice
			let invNo = saleMaster.invoice_no === undefined || saleMaster.invoice_no === null ? '' : saleMaster.invoice_no;

			// confirmed sale
			if (saleMaster.status === 'C' && saleMaster.revision === 0 && saleMaster.inv_gen_mode === 'A') {
				let result = await FinancialYearRepo.updateInvoiceSequence(saleMaster.center_id, prisma);
				invNo = formatSequenceNumber(result.inv_seq);
			} else if (
				// draft or stock issue
				saleMaster.status === 'D' &&
				saleMaster.inv_gen_mode === 'A' &&
				saleMaster.invoice_no.startsWith('D') === false &&
				saleMaster.invoice_no.startsWith('SI') === false
			) {
				let result = await FinancialYearRepo.updateDraftInvoiceSequenceGenerator(saleMaster.center_id, prisma);
				invNo = formatSequenceNumber(result.draft_inv_seq);
			}

			// sale master insert/update

			let sale_master = await SaleRepo.addSaleMaster(saleMaster, prisma);

			let detailsInserted = await insertSaleDetails(saleMaster, saleDetails, sale_master, prisma);

			if (saleMaster.status === 'C' && saleMaster.id === null) {
				let result = await prepareAndAddSaleLedgerEntry(saleMaster, prisma);
				let result991 = await updateCustomerBalanceAmt(sale_master, prisma);
			} else if (saleMaster.status === 'C' && saleMaster.id !== null) {
				let saleLedger = await prepareAndAddSaleLedgerReversalEntry(sale_master, prisma);

				let saleLedger1 = await prepareSaleLedgerEntryAfterReversal(sale_master, prisma);

				// check if customer has changed
				if (saleMaster.hasCustomerChange) {
					let result = await SaleLedgerRepo.updateSaleLedgerCustomerChange(
						saleMaster.center_id,
						sale_master.id,
						saleMaster.old_customer_id,
						prisma,
					);

					// audit
					let audit = await prepareAndAddCustomerChangeAudit(saleMaster, sale_master, prisma);
				}
				let result991 = await updateCustomerBalanceAmt(sale_master, prisma);
			}
			console.log('when is it called::');
			return { status: 'success', id: sale_master.id, invoice_no: invNo };
		});
		return status;
	} catch (error) {
		console.log('Error while inserting Sale ' + error);
	}
};

async function insertSaleDetails(saleMaster: ISale, saleDetails: ISaleDetail[], sale_master: ISale, prisma: any) {
	// for await (let i of randomDelays(10, 1000)) console.log(i);

	for await (const item of saleDetails) {
		// for (const item of saleDetails) {
		let result3 = '';

		let result = await SaleDetailRepo.addSaleDetail(item, sale_master.id, prisma);

		// after sale details is updated, then update stock (as this is sale, reduce available stock) tbl & product tbl
		let qty_to_update = item.quantity - item.old_val;

		let result2 = await StockRepo.stockMinus(qty_to_update, item.stock_id, saleMaster.updated_by, prisma);

		let itemHistory = await prepareItemHistory(item, sale_master.id, result.id, saleMaster);

		if (saleMaster.status === 'C' || (saleMaster.status === 'D' && saleMaster.invoice_type === 'stockIssue')) {
			result3 = await ItemHistoryRepo.addItemHistory(itemHistory, prisma);
		}

		if (saleMaster.enquiry_ref !== 0 && saleMaster.enquiry_ref !== null) {
			await EnquiryRepo.updateEnquiryAfterSale(saleMaster.enquiry_ref, sale_master.id, prisma);
		}
	}
}

function updateCustomerBalanceAmt(sale_master: ISale, prisma: any) {
	return new Promise(async (resolve, reject) => {
		try {
			let balanceAmt = await SaleLedgerRepo.getCustomerBalance(sale_master.customer_id, sale_master.center_id, prisma);

			let result91 = await CustomerRepo.updateCustomerBalanceAmt(sale_master.customer_id, balanceAmt, prisma);
			resolve('success');
		} catch (error) {
			reject(error);
		}
	});
}

function prepareAndAddSaleLedgerEntry(sale_master: ISale, prisma: any) {
	return new Promise(async (resolve, reject) => {
		let saleLedger = new Ledger();
		try {
			let previousBalance = await SaleLedgerRepo.getCustomerBalance(sale_master.customer_id, sale_master.center_id, prisma);

			saleLedger.center_id = sale_master.center_id;
			saleLedger.customer_id = sale_master.customer_id;
			saleLedger.invoice_ref_id = sale_master.id;
			saleLedger.ledger_detail = 'Invoice';
			saleLedger.balance_amt = Number(previousBalance) + Number(sale_master.net_total);
			saleLedger.credit_amt = sale_master.net_total;
			saleLedger.created_by = sale_master.updated_by;
			saleLedger.updated_by = sale_master.updated_by;

			let result = await SaleLedgerRepo.addSaleLedgerEntry(saleLedger, prisma);

			resolve(result);
		} catch (error) {
			console.log('error in prepareSaleLedgerEntry:: ' + error);
			reject(error);
		}
	});
}

function prepareSaleLedgerEntryAfterReversal(sale_master: ISale, prisma: any) {
	return new Promise(async (resolve, reject) => {
		let saleLedger = new Ledger();
		try {
			let previousBalance = await SaleLedgerRepo.getCustomerBalance(sale_master.customer_id, sale_master.center_id, prisma);

			saleLedger.center_id = sale_master.center_id;
			saleLedger.customer_id = sale_master.customer_id;
			saleLedger.invoice_ref_id = sale_master.id;
			saleLedger.ledger_detail = 'Invoice';
			saleLedger.balance_amt = previousBalance + sale_master.net_total;
			saleLedger.credit_amt = sale_master.net_total;
			saleLedger.created_by = sale_master.updated_by;
			saleLedger.updated_by = sale_master.updated_by;
		} catch (error) {
			console.log('error in prepareSaleLedgerEntry:: ' + error);
			reject(error);
		}
		resolve(saleLedger);
	});
}

async function prepareAndAddSaleLedgerReversalEntry(sale_master: ISale, prisma: any) {
	return new Promise(async (resolve, reject) => {
		let saleLedger = new Ledger();
		try {
			let previousBalance = await SaleLedgerRepo.getCustomerBalance(sale_master.customer_id, sale_master.center_id, prisma);

			let credit_amt = await SaleLedgerRepo.getCreditAmtForInvoiceReversal(
				sale_master.customer_id,
				sale_master.center_id,
				sale_master.id,
				prisma,
			);

			saleLedger.center_id = sale_master.center_id;
			saleLedger.customer_id = sale_master.customer_id;
			saleLedger.invoice_ref_id = sale_master.id;
			saleLedger.ledger_detail = 'Invoice Reversal';
			saleLedger.debit_amt = credit_amt;
			saleLedger.balance_amt = previousBalance - credit_amt;
			saleLedger.credit_amt = sale_master.net_total;
			saleLedger.created_by = sale_master.updated_by;
			saleLedger.updated_by = sale_master.updated_by;

			let result = await SaleLedgerRepo.addSaleLedgerEntry(saleLedger, prisma);
		} catch (error) {
			console.log('error in prepareSaleLedgerReversalEntry:: ' + error);
			reject(error);
		}
		resolve(saleLedger);
	});
}

async function prepareAndAddCustomerChangeAudit(saleMaster: ISale, sale_master: ISale, prisma: any) {
	return new Promise(async (resolve, reject) => {
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
		} catch (error) {
			console.log('error in Sales.Service.ts :: prepareCustomerChangeAudit:: ' + error);
			reject(error);
		}
		resolve(audit);
	});
}

async function prepareItemHistory(item: ISaleDetail, sale_id: number, sale_detail_id: number, saleMaster: ISale) {
	const product_count = await StockRepo.stockCount(item.product_id, prisma);

	console.log('product_count', product_count);

	// to avoid duplicate entry of history items when editing completed records
	// with same qty. (status = 'c'). If status=C & k.qty - k.old_val !== 0 then updateHistoryTable
	let skipHistoryUpdate = false;

	// if sale details id is missing its new else update
	let saleDetailId = item.id === undefined ? sale_detail_id : item.id;
	let txn_qty = item.id === undefined ? item.quantity : item.quantity - item.old_val;
	let action_type = 'Sold';
	let saleId = sale_id === undefined ? item.sale_id : sale_id;

	// revision '0' is Status 'C' new record. txn_qty === 0 means (item.qty - item.old_val)
	if (saleMaster.revision === 0 && txn_qty === 0 && saleMaster.invoice_type !== 'stockIssue') {
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
	if (saleMaster.revision > 0 && txn_qty === 0 && saleMaster.invoice_type !== 'stockIssue') {
		skipHistoryUpdate = true;
	}

	if (saleMaster.revision === 0 && txn_qty === 0 && saleMaster.invoice_type === 'stockIssue') {
		skipHistoryUpdate = true;
	}

	// convert -ve to positive number
	//~ bitwise operator. Bitwise does not negate a number exactly. eg:  ~1000 is -1001, not -1000 (a = ~a + 1)
	txn_qty = ~txn_qty + 1;

	let itemHistory = new ItemHistory();
	itemHistory.center_id = saleMaster.center_id;
	itemHistory.module = 'Sale';
	itemHistory.product_ref_id = item.product_id;
	itemHistory.sale_id = saleId;
	itemHistory.sale_det_id = saleDetailId;
	itemHistory.action_type = action_type;
	itemHistory.txn_qty = txn_qty;
	itemHistory.created_by = saleMaster.updated_by;
	itemHistory.updated_by = saleMaster.updated_by;

	return itemHistory;
}

// Update Sequence in financial Year tbl DRAFT
async function updateDraftSequenceGenerator(cloneReq: any) {
	let query = '';

	if (cloneReq.invoice_type === 'gstInvoice') {
		query = `
		update financial_year set draft_inv_seq = draft_inv_seq + 1 where 
		center_id = '${cloneReq.center_id}' and  
		CURDATE() between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') `;
	} else if (cloneReq.invoice_type === 'stockIssue') {
		query = `
	update financial_year set stock_issue_seq = stock_issue_seq + 1 where 
	center_id = '${cloneReq.center_id}' and  
	CURDATE() between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') `;
	}

	return await promisifyQuery(query);
}

// format and send sequence #
async function getSequenceNo(cloneReq: any) {
	let invNoQry = '';
	if (cloneReq.invoice_type === 'gstInvoice' && cloneReq.status !== 'D') {
		invNoQry = ` select 
		concat('${currentTimeInTimeZone('Asia/Kolkata', 'YY')}', "/", 
		'${currentTimeInTimeZone('Asia/Kolkata', 'MM')}', "/", lpad(inv_seq, 5, "0")) as invNo from financial_year 
				where 
				center_id = '${cloneReq.center_id}' and  
				CURDATE() between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') `;
	} else if (cloneReq.invoice_type === 'gstInvoice' && cloneReq.status === 'D') {
		invNoQry = ` select concat("D/", 
		'${currentTimeInTimeZone('Asia/Kolkata', 'YY')}', "/", 
		'${currentTimeInTimeZone('Asia/Kolkata', 'MM')}', "/", lpad(draft_inv_seq, 5, "0")) as invNo from financial_year 
							where 
							center_id = '${cloneReq.center_id}' and  
							CURDATE() between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') `;
	} else if (cloneReq.invoice_type === 'stockIssue') {
		invNoQry = ` select concat('SI',"-",'${currentTimeInTimeZone('Asia/Kolkata', 'YY')}', "/", 
		'${currentTimeInTimeZone('Asia/Kolkata', 'MM')}', "/", lpad(stock_issue_seq, 5, "0")) as invNo from financial_year 
				where 
				center_id = '${cloneReq.center_id}' and  
				CURDATE() between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') `;
	}

	let data = await promisifyQuery(invNoQry);
	console.log('dinesh ' + JSON.stringify(data));
	return data[0].invNo;
}

// check
const updateProductAsync = async (k: any) => {
	let query = ` update product set current_stock = (select sum(available_stock) 
								from stock where product_id = '${k.product_id}' ) where id = '${k.product_id}' `;

	return promisifyQuery(query);
};

// const getNextSaleinvoice_noAsync = async (center_id: any, invoice_type: any) => {
// 	let query = '';

// 	let invoice_year = currentTimeInTimeZone('Asia/Kolkata', 'YY');
// 	let invoice_month = currentTimeInTimeZone('Asia/Kolkata', 'MM');

// 	if (invoice_type === 'stockIssue') {
// 		query = `select concat('SI',"-",'${invoice_year}', "/", '${invoice_month}', "/", lpad(stock_issue_seq + 1, 5, "0")) as NxtInvNo from financial_year  where
// 					center_id = '${center_id}' and
// 					CURDATE() between str_to_date(start_date, '%Y-%m-%d') and str_to_date(end_date, '%Y-%m-%d') `;
// 	} else if (invoice_type === 'gstInvoice') {
// 		query = `select concat('${invoice_year}', "/", '${invoice_month}', "/", lpad(inv_seq + 1, 5, "0")) as NxtInvNo from financial_year  where
// 					center_id = '${center_id}' and
// 					CURDATE() between str_to_date(start_date, '%Y-%m-%d') and str_to_date(end_date, '%Y-%m-%d') `;
// 	}
// 	console.log('@dinesh ' + query);
// 	return promisifyQuery(query);
// };

const insertAuditTblforDeleteSaleDetailsRecAsync = async (element: any, sale_id: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `
	INSERT INTO audit_tbl (module, module_ref_id, module_ref_det_id, action, old_value, new_value, audit_date, center_id)
	VALUES
		('Sales', '${sale_id}', '${element.id}', 'delete', 
		(SELECT CONCAT('[{', result, '}]') as final
		FROM (
			SELECT GROUP_CONCAT(CONCAT_WS(',', CONCAT('"saleId": ', sale_id), CONCAT('"productId": "', product_id, '"'), CONCAT('"qty": "', qty, '"')) SEPARATOR '},{') as result
			FROM (
				SELECT sale_id, product_id, qty
				FROM sale_detail where id = '${element.id}'
			) t1
		) t2)
		, '', '${today}', (select center_id from sale where id = '${sale_id}')
		) `;

	return promisifyQuery(query);
};

const deleteSaleDetailsRecAsync = (element: any) => {
	let query = `
	delete from sale_detail where id = '${element.id}' `;

	return promisifyQuery(query);
};

const deleteSaleDetail = async (id: any) => {
	let query = `
				delete from sale_detail where id = '${id}' `;

	return promisifyQuery(query);
};

const updatePrintCounter = (sale_id: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY HH:mm:ss');

	let query = ` update sale
	set print_count = CASE
		 WHEN print_count= -1 then print_count + 2
		 ELSE print_count + 1
		END
		where id = '${sale_id}' `;

	return promisifyQuery(query);
};

const getPrintCounter = (sale_id: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY HH:mm:ss');

	let query = ` select print_count from sale where id = '${sale_id}'  `;

	return promisifyQuery(query);
};

const duplicateinvoice_noCheck = (invoice_no: any, center_id: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY HH:mm:ss');

	let query = ` select count(*) as count from sale where invoice_no = '${invoice_no}' and center_id = '${center_id}' `;

	let data = promisifyQuery(query);
	return data[0].count;
};

const deleteSalesDetails = async (requestBody: any) => {
	let center_id = requestBody.center_id;
	let id = requestBody.id;
	let sales_id = requestBody.sales_id;
	let qty = requestBody.qty;
	let product_id = requestBody.product_id;
	let stock_id = requestBody.stock_id;
	let mrp = requestBody.mrp;
	let autidneeded = requestBody.autidneeded;

	if (autidneeded) {
		let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

		let query = `
		INSERT INTO audit_tbl (module, module_ref_id, module_ref_det_id, action, old_value, new_value, audit_date, center_id)
		VALUES
			('Sales', '${sales_id}', '${id}', 'delete', 
			(SELECT CONCAT('[{', result, '}]') as final
			FROM (
				SELECT GROUP_CONCAT(CONCAT_WS(',', CONCAT('"saleId": ', sale_id), CONCAT('"productId": "', product_id, '"'), CONCAT('"qty": "', qty, '"')) SEPARATOR '},{') as result
				FROM (
					SELECT sale_id, product_id, qty
					FROM sale_detail where id = '${id}'
				) t1
			) t2)
			, '', '${today}', '${center_id}'
			) `;

		// step 1
		let auditPromise = promisifyQuery(query);
	}

	// step 2
	let deletePromise = deleteSaleDetail(id);

	// step 3 - Update Stock
	let stockUpdatePromise = await updateStockViaId(qty, product_id, stock_id, 'add');

	// step 4 - update item history table. as items are deleted, items has to be reversed
	if (stockUpdatePromise.affectedRows === 1) {
		let updateitemhistorytbl = await insertItemHistoryTable(
			center_id,
			'Sale',
			product_id,
			'0',
			'0',
			sales_id,
			id,
			'SAL',
			`Deleted MRP - ${mrp}`,
			qty,
			'0', // sale_return_id
			'0', // sale_return_det_id
			'0', // purchase_return_id
			'0', // purchase_return_det_id
		);

		return {
			result: 'success',
		};
	} else {
		return {
			result: 'failed',
		};
	}
};

// Update Sequence in financial Year tbl when its fresh sale insert
async function updateSequenceGenerator(cloneReq: any) {
	let query = '';

	if (cloneReq.invoice_type === 'gstInvoice') {
		query = `
		update financial_year set inv_seq = inv_seq + 1 where 
		center_id = '${cloneReq.center_id}' and  
		CURDATE() between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') `;
	} else if (cloneReq.invoice_type === 'stockIssue') {
		query = `		
	update financial_year set 
	stock_issue_seq = @stock_issue_seq:= stock_issue_seq + 1 where 
 center_id = '${cloneReq.center_id}' and  
 CURDATE() between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') LIMIT 1  `;
	}

	return await promisifyQuery(query);
}

// convert stock issue to sale
// 1. update sale table with status 'C' & sale type as 'gstInvoice'
// 2. insert ledger with payment details
const convertSale = async (requestBody: any) => {
	let center_id = requestBody.center_id;
	let sales_id = requestBody.sales_id;
	let old_invoice_no = requestBody.old_invoice_no;
	let old_stock_issued_date = requestBody.old_stock_issued_date;
	let customer_id = requestBody.customer_id;
	let net_total = requestBody.net_total;

	let today = currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY');

	// (1) Updates inv_seq in tbl financial_year, then {returns} formatted sequence {YY/MM/inv_seq}
	await updateSequenceGenerator({
		invoice_type: 'gstInvoice',
		center_id: center_id,
		invoice_date: today,
	});
	let invNo = await getSequenceNo({
		invoice_type: 'gstInvoice',
		center_id: center_id,
		invoice_date: today,
	});

	let query = ` update sale set invoice_no = '${invNo}', invoice_type = "gstInvoice", status = "C", stock_issue_ref = '${old_invoice_no}', revision = '1',
	invoice_date = '${today}', 
	stock_issue_date_ref =
	'${toTimeZone(old_stock_issued_date, 'Asia/Kolkata')}'
	
	where id = ${sales_id} `;

	let data = promisifyQuery(query);
	await addSaleLedgerRecord(
		{
			center_id: center_id,
			customer_ctrl: { id: customer_id },
			net_total: net_total,
		},
		sales_id,
	);

	return {
		result: 'success',
		invoice_no: invNo,
	};
};

const deleteSale = async (sale_id: any) => {
	let saleDetails = await getSalesDetails(sale_id);

	let idx = 0;

	let retValue = deleteSaleDetailsRecs(saleDetails, sale_id);

	if (retValue?.result === 'done') {
		return {
			result: 'success',
		};
	}
};

function deleteSaleDetailsRecs(saleDetails: any, sale_id: any) {
	let idx = 1;

	saleDetails.forEach(async (element: any, index: any) => {
		idx = index + 1;
		// step 1
		let p_audit = await insertAuditTblforDeleteSaleDetailsRecAsync(element, sale_id);

		// step 2
		let p_delete = await deleteSaleDetailsRecAsync(element);

		// step 3

		let p_stock_update = await updateStockViaId(element.qty, element.product_id, element.stock_id, 'add');
	});

	if (saleDetails.length === idx) {
		return { result: 'done' };
	}
}

const deleteSaleMaster = async (sale_id: any) => {
	let query = `
		delete from sale where 
	id = '${sale_id}' `;

	let data = promisifyQuery(query);
	return {
		result: 'success',
	};
};

const updateGetPrintCounter = async (sale_id: any) => {
	let response = await updatePrintCounter(sale_id);
	let counter = await getPrintCounter(sale_id);
	return { counter };
};

module.exports = {
	getSalesMaster,
	getSalesDetails,
	insertSale,

	updateProductAsync,

	getNextInvSequenceNo,
	insertAuditTblforDeleteSaleDetailsRecAsync,
	deleteSaleDetailsRecAsync,

	deleteSaleDetail,
	updatePrintCounter,
	getPrintCounter,
	duplicateinvoice_noCheck,
	deleteSalesDetails,
	convertSale,
	deleteSale,
	deleteSaleMaster,
	updateGetPrintCounter,
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
