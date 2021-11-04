const { currentTimeInTimeZone, toTimeZoneFormat, promisifyQuery } = require('../utils/utils');

const { insertItemHistoryTable, updateStock } = require('../services/stock.service');

const { updatePaymentSequenceGenerator, getPaymentSequenceNo } = require('../services/accounts.service');

const { handleError, ErrorHandler } = require('../config/error');

// param: smd : sale_master_data
// NR: Not Received, A: Approved
const insertSaleReturns = (smd) => {
	let today = currentTimeInTimeZone('DD-MM-YYYY');

	return new Promise((resolve, reject) => {
		let query = ` insert into sale_return (sale_id, customer_id, return_date, center_id, to_return_amount,
                  to_receive_items, receive_status, refund_status, return_status )
                  VALUES ('${smd.sale_id}', '${smd.customer_id}', '${today}', '${smd.center_id}' , '${smd.to_return_amount}', 
                  '${smd.to_receive_items}', 'NR', 'R', 'A')  `;

		let data = promisifyQuery(query);
		return data.insertId;
	});
};

// Insert sale_return_detail table with details of what is returned and at what price
// Increase the stock
// srd: sale_return_details array, sale_master_data (smd)
const insertSaleReturnDetail = async (srd, sale_return_id, smd, res) => {
	return new Promise(async (resolve, reject) => {
		for (const k of srd) {
			let sale_return_detail_id = await insertSaleDetailReturn(k, sale_return_id, smd);
			let updateSaleDetailFlag = await updateSaleDetail(k);
			let updateStockAfterReturnFlag = await updateStock(k.received_now, k.product_id, k.mrp, 'add', res);

			let updateItemHistoryTbl = await insertItemHistoryTable(
				smd.center_id,
				'SaleReturn',
				k.product_id,
				'0',
				'0',
				'0',
				'0',
				'SRTN',
				'Sale/Return',
				k.received_now,
				sale_return_id, // sale_return_id
				sale_return_detail_id, // sale_return_det_id
				'0', // purchase_return_id
				'0', // purchase_return_det_id
				res,
			);
		}
		resolve('done');
	});
};

const insertSaleDetailReturn = (srd, sale_return_id, smd) => {
	let query = ` INSERT INTO sale_return_detail(sale_return_id, sale_id, sale_detail_id, return_qty, 
              reason, disc_percent, tax, mrp,
              igst, cgst, sgst, orig_sold_qty, after_tax_value, total_value, hsncode, unit)
              VALUES
              ( '${sale_return_id}', '${smd.sale_id}', '${srd.id}', '${srd.received_now}', 
              '${srd.reason}', '${srd.disc_percent}', '${srd.tax}', 
              '${srd.mrp}', '${srd.igst}', '${srd.cgst}', '${srd.sgst}', 
              '${srd.qty}', '${srd.after_tax_value}', '${srd.total_value}', '${srd.hsncode}', '${srd.unit}' ) `;

	let data = promisifyQuery(query);
	return data.insertId;
};

const updateSaleDetail = (smd) => {
	// returned = received_now & sale_detail_id = id
	let sql = ` update sale_detail set returned = returned + '${smd.received_now}' where id = '${smd.id}' `;
	let data = promisifyQuery(query);
	return 'success';
};

const createCreditNote = (credit_note_no, credit_note_total_amount, refund_status) => {
	let query = ` INSERT INTO credit_note(credit_note_no, credit_note_total_amount, refund_status)
              VALUES
							( '${credit_note_no}', '${credit_note_total_amount}', '${refund_status}' ) `;

	let data = promisifyQuery(query);
	return data.insertId;
};

// format and send sequence #
function getSequenceCrNote(center_id) {
	let query = '';

	query = ` select concat("CN-",'${currentTimeInTimeZone('YY')}', "/", '${currentTimeInTimeZone(
		'MM',
	)}', "/", lpad(cr_note_seq, 5, "0")) as crNoteNo from financial_year 
				where 
				center_id = '${center_id}' and  
				CURDATE() between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') `;

	let data = promisifyQuery(query);
	return data[0].crNoteNo;
}

// Update Sequence in financial Year tbl when its fresh sale insert
function updateCRSequenceGenerator(center_id) {
	let query = '';

	query = `
		update financial_year set cr_note_seq = cr_note_seq + 1 where 
		center_id = '${center_id}' and  
		CURDATE() between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') `;

	return promisifyQuery(query);
}

function updateCRAmntToCustomer(sale_id, credit_amt) {
	let query = `
		update customer c, sale s
		set 
		c.credit_amt = c.credit_amt + ${credit_amt}
		where
		s.customer_id = c.id and
		s.id = '${sale_id}' `;

	return promisifyQuery(query);
}

function updateCrNoteIdInSaleReturnTable(cr_note_id, sale_return_id) {
	let query = `
	update sale_return set cr_note_id = ${cr_note_id}
	where id = 	${sale_return_id}	 `;

	return promisifyQuery(query);
}

const getSaleReturnDetails = (center_id, sale_return_id, res) => {
	let query = ` select p.id, p.product_code, p.product_description, srd.* from 
	sale_return_detail srd,
	product p,
	sale_detail sd
	where 
	p.id = sd.product_id and
	sd.id = srd.sale_detail_id and
	srd.sale_return_id = '${sale_return_id}'
		`;

	return promisifyQuery(query);
};

const getReturns = (center_id) => {
	let query = ` select c.name as customer_name, s.invoice_no as invoice_no,
  sum(sd.returned) as returned, sr.return_date as returned_date
  from 
  customer c,
  sale s,
  sale_return sr,
  sale_detail sd
  where
  sr.sale_id = s.id and
  c.id = s.customer_id and
  sd.sale_id = s.id and
  sr.center_id = ${center_id}
  group by 
  customer_name,
  invoice_no, returned_date `;

	return promisifyQuery(query);
};

const saleReturnPaymentMaster = (center_id, customer_id, payment_no, payment_now_amt, advance_amt_used, payment_date) => {
	let query = `
		insert into payment ( center_id, customer_id, payment_no, payment_now_amt, advance_amt_used, payment_date, pymt_mode_ref_id, pymt_ref)
		VALUES ( '${center_id}', '${customer_id}', '${payment_no}', '${payment_now_amt}',
     '${advance_amt_used}', '${payment_date}', (select id from payment_mode where center_id = '${center_id}' and pymt_mode_name = 'Credit Note'), 'Credit Note' ) `;

	return promisifyQuery(query);
};

const searchSaleReturn = async (requestBody) => {
	let center_id = requestBody.center_id;

	let customer_id = requestBody.customer_id;
	let from_date = requestBody.from_date;
	let to_date = requestBody.to_date;

	let search_type = requestBody.search_type;
	let search_by = requestBody.search_by;

	let sql = '';
	let query = '';

	if (search_type === 'all') {
		if (from_date !== '') {
			from_date = toTimeZoneFormat(requestBody.from_date, 'YYYY-MM-DD') + ' 00:00:00';
		}

		if (to_date !== '') {
			to_date = toTimeZoneFormat(requestBody.to_date, 'YYYY-MM-DD') + ' 23:59:00';
		}

		let cust_sql = `and s.customer_id = '${customer_id}' `;

		sql = `select c.name, sr.id as sale_return_id, sr.sale_id as sale_id,  s.invoice_no as invoice_no, s.invoice_date as invoice_date,
		sr.return_date as return_date,
		sr.cr_note_id as cr_note_id, cn.credit_note_no, sr.center_id as center_id, sr.to_return_amount as to_return_amount, sr.amount_returned as amount_returned, 
		sr.refund_status as refund_status, 
		(CASE
			WHEN sr.refund_status = 'P' THEN 'Pending'
			WHEN sr.refund_status = 'PR' THEN 'Partially Refunded'
			WHEN sr.refund_status = 'R' THEN 'Refunded'
			END
			) AS refund_status_x,
		sr.to_receive_items as to_receive_items, sr.received_items as received_items, 
		sr.receive_status as receive_status, 
		(CASE
			WHEN sr.receive_status = 'R' THEN 'Received'
			WHEN sr.receive_status = 'PR' THEN 'Partially Received'
			WHEN sr.receive_status = 'NR' THEN 'Not Received'
			END
			) AS receive_status_x,
		sr.return_status as return_status,
		(CASE
			WHEN sr.return_status = 'C' THEN 'Close'
			WHEN sr.return_status = 'A' THEN 'Approved'
			END
			) AS return_status_x
		
		from 
		sale_return sr
		LEFT outer JOIN credit_note cn
					ON cn.id = sr.cr_note_id, 
		sale s,
		customer c
		where
		c.id = s.customer_id and
		sr.sale_id = s.id and
		sr.center_id = '${center_id}' and
		
		
				str_to_date(sr.return_date,  '%d-%m-%Y %T') between
						str_to_date('${from_date}',  '%d-%m-%Y %T') and
						str_to_date('${to_date}',  '%d-%m-%Y %T') 
						
						 `;

		if (customer_id !== 'all') {
			sql = sql + cust_sql;
		}

		sql = sql + ' order by sr.return_date desc ';
	} else if (search_type !== 'all') {
		query = ` 
		select c.name, sr.id as sale_return_id, sr.sale_id as sale_id, s.invoice_no as invoice_no, s.invoice_date as invoice_date,
		sr.return_date as return_date,
		sr.cr_note_id as cr_note_id, cn.credit_note_no, sr.center_id as center_id, sr.to_return_amount as to_return_amount, sr.amount_returned as amount_returned, 
		sr.refund_status as refund_status, 
		(CASE
			WHEN sr.refund_status = 'P' THEN 'Pending'
			WHEN sr.refund_status = 'PR' THEN 'Partially Refunded'
			WHEN sr.refund_status = 'R' THEN 'Refunded'
			END
			) AS refund_status_x,
		sr.to_receive_items as to_receive_items, sr.received_items as received_items, 
		sr.receive_status as receive_status, 
		(CASE
			WHEN sr.receive_status = 'R' THEN 'Received'
			WHEN sr.receive_status = 'PR' THEN 'Partially Received'
			END
			) AS receive_status_x,
		sr.return_status as return_status,
		(CASE
			WHEN sr.return_status = 'C' THEN 'Close'
			WHEN sr.return_status = 'A' THEN 'Approved'
			END
			) AS return_status_x
		
		from 
		sale_return sr
		LEFT outer JOIN credit_note cn
					ON cn.id = sr.cr_note_id, 
		sale s,
		customer c
		where
		c.id = s.customer_id and
		sr.sale_id = s.id and
		sr.center_id = '${center_id}' and `;

		if (search_type === 'byinvoice') {
			query = query + ` s.invoice_no = '${search_by.trim()}' order by sr.return_date desc `;
		} else if (search_type === 'bycreditnote') {
			query = query + ` cn.credit_note_no = '${search_by.trim()}' order by sr.return_date desc `;
		}
	}

	return promisifyQuery(search_type === 'all' ? sql : query);
};

const updateSaleReturnsReceived = async (requestBody) => {
	let returnArr = requestBody;

	let count = 0;

	for (const k of returnArr) {
		let query = `			
					update sale_return_detail T1, sale_return T2
					set 
					T1.received_qty = T1.received_qty + ${k.received_now},
					T2.received_items = T2.received_items + ${k.received_now},
					T2.receive_status = IF(T2.to_receive_items = (T2.received_items + ${k.received_now}), 'R', T2.receive_status),
					T2.return_status = IF(T2.to_receive_items = (T2.received_items + ${k.received_now}), 'C', T2.return_status)
					where 
					T1.sale_return_id = T2.id and
					T1.id = '${k.id}'				
					`;

		let data = promisifyQuery(query);

		count++;
		if (count === returnArr.length) {
			res.json({
				result: 'success',
			});
		}
	}
};

const showReceiveButton = async (center_id, sale_return_id) => {
	let query = `
			select count(*) as cnt from sale_return_detail 
			where 
			return_qty > received_qty and  
			sale_return_id = ${sale_return_id} `;

	return promisifyQuery(query);
};

/*
Sale return & Create Credit Note + update credit_amt in customer table
Steps: 
1. insert sale_return
2. update sale_details on how many returned 
3. insert sale_return_detail table with details of what is returned and at what price
4. Increase the stock
*/

const addSaleReturn = async (requestBody) => {
	var today = new Date();
	today = currentTimeInTimeZone('DD-MM-YYYY');

	let reqObject = requestBody;

	let smd = reqObject[1]; // sale master data
	let srd = reqObject[0]; // salre return details

	const sale_return_id = await insertSaleReturns(smd);

	const job_completed = await insertSaleReturnDetail(srd, sale_return_id, smd, res);

	updateCRSequenceGenerator(smd.center_id);
	let fetchCRNoteNo = await getSequenceCrNote(smd.center_id);

	let cr_note_id_created = await createCreditNote(fetchCRNoteNo, smd.to_return_amount, 'R');
	updateCrNoteIdInSaleReturnTable(cr_note_id_created, sale_return_id);

	// dinesh - delete this logic
	//let cr_note_updated = await updateCRAmntToCustomer(smd.sale_id, smd.to_return_amount);

	// add a payment entry
	await updatePaymentSequenceGenerator(smd.center_id);

	let cloneReq = {
		center_id: smd.center_id,
		bank_id: 0,
		account_arr: [{ received_amount: smd.to_return_amount, received_date: today }],
	};
	let paymentNo = await getPaymentSequenceNo(cloneReq);

	// add payment master
	// nst saleReturnPaymentMaster = (center_id, customer_id, payment_no,
	// 	payment_now_amt, advance_amt_used, payment_date ) => {
	let newPK = await saleReturnPaymentMaster(smd.center_id, smd.customer_id, paymentNo, smd.to_return_amount, '0', today, res);

	// (3) - updates pymt details
	let process = await processItems(newPK.insertId, smd.sale_id, sale_return_id, smd.to_return_amount);

	Promise.all([sale_return_id, job_completed, fetchCRNoteNo, cr_note_id_created, process]).then((result) => {
		return res.json('success');
	});
};

function processItems(newPK, sale_ref_id, sale_return_ref_id, received_amount) {
	let sql = `INSERT INTO payment_detail(pymt_ref_id, sale_ref_id, sale_return_ref_id, applied_amount) VALUES
		( '${newPK}', '${sale_ref_id}', '${sale_return_ref_id}', '${received_amount}'  )`;

	return promisifyQuery(query);
}

module.exports = {
	insertSaleReturns,
	insertSaleReturnDetail,
	insertSaleDetailReturn,
	updateSaleDetail,

	createCreditNote,
	updateCRAmntToCustomer,
	updateCRSequenceGenerator,
	getSequenceCrNote,
	updateCrNoteIdInSaleReturnTable,
	getSaleReturnDetails,
	getReturns,
	saleReturnPaymentMaster,
	searchSaleReturn,
	updateSaleReturnsReceived,
	showReceiveButton,
	addSaleReturn,
};
