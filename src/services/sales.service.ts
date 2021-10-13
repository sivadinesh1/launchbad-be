import prisma from '../config/prisma';

import FinancialYearRepo from '../repos/financial-year.repo';

var pool = require('../config/db');
const { addSaleLedgerRecord, addReverseSaleLedgerRecord, addSaleLedgerAfterReversalRecord } = require('../services/accounts.service');

const { toTimeZone, currentTimeInTimeZone, toTimeZoneFormat, promisifyQuery } = require('../utils/utils');

const { insertItemHistoryTable, updateStockViaId } = require('../services/stock.service');

export const getNextSaleInvoiceNoAsync = (center_id: number, invoice_type: string) => {
	let query = '';

	let invoice_year = currentTimeInTimeZone('Asia/Kolkata', 'YY');
	let invoice_month = currentTimeInTimeZone('Asia/Kolkata', 'MM');

	if (invoice_type === 'stockIssue') {
		query = `select concat('SI',"-",'${invoice_year}', "/", '${invoice_month}', "/", lpad(stock_issue_seq + 1, 5, "0")) as NxtInvNo from financial_year  where 
					center_id = '${center_id}' and  
					CURDATE() between start_date and end_date `;
	} else if (invoice_type === 'gstInvoice') {
		query = `select concat('${invoice_year}', "/", '${invoice_month}', "/", lpad(inv_seq + 1, 5, "0")) as NxtInvNo from financial_year  where 
					center_id = '${center_id}' and  
					CURDATE() between start_date and end_date `;
	}

	return promisifyQuery(query);
};

const getSalesMaster = async (sales_id: number) => {
	let query = `select s.*, c.name, c.address1, c.address2, c.district 
	from sale s,
	customer c where s.customer_id = c.id and s.id = '${sales_id}' `;

	return promisifyQuery(query);
};

const getSalesDetails = async (sales_id: any) => {
	let query = ` select sd.*, sd.id as id, sd.sale_id as sale_id,
							sd.product_id as product_id, sd.qty as qty,sd.unit_price as unit_price,
							sd.mrp as mrp, sd.batch_date as batch_date, sd.tax as tax, sd.igs_t as igs_t,
							sd.cgs_t as cgs_t, sd.sgs_t as sgs_t, sd.taxable_value as tax_value,
							sd.total_value as total_value, p.product_code, p.product_description, p.packet_size, p.tax_rate,
							p.hsn_code, p.unit,
							s.id as stock_pk, s.mrp as stock_mrp, s.available_stock as stock_available_stock
							from 
							sale_detail sd, product p, stock s
							where
							p.id = sd.product_id and s.product_id = p.id and
							s.id = sd.stock_id and sd.sale_id = '${sales_id}' `;

	return promisifyQuery(query);
};

// insert sale details
// 1. Update Sequence Generator and form a formatted sale invoice
// 2. Insert records in sale master, if sale is via enquiry, then update enq table with saleId
// 3. Insert records in sale details
// 4. update Stock table & then update product table with current stock details
// 5. finally check if hasCustomerChange is true, if yes, update ledger, payment (log in audit)
const insertSaleDetails = async (requestBody: any) => {
	const cloneReq = { ...requestBody };

	await prisma.$transaction(async (prisma) => {
		// works
		// 1. Update Sequence Generator and form a formatted sale invoice

		// check
		let result = await FinancialYearRepo.updateInvoiceSequence(cloneReq.center_id, prisma);

		console.log('dinesh print return:: ' + JSON.stringify(result));
	});

	// //	console.log('dinesh :: ' + JSON.stringify(updateInvoiceSequenceGenerator));

	// //	(1) Updates inv_seq in tbl financial_year, then {returns} formatted sequence {YY/MM/inv_seq}
	// if (cloneReq.status === 'C' && cloneReq.revision === 0 && cloneReq.inv_gen_mode === 'A') {
	// 	await updateSequenceGenerator(cloneReq);
	// } else if (cloneReq.status === 'D' && cloneReq.inv_gen_mode === 'A') {
	// 	if (cloneReq.invoice_no !== undefined && cloneReq.invoice_no !== null) {
	// 		if (cloneReq.invoice_no.startsWith('D') || cloneReq.invoice_no.startsWith('SI')) {
	// 			// do nothing
	// 		} else {
	// 			await updateDraftSequenceGenerator(cloneReq);
	// 		}
	// 	}
	// }
	// let invNo = '';
	// // always very first insert will increment revision to 1, on consecutive inserts, it will be +1
	// if (cloneReq.status === 'C' && cloneReq.revision === 0 && cloneReq.inv_gen_mode === 'A') {
	// 	invNo = await getSequenceNo(cloneReq);
	// } else if (cloneReq.status === 'D' && cloneReq.inv_gen_mode === 'A') {
	// 	if (cloneReq.invoice_no !== undefined && cloneReq.invoice_no !== null) {
	// 		if (cloneReq.invoice_no.startsWith('D') || cloneReq.invoice_no.startsWith('SI')) {
	// 			invNo = cloneReq.invoice_no;
	// 		} else {
	// 			invNo = await getSequenceNo(cloneReq);
	// 		}
	// 	}
	// } else if (cloneReq.status === 'C' && cloneReq.revision !== 0) {
	// 	invNo = cloneReq.invoice_no;
	// } else if (cloneReq.inv_gen_mode === 'M') {
	// 	invNo = cloneReq.invoice_no;
	// }
	// let res_l = await saleMasterEntry(cloneReq, invNo);
	// console.log('dinesh 1111@');

	// // (2)

	// let data = await saleMasterEntry(cloneReq, invNo);

	// const start = Date.now();

	// let newPK = cloneReq.sales_id === '' ? data.insertId : cloneReq.sales_id;
	// console.log('dinesh 2222@@@@##' + newPK);
	// // if sale came from enquiry, then update the enq table with the said id {status = E (executed)}
	// if (cloneReq.enquiry_ref !== 0 && cloneReq.enquiry_ref !== null) {
	// 	console.log('dinesh 2222!!');
	// 	await updateEnquiry(newPK, cloneReq.enquiry_ref);
	// 	console.log('dinesh 2222@@');
	// }
	// console.log('dinesh 3333');
	// // (3) - updates sale details
	// let process = processItems(cloneReq, newPK);
	// console.log('dinesh 5555');
	// // Promise.all([process]).then(() => {
	// // ledger entry should NOT be done if status is draft ("D")
	// console.log('dinesh 5555***' + cloneReq.sales_id + 'asdfasd**** ' + cloneReq.status);
	// if (cloneReq.status === 'C' && cloneReq.sales_id === '') {
	// 	await addSaleLedgerRecord(cloneReq, newPK);
	// 	console.log('dinesh 6666');
	// 	return { result: 'success', id: newPK, invoice_no: invNo };
	// } else if (cloneReq.status === 'C' && cloneReq.sales_id !== '') {
	// 	// reverse the old ledger entry and then add a new sale entry. scenario: sale completed, but after sale, if any changes done,
	// 	// we reverse old entries and create new entries.
	// 	console.log('dinesh 7777');
	// 	await addReverseSaleLedgerRecord(cloneReq, newPK);
	// 	console.log('dinesh 8888');
	// 	await addSaleLedgerAfterReversalRecord(cloneReq, newPK);
	// 	console.log('dinesh 9999');
	// 	// check if customer has changed
	// 	if (cloneReq.hasCustomerChange) {
	// 		console.log('dinesh 0000');
	// 		updateLegerCustomerChange(cloneReq.center_id, cloneReq.sales_id, cloneReq.customer_ctrl.id, cloneReq.old_customer_id);
	// 	}

	// 	return { result: 'success', id: newPK, invoice_no: invNo };
	// } else {
	// 	console.log('dinesh ... ');
	// 	// draft scenario
	// 	return { result: 'success', id: newPK, invoice_no: invNo };
	// }
};

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

// format and send sequence #
async function saleMasterEntry(cloneReq: any, invNo: any) {
	console.log('SM>> 1');
	try {
		let revisionCnt = 0;
		let printCount = cloneReq.print_count || 0;

		let invoice_date = toTimeZone(cloneReq.invoice_date, 'Asia/Kolkata');

		// if inv # starts with 'D' (eg:invNo: "D/21/04/00024") + status: "C" + revision: 0
		if (cloneReq.invoice_no.startsWith('D') && cloneReq.status === 'C' && cloneReq.revision === 0) {
			invoice_date = currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY');
		}

		// always very first insert will increment revision to 1, on consecutive inserts, it will be +1
		if (cloneReq.status === 'C' && cloneReq.revision === 0) {
			revisionCnt = 1;
		} else if (cloneReq.status === 'C' && cloneReq.revision !== 0) {
			revisionCnt = cloneReq.revision + 1;
			printCount = '-1';
		}

		let order_date = cloneReq.printCount !== '' && cloneReq.printCount !== null ? toTimeZone(cloneReq.printCount, 'Asia/Kolkata') : '';
		let lr_date = cloneReq.lr_date !== '' && cloneReq.lr_date !== null ? toTimeZone(cloneReq.lr_date, 'Asia/Kolkata') : '';

		// create a invoice number and save in sale master
		let insQry = `
			INSERT INTO sale (center_id, customer_id, invoice_no, invoice_date, order_no, order_date, 
			lr_no, lr_date, sale_type,  total_qty, no_of_items, taxable_value, cgs_t, sgs_t, igs_t, 
			total_value, net_total, transport_charges, unloading_charges, misc_charges, status, 
			sale_date_time, round_off, revision, retail_customer_name, retail_customer_address,retail_customer_phone, inv_gen_mode )
			VALUES
			('${cloneReq.center_id}', '${cloneReq.customer_ctrl.id}', 
			'${invNo}',
			'${invoice_date}', '${cloneReq.order_no}', '${order_date}', '${cloneReq.lr_no}', '${cloneReq.lr_date}',
	 '${cloneReq.invoice_type}','${cloneReq.total_qty}', 
			'${cloneReq.no_of_items}', '${cloneReq.taxable_value}', '${cloneReq.cgs_t}', '${cloneReq.sgs_t}', '${cloneReq.igs_t}', '${cloneReq.total_value}', 
			'${cloneReq.net_total}', '${cloneReq.transport_charges}', '${cloneReq.unloading_charges}', '${cloneReq.misc_charges}', '${cloneReq.status}',
			'${currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY HH:mm:ss')}', '${cloneReq.round_off}', '${revisionCnt}', '${cloneReq.retail_customer_name}', '${
			cloneReq.retail_customer_address
		}', '${cloneReq.retail_customer_phone}', '${cloneReq.inv_gen_mode}'
			)`;

		let upQry = `
			UPDATE sale set center_id = '${cloneReq.center_id}', customer_id = '${cloneReq.customer_ctrl.id}', 
			invoice_no = '${invNo}',
			invoice_date = 	'${invoice_date}', 
			order_date = '${order_date}', lr_no = '${cloneReq.lr_no}', sale_type = '${cloneReq.invoice_type}',
			lr_date = '${cloneReq.lr_date}', total_qty = '${cloneReq.total_qty}', no_of_items = '${cloneReq.no_of_items}',
			taxable_value = '${cloneReq.taxable_value}', cgs_t = '${cloneReq.cgs_t}', sgs_t = '${cloneReq.sgs_t}', igs_t = '${cloneReq.igs_t}',
			total_value = '${cloneReq.total_value}', net_total = '${cloneReq.net_total}', transport_charges = '${cloneReq.transport_charges}', 
			unloading_charges = '${cloneReq.unloading_charges}', misc_charges = '${cloneReq.misc_charges}', status = '${cloneReq.status}',
			sale_date_time = 	'${currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY HH:mm:ss')}', revision = '${revisionCnt}', round_off = '${cloneReq.round_off}', 
			retail_customer_name = '${cloneReq.retail_customer_name}',
			retail_customer_address = '${cloneReq.retail_customer_address}',
			retail_customer_phone = '${cloneReq.retail_customer_phone}',
			inv_gen_mode = '${cloneReq.inv_gen_mode}',
			print_count= '${printCount}'
			where id= '${cloneReq.sales_id}' `;

		return await promisifyQuery(cloneReq.sales_id === '' ? insQry : upQry);
	} catch (error) {
		console.log('xxxxxxxx' + error);
	}
}

const IUSaleDetailsAsync = async (k: any, newPK: any) => {
	let insQuery100 = `INSERT INTO sale_detail(sale_id, product_id, qty, disc_percent, disc_value, disc_type, unit_price, mrp, batch_date, tax,
		igs_t, cgs_t, sgs_t, taxable_value, total_value, stock_id) VALUES
		( '${newPK}', '${k.product_id}', '${k.qty}', '${k.disc_percent}', '${k.disc_value}', '${k.disc_type}', '${
		(k.total_value - k.disc_value) / k.qty
	}', '${k.mrp}', 
	
		'${currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY')}',
		'${k.tax_rate}', '${k.igs_t}', 
		'${k.cgs_t}', '${k.sgs_t}', '${k.taxable_value}', '${k.total_value}', '${k.stock_pk}')`;

	let upQuery100 = `update sale_detail set product_id = '${k.product_id}', qty = '${k.qty}', disc_percent = '${k.disc_percent}', 
disc_value = '${k.disc_value}',	disc_type= '${k.disc_type}', unit_price = '${(k.total_value - k.disc_value) / k.qty}', mrp = '${k.mrp}', 
		batch_date = '${currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY')}', tax = '${k.tax_rate}',
		igs_t = '${k.igs_t}', cgs_t = '${k.cgs_t}', sgs_t = '${k.sgs_t}', 
		taxable_value = '${k.taxable_value}', total_value = '${k.total_value}', stock_id = '${k.stock_pk}'
		where
		id = '${k.sale_det_id}' `;

	return await promisifyQuery(k.sale_det_id === '' ? insQuery100 : upQuery100);
};

// check
const updateProductAsync = async (k: any) => {
	let query = ` update product set current_stock = (select sum(available_stock) 
								from stock where product_id = '${k.product_id}' ) where id = '${k.product_id}' `;

	return promisifyQuery(query);
};

const insertItemHistoryAsync = async (k: any, vSale_id: any, vSale_det_id: any, cloneReq: any) => {
	// to avoid duplicate entry of history items when editing completed records
	// with same qty. (status = 'c'). If status=C & k.qty - k.old_val !== 0 then updateHistoryTable
	let skipHistoryUpdate = false;
	var today = new Date();

	today = currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY HH:mm:ss');

	// if sale details id is missing its new else update
	let sale_det_id = k.sale_det_id === '' ? vSale_det_id : k.sale_det_id;
	let txn_qty = k.sale_det_id === '' ? k.qty : k.qty - k.old_val;
	let action_type = 'Sold';
	let sale_id = vSale_id === '' ? k.sale_id : vSale_id;

	// revision '0' is Status 'C' new record. txn_qty === 0 means (k.qty - k.old_val)
	if (cloneReq.revision === 0 && txn_qty === 0 && cloneReq.invoice_type !== 'stockIssue') {
		txn_qty = k.qty;
	}

	//txn -ve means subtract from qty
	// example old value (5) Edited and sold (3)
	// now txn_qty will be (3) (sold qty)
	if (txn_qty < 0) {
		action_type = `Edited: ${k.old_val} To: ${k.qty}`;
		txn_qty = k.old_val - k.qty;
	} else if (txn_qty > 0 && cloneReq.revision > 0) {
		action_type = `Edited: ${k.old_val} To: ${k.qty}`;
		txn_qty = k.qty - k.old_val;
	}

	// completed txn (if revision > 0) txn_qty 0 means no changes happened
	if (cloneReq.revision > 0 && txn_qty === 0 && cloneReq.invoice_type !== 'stockIssue') {
		skipHistoryUpdate = true;
	}

	if (cloneReq.revision === 0 && txn_qty === 0 && cloneReq.invoice_type === 'stockIssue') {
		skipHistoryUpdate = true;
	}

	// convert -ve to positive number
	//~ bitwise operator. Bitwise does not negate a number exactly. eg:  ~1000 is -1001, not -1000 (a = ~a + 1)
	txn_qty = ~txn_qty + 1;

	if (txn_qty !== 0 && !skipHistoryUpdate) {
		let result = await insertItemHistoryTable(
			cloneReq.center_id,
			'Sale',
			k.product_id,
			'0',
			'0',
			sale_id,
			sale_det_id,
			'SAL',
			action_type,
			txn_qty,
			'0', // sale_return_id
			'0', // sale_return_det_id
			'0', // purchase_return_id
			'0', // purchase_return_det_id
		);
	}
};

const getNextSaleinvoice_noAsync = async (center_id: any, invoice_type: any) => {
	let query = '';

	let invoice_year = currentTimeInTimeZone('Asia/Kolkata', 'YY');
	let invoice_month = currentTimeInTimeZone('Asia/Kolkata', 'MM');

	if (invoice_type === 'stockIssue') {
		query = `select concat('SI',"-",'${invoice_year}', "/", '${invoice_month}', "/", lpad(stock_issue_seq + 1, 5, "0")) as NxtInvNo from financial_year  where 
					center_id = '${center_id}' and  
					CURDATE() between str_to_date(start_date, '%Y-%m-%d') and str_to_date(end_date, '%Y-%m-%d') `;
	} else if (invoice_type === 'gstInvoice') {
		query = `select concat('${invoice_year}', "/", '${invoice_month}', "/", lpad(inv_seq + 1, 5, "0")) as NxtInvNo from financial_year  where 
					center_id = '${center_id}' and  
					CURDATE() between str_to_date(start_date, '%Y-%m-%d') and str_to_date(end_date, '%Y-%m-%d') `;
	}
	console.log('@dinesh ' + query);
	return promisifyQuery(query);
};

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

const updateLegerCustomerChange = async (
	center_id: any,
	sale_id: any,
	customer_id: any,

	old_customer_id: any,
) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY HH:mm:ss');

	let query = `delete from ledger where customer_id =  '${old_customer_id}'
	and invoice_ref_id = '${sale_id}'  and center_id = '${center_id}' `;

	let result = await promisifyQuery(query);

	let query2 = ` INSERT INTO audit_tbl (module, module_ref_id, module_ref_det_id, action,
											old_value, new_value, audit_date, center_id)
											VALUES
											('Leger', '${sale_id}', '${sale_id}', 'Customer Updated',  '${old_customer_id}',
											'${customer_id}', '${today}', '${center_id}' ) `;

	return promisifyQuery(query2);
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

function updateEnquiry(newPK: any, enqref: any) {
	let uenqsaleidqry = `update enquiry set 
	e_status = 'E',
	sale_id = '${newPK}'
	where 
	id =  '${enqref}' `;

	return promisifyQuery(uenqsaleidqry);
}

async function processItems(cloneReq: any, newPK: any) {
	// if sale master insert success, then insert in sale details.

	for (const k of cloneReq.product_arr) {
		//insert(sale_det_id == '')/update sale details.
		let p_data = await IUSaleDetailsAsync(k, newPK);

		// after sale details is updated, then update stock (as this is sale, reduce available stock) tbl & product tbl
		let qty_to_update = k.qty - k.old_val;

		let p_data1 = await updateStockViaId(qty_to_update, k.product_id, k.stock_pk, 'minus');

		let p_data3;

		// its a hack to avoid data.insertId fix it
		if (p_data != null || p_data != undefined) {
			if (cloneReq.status === 'C' || (cloneReq.status === 'D' && cloneReq.invoice_type === 'stockIssue')) {
				p_data3 = await insertItemHistoryAsync(k, newPK, p_data.insertId, cloneReq); // returns promise
			}
		}

		Promise.all([p_data, p_data1, p_data3]);
	}
}

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

	let query = ` update sale set invoice_no = '${invNo}', sale_type = "gstInvoice", status = "C", stock_issue_ref = '${old_invoice_no}', revision = '1',
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
	getNextSaleInvoiceNoAsync,
	getSalesMaster,
	getSalesDetails,
	insertSaleDetails,
	IUSaleDetailsAsync,

	updateProductAsync,
	insertItemHistoryAsync,
	getNextSaleinvoice_noAsync,
	insertAuditTblforDeleteSaleDetailsRecAsync,
	deleteSaleDetailsRecAsync,

	updateLegerCustomerChange,
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
