var pool = require('../config/db');

const { toTimeZone, currentTimeInTimeZone, toTimeZoneFormat, promisifyQuery } = require('../utils/utils');

const moment = require('moment');

const { handleError, ErrorHandler } = require('../config/error');

// ***** NEW ******* //

const addPaymentReceived = async (requestBody) => {
	var today = new Date();
	today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');
	const cloneReq = { ...requestBody };
	const [customer, center_id, accountarr] = Object.values(requestBody);

	let index = 0;

	for (const k of accountarr) {
		await updatePymtSequenceGenerator(center_id);

		let pymtNo = await getPymtSequenceNo(cloneReq);

		// add payment master
		let newPK = await addPaymentMaster(cloneReq, pymtNo, k, res);

		// (3) - updates pymt details
		let process = processItems(cloneReq, newPK, k.sale_ref_id, k.receivedamount);

		if (index == accountarr.length - 1) {
			return res.status(200).json('success');
		}
		index++;
	}
};

function processItems(cloneReq, newPK, sale_ref_id, receivedamount) {
	let sql = `INSERT INTO payment_detail(pymt_ref_id, sale_ref_id, applied_amount) VALUES
		( '${newPK}', '${sale_ref_id}', '${receivedamount}' )`;

	let pymtdetailsTblPromise = new Promise(function (resolve, reject) {
		pool.query(sql, function (err, data) {
			if (err) {
				reject(err);
			} else {
				// check if there is any credit balance for the customer, if yes, first apply that

				addPaymentLedgerRecord(cloneReq, newPK, receivedamount, sale_ref_id, (err, data) => {
					if (err) {
						let errTxt = err.message;
					} else {
						// todo
					}
				});

				resolve(data);
			}
		});
	});
}

// 	getLedgerByCustomers(req.params.center_id, req.params.customerid, (err, data) => {
// 		if (err) {
// 			return handleError(
// 				new ErrorHandler('500', `/get-ledger-customer/:center_id/:customerid ${req.params.center_id} ${req.params.customerid}`, err),
// 				res,
// 			);
// 		} else {
// 			return res.status(200).json(data);
// 		}
// 	});

// ***** OLD **** //

const addSaleLedgerRecord = async (insertValues, invoice_ref_id) => {
	console.log('ssssssssss');
	try {
		let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

		// balance amount is taken from querying ledger table, with Limit 1, check the subquery.
		let query = `
INSERT INTO ledger ( center_id, customer_id, invoice_ref_id, ledger_detail, credit_amt, balance_amt, ledger_date)
VALUES
  ( ? , ?, ?, 'invoice', ?, IFNULL((select balance_amt from (select (balance_amt) as balance_amt
    FROM ledger
    where center_id = '${insertValues.center_id}'  and customer_id = '${insertValues.customerctrl.id}'
    ORDER BY  id DESC
    LIMIT 1) a), 0) + '${insertValues.net_total}', '${today}'
  ) `;

		let values = [insertValues.center_id, insertValues.customerctrl.id, invoice_ref_id, insertValues.net_total];

		let result = await promisifyQuery(query, values);
		let updateCustomerBalance = await updateCustomerBalanceAmount(insertValues.customerctrl.id);
	} catch (err) {
		console.log('inside eeee' + JSON.stringify(err));
	}
	return 'success';
};

// reverse sale ledger entry if it is update of completed sale
// if multiple invoices are there the balance amount has to be taken from the last record, so consiously we ignore invoice ref id

const addReverseSaleLedgerRecord = (insertValues, invoice_ref_id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	// balance amount is taken from querying ledger table, with Limit 1, check the subquery.
	let query = `
INSERT INTO ledger ( center_id, customer_id, invoice_ref_id, ledger_detail, debit_amt, balance_amt, ledger_date)
VALUES
	( ? , ?, ?, 'Invoice Reversal', 
	
	IFNULL((select credit_amt from (select (credit_amt) as credit_amt
    FROM ledger
		where center_id = '${insertValues.center_id}'  and customer_id = '${insertValues.customerctrl.id}'
		and ledger_detail = 'Invoice' and invoice_ref_id = '${invoice_ref_id}'
    ORDER BY  id DESC
		LIMIT 1) a), 0),
		
		(
			
	
	 IFNULL((select balance_amt from (select (balance_amt ) as balance_amt
    FROM ledger
		where center_id = '${insertValues.center_id}'  and customer_id = '${insertValues.customerctrl.id}'
		
    ORDER BY  id DESC
		LIMIT 1) a), 0)
		-
		IFNULL((select credit_amt from (select (credit_amt) as credit_amt
			FROM ledger
			where center_id = '${insertValues.center_id}'  and customer_id = '${insertValues.customerctrl.id}'
			and ledger_detail = 'Invoice' and invoice_ref_id = '${invoice_ref_id}'
			ORDER BY  id DESC
			LIMIT 1) a), 0)
		
		), '${today}'
  ) `;

	let values = [insertValues.center_id, insertValues.customerctrl.id, invoice_ref_id];

	return new Promise(function (resolve, reject) {
		pool.query(query, values, async function (err, data) {
			if (err) {
				return reject(err);
			}
			let updateCustomerBalance = await updateCustomerBalanceAmount(insertValues.customerctrl.id);
			return resolve(data);
		});
	});
};

const addSaleLedgerAfterReversalRecord = (insertValues, invoice_ref_id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	// balance amount is taken from querying ledger table, with Limit 1, check the subquery.
	let query = `
INSERT INTO ledger ( center_id, customer_id, invoice_ref_id, ledger_detail, credit_amt, balance_amt, ledger_date)
VALUES
  ( ? , ?, ?, 'Invoice', ?, (credit_amt + IFNULL((select balance_amt from (select (balance_amt) as balance_amt
    FROM ledger
    where center_id = '${insertValues.center_id}'  and customer_id = '${insertValues.customerctrl.id}'
    ORDER BY  id DESC
    LIMIT 1) a), 0)), '${today}'
  ) `;

	let values = [insertValues.center_id, insertValues.customerctrl.id, invoice_ref_id, insertValues.net_total];

	return new Promise(function (resolve, reject) {
		pool.query(query, values, async function (err, data) {
			if (err) {
				return reject(err);
			}
			let updateCustomerBalance = await updateCustomerBalanceAmount(insertValues.customerctrl.id);
			return resolve(data);
		});
	});
};

const addPaymentLedgerRecord = async (insertValues, payment_ref_id, receivedamount, sale_ref_id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let query = `
	INSERT INTO ledger ( center_id, customer_id, invoice_ref_id, payment_ref_id, ledger_detail, debit_amt, balance_amt, ledger_date)
	VALUES
		( ? , ?, '${sale_ref_id}', ?, 'Payment', ?, IFNULL((select balance_amt from (select (balance_amt) as balance_amt
			FROM ledger
			where center_id = '${insertValues.customer.center_id}'  and customer_id = '${insertValues.customer.id}'
			ORDER BY  id DESC
			LIMIT 1) a), 0) - '${receivedamount}', '${today}'
		) `;

	let values = [insertValues.customer.center_id, insertValues.customer.id, payment_ref_id, receivedamount];

	let result = await promisifyQuery(query, values);
	let updateCustomerBalance = await updateCustomerBalanceAmount(insertValues.customer.id);
};

const addPaymentMaster = (cloneReq, pymtNo, insertValues, res) => {
	// (1) Updates payment seq in tbl financial_year, then {returns} formated sequence {YY/MM/PYMTSEQ}

	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	if (cloneReq.bank_id === 0 || cloneReq.bank_id === '') {
		cloneReq.bank_id = null;
	}

	if (cloneReq.bank_name === 0 || cloneReq.bank_name === '') {
		cloneReq.bank_name = null;
	}

	let values = [
		cloneReq.center_id,
		cloneReq.customer.id,
		pymtNo,
		insertValues.receivedamount,
		cloneReq.customer.credit_amt,

		insertValues.pymtmode,
		insertValues.bankref,
		insertValues.pymtref,
		cloneReq.bank_id,
		cloneReq.bank_name,
		cloneReq.createdby,
	];

	let query = `
		insert into payment ( center_id, customer_id, payment_no, payment_now_amt, advance_amt_used, payment_date, pymt_mode_ref_id, bank_ref, pymt_ref, last_updated,
			bank_id, bank_name, createdby)
		VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, '${today}', ?, ?, ? ) `;

	return new Promise(function (resolve, reject) {
		pool.query(query, values, async function (err, data) {
			if (err) {
				return handleError(new ErrorHandler('500', `/addPaymentMaster in accounts.js`, err), res);
			} else {
				let islastpaiddateupdated = await updateCustomerLastPaidDate(cloneReq.customer.id, insertValues.receiveddate);

				return resolve(data.insertId);
			}
		});
	});
};

const updatePymtSequenceGenerator = (center_id) => {
	let qryUpdateSqnc = '';

	qryUpdateSqnc = `
		update financial_year set pymt_seq = pymt_seq + 1 where 
		center_id = '${center_id}' and  
		CURDATE() between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') `;

	return new Promise(function (resolve, reject) {
		pool.query(qryUpdateSqnc, function (err, data) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};
// select concat('${moment(cloneReq.payment_date).format('YY')}', "/", '${moment(cloneReq.payment_date).format(
// 	'MM'
// )}', "/", lpad(pymt_seq, 5, "0")) as pymtNo from financial_year

const getPymtSequenceNo = (cloneReq) => {
	let pymtNoQry = '';

	pymtNoQry = ` select 
	concat("RP-",'${toTimeZoneFormat(cloneReq.accountarr[0].receiveddate, 'YY')}', "/", 
	'${toTimeZoneFormat(cloneReq.accountarr[0].receiveddate, 'MM')}', "/", lpad(pymt_seq, 5, "0")) as pymtNo from financial_year 
				where 
				center_id = '${cloneReq.center_id}' and  
				CURDATE() between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') `;

	return new Promise(function (resolve, reject) {
		pool.query(pymtNoQry, function (err, data) {
			if (err) {
				reject(err);
			}
			resolve(data[0].pymtNo);
		});
	});
};

const getPaymentsByCustomers = (requestBody) => {
	let center_id = requestBody.center_id;
	let from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata');
	let to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata');
	let customer_id = requestBody.customerid;
	let searchtype = requestBody.searchtype;
	let invoiceno = requestBody.invoiceno;

	let query = ` select p.*, pd.applied_amount as applied_amount, s.invoice_no as invoice_no, 
	s.invoice_date as invoice_date, s.net_total as invoice_amount,  pm.pymt_mode_name as pymt_mode from 
        payment p,
        payment_detail pd,
				sale s,
				payment_mode pm
				where 
				pm.id = p.pymt_mode_ref_id and
        p.id = pd.pymt_ref_id and
        pd.sale_ref_id = s.id and
        p.center_id =   '${center_id}' `;

	if (customer_id !== undefined && searchtype === 'all') {
		query =
			query +
			` and STR_TO_DATE(s.invoice_date,'%d-%m-%Y') between
					str_to_date('${from_date}', '%d-%m-%YYYY') and
					str_to_date('${to_date}', '%d-%m-%YYYY')`;
	}

	if (customer_id !== undefined && customer_id !== 'all' && searchtype === 'all') {
		query = query + ` and	p.customer_id = '${customer_id}' `;
	}

	if (searchtype === 'invonly') {
		query = query + ` and s.invoice_no like '%${invoiceno}%' `;
	}

	query = query + ` order by id desc  `;

	return promisifyQuery(query);
};

const getPaymentsOverviewByCustomers = (requestBody) => {
	let center_id = requestBody.center_id;
	let from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata');
	let to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata');
	let customer_id = requestBody.customerid;
	let searchtype = requestBody.searchtype;
	let query = ` select p.*, 
	pm.pymt_mode_name as pymt_mode 
 from 
	payment p,
	payment_mode pm
 where 
	pm.id = p.pymt_mode_ref_id and
	p.center_id = '${center_id}' `;

	if (customer_id !== undefined && searchtype === 'all') {
		query =
			query +
			` and STR_TO_DATE(p.payment_date,'%d-%m-%Y') between
					str_to_date('${from_date}', '%d-%m-%YYYY') and
					str_to_date('${to_date}', '%d-%m-%YYYY')`;
	}

	if (customer_id !== undefined && customer_id !== 'all' && searchtype === 'all') {
		query = query + ` and	p.customer_id = '${customer_id}' `;
	}

	query = query + ` order by id desc  `;

	return promisifyQuery(query);
};

const getPymtTransactionByCustomers = (center_id, customer_id) => {
	let query = ` 
	select 
	p.id as id, p.center_id as center_id, p.customer_id as customer_id,
	p.payment_no as payment_no,
		p.payment_now_amt as payment_now_amt,
		p.advance_amt_used as advance_amt_used,
		str_to_date(p.payment_date, '%d-%m-%YYYY') as payment_date,
		p.pymt_mode_ref_id as pymt_mode_ref_id,
		p.bank_ref as bank_ref,
		p.pymt_ref as pymt_ref,
		p.is_cancelled as is_cancelled,
		p.cancelled_date as cancelled_date,
		p.createdby as createdby,
		p.last_updated as last_updated,
	
	pm.pymt_mode_name as pymt_mode
 	from
  	payment p,
		payment_mode pm
	where 
		pm.id = p.pymt_mode_ref_id and
		p.center_id = '${center_id}' and p.customer_id = '${customer_id}'
	order by last_updated desc `;

	return promisifyQuery(query);
};

const getPaymentsByCenter = (requestBody) => {
	let center_id = requestBody.center_id;
	let from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata');
	let to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata');
	let customer_id = requestBody.customerid;
	let searchtype = requestBody.searchtype;
	let invoiceno = requestBody.invoiceno;

	let query = `
	select 
	c.name as customer_name,
	c.id as customer_id,
	pymt_mode_name as pymt_mode_name,
	p.bank_ref as bank_ref,
	p.pymt_ref as pymt_ref,
	p.payment_no as payment_no,
 DATE_FORMAT(STR_TO_DATE(p.payment_date,'%d-%m-%Y'), '%d-%b-%Y') as payment_date,
	p.advance_amt_used as advance_amt_used,
	pymt_mode_ref_id as pymt_mode_ref_id,
	pymt_ref as pymt_ref,
	last_updated as last_updated,
	s.invoice_no as invoice_no,
	s.net_total as invoice_amount,
	DATE_FORMAT(STR_TO_DATE(s.invoice_date,'%d-%m-%Y'), '%d-%b-%Y') as invoice_date,
	pd.applied_amount as applied_amount,
	p.bank_name
	from 
				 payment p,
				 payment_detail pd,
				 sale s,
				 customer c,
				 payment_mode pm
				 where 
				 pm.id = p.pymt_mode_ref_id and
				 c.id = p.customer_id and
				 p.id = pd.pymt_ref_id and
				 pd.sale_ref_id = s.id and
				 p.center_id = '${center_id}' `;

	if (customer_id !== undefined && searchtype === 'all') {
		query =
			query +
			` and STR_TO_DATE(s.invoice_date,'%d-%m-%Y') between
		str_to_date('${from_date}', '%d-%m-%YYYY') and
		str_to_date('${to_date}', '%d-%m-%YYYY')`;
	}

	if (customer_id !== undefined && customer_id !== 'all' && searchtype === 'all') {
		query = query + ` and	p.customer_id = '${customer_id}' `;
	}

	if (searchtype === 'invonly') {
		query = query + ` and s.invoice_no like '%${invoiceno}%' `;
	}

	query = query + ` order by str_to_date(payment_date, '%d-%m-%YYYY') desc  `;

	return promisifyQuery(query);
};

const getPaymentsOverviewByCenter = (requestBody) => {
	let center_id = requestBody.center_id;
	let from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata');
	let to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata');
	let customer_id = requestBody.customerid;
	let searchtype = requestBody.searchtype;
	let query = `
	select 
	c.name as customer_name,
	c.id as customer_id,
	pymt_mode_name as pymt_mode_name,
	p.bank_ref as bank_ref,
	p.pymt_ref as pymt_ref,
	p.payment_no as payment_no,
 DATE_FORMAT(STR_TO_DATE(p.payment_date,'%d-%m-%Y'), '%d-%b-%Y') as payment_date,
 p.payment_now_amt,
	p.advance_amt_used as advance_amt_used,
	pymt_mode_ref_id as pymt_mode_ref_id,
	pymt_ref as pymt_ref,
	last_updated as last_updated,
	p.bank_name

	from 
				 payment p,


				 customer c,
				 payment_mode pm
				 where 
				 pm.id = p.pymt_mode_ref_id and
				 c.id = p.customer_id and
				 p.center_id = '${center_id}' `;

	if (customer_id !== undefined && searchtype === 'all') {
		query =
			query +
			` and STR_TO_DATE(p.payment_date,'%d-%m-%Y') between
		str_to_date('${from_date}', '%d-%m-%YYYY') and
		str_to_date('${to_date}', '%d-%m-%YYYY')`;
	}

	if (customer_id !== undefined && customer_id !== 'all' && searchtype === 'all') {
		query = query + ` and	p.customer_id = '${customer_id}' `;
	}

	query = query + ` order by str_to_date(payment_date, '%d-%m-%YYYY') desc  `;

	return promisifyQuery(query);
};

const getPymtTransactionsByCenter = (center_id) => {
	let query = `
	select 
	c.name as customer_name,
	c.id as customer_id,
	pymt_mode_name as pymt_mode_name,
	p.payment_no as payment_no,
	 DATE_FORMAT(STR_TO_DATE(p.payment_date,'%d-%m-%Y'), '%d-%b-%Y') as payment_date,
	 p.payment_now_amt as paid_amount,
	p.advance_amt_used as advance_amt_used,
	pymt_mode_ref_id as pymt_mode_ref_id,
	pymt_ref as pymt_ref,
	bank_ref as bank_ref,
	last_updated as last_updated
from 
	payment p,
	customer c,
	payment_mode pm
where 
	pm.id = p.pymt_mode_ref_id and
	c.id = p.customer_id and
	p.center_id = '${center_id}' order by payment_date desc 
	
	`;

	return promisifyQuery(query);
};

const getLedgerByCustomers = async (center_id, customer_id) => {
	let query = ` select l.center_id, l.customer_id, l.ledger_detail, l.credit_amt, l.debit_amt, l.balance_amt, l.ledger_date,
	(select s.invoice_no from sale s where s.id = l.invoice_ref_id) as invoice_ref_id,
	(select p.payment_no from payment p where p.id = l.payment_ref_id) as payment_ref_id
	 from ledger l
	 where 
	 l.center_id =  '${center_id}' and l.customer_id = '${customer_id}' 	 and ledger_detail != 'Invoice Reversal' order by l.id desc  `;

	return promisifyQuery(query);
};

const getSaleInvoiceByCustomers = (requestBody) => {
	let center_id = requestBody.center_id;
	let from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata');
	let to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata');
	let customer_id = requestBody.customerid;
	let searchtype = requestBody.searchtype;
	let invoiceno = requestBody.invoiceno;

	let query = `	select s.id as sale_id, s.center_id as center_id, s.customer_id as customer_id, s.invoice_no as invoice_no, 
	s.invoice_date as invoice_date, 
	abs(datediff(STR_TO_DATE(s.invoice_date,'%d-%m-%Y'), CURDATE())) as aging_days,
	s.net_total as invoice_amt, s.invoice_type as invoice_type, c.name as customer_name, c.address1 as customer_address1,
	c.address2 as customer_address2,
	(select
	(
			 CASE
					WHEN  sum(pd.applied_amount) = s.net_total THEN 'PAID'
					WHEN  (sum(pd.applied_amount) <= s.net_total &&  sum(pd.applied_amount) > 0 )THEN 'PARTIALLY PAID'
	
					ELSE 'NOT PAID'
			END)  as payment_status
	
	from payment_detail pd, payment p2
	where pd.sale_ref_id = s.id and pd.pymt_ref_id = p2.id and p2.is_cancelled = 'NO') as payment_status,
	IFNULL((select sum(pd.applied_amount) from payment_detail pd, payment p2
	where pd.sale_ref_id = s.id and pd.pymt_ref_id = p2.id and p2.is_cancelled = 'NO'), 0) as paid_amount,
	(s.net_total - IFNULL((select sum(pd.applied_amount) from payment_detail pd, payment p2
	where pd.sale_ref_id = s.id and pd.pymt_ref_id = p2.id and p2.is_cancelled = 'NO'), 0)) as 
	bal_amount
	from sale s, customer c
	where
	c.id = '${customer_id}' and
	s.center_id = '${center_id}' and
	s.customer_id = c.id and s.status = 'C'
	and
	s.invoice_type= 'gstInvoice' 
	`;

	if (customer_id !== undefined && searchtype === 'all') {
		query =
			query +
			` and STR_TO_DATE(s.invoice_date,'%d-%m-%Y') between
		str_to_date('${from_date}', '%d-%m-%YYYY') and
		str_to_date('${to_date}', '%d-%m-%YYYY')`;
	}

	if (customer_id !== undefined && customer_id !== 'all' && searchtype === 'all') {
		query = query + ` and	s.customer_id = '${customer_id}' `;
	}

	if (searchtype === 'invonly') {
		query = query + ` and s.invoice_no = '${invoiceno}' `;
	}

	query = query + ` order by str_to_date(s.invoice_date, '%d-%m-%YYYY') desc  `;

	return promisifyQuery(query);
};

const getSaleInvoiceByCenter = (requestBody) => {
	let center_id = requestBody.center_id;
	let from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata');
	let to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata');
	let customer_id = requestBody.customerid;
	let searchtype = requestBody.searchtype;
	let invoiceno = requestBody.invoiceno;

	let query = `	select s.id as sale_id, s.center_id as center_id, s.customer_id as customer_id, 
	s.invoice_no as invoice_no, s.invoice_date as invoice_date, 
	abs(datediff(STR_TO_DATE(s.invoice_date,'%d-%m-%Y'), CURDATE())) as aging_days,
	s.net_total as invoice_amt, 
	s.invoice_type as invoice_type, c.name as customer_name, c.address1 as customer_address1,
	c.address2 as customer_address2,
	(select
	(
			 CASE
					WHEN  sum(pd.applied_amount) = s.net_total THEN 'PAID'
					WHEN  (sum(pd.applied_amount) <= s.net_total &&  sum(pd.applied_amount) > 0 )THEN 'PARTIALLY PAID'
	
					ELSE 'NOT PAID'
			END)  as payment_status
	 
	from payment_detail pd, payment p2
	where pd.sale_ref_id = s.id and pd.pymt_ref_id = p2.id and p2.is_cancelled = 'NO') as payment_status,
	IFNULL((select sum(pd.applied_amount) from payment_detail pd, payment p2
	where pd.sale_ref_id = s.id and pd.pymt_ref_id = p2.id and p2.is_cancelled = 'NO'), 0) as paid_amount,
	(s.net_total - IFNULL((select sum(pd.applied_amount) from payment_detail pd, payment p2
	where pd.sale_ref_id = s.id and pd.pymt_ref_id = p2.id and p2.is_cancelled = 'NO'), 0)) as 
	bal_amount
	from sale s, customer c
	where
	
	s.center_id = '${center_id}' and
	s.customer_id = c.id and
	s.invoice_type= 'gstInvoice'
	`;

	if (customer_id !== undefined && searchtype === 'all') {
		query =
			query +
			` and STR_TO_DATE(s.invoice_date,'%d-%m-%Y') between
		str_to_date('${from_date}', '%d-%m-%YYYY') and
		str_to_date('${to_date}', '%d-%m-%YYYY')`;
	}

	if (customer_id !== undefined && customer_id !== 'all' && searchtype === 'all') {
		query = query + ` and	s.customer_id = '${customer_id}' `;
	}

	if (searchtype === 'invonly') {
		query = query + ` and s.invoice_no like '%${invoiceno}%' `;
	}

	return promisifyQuery(query);
};

const updateCustomerCredit = (balanceamount, center_id, customer_id) => {
	let qryUpdateSqnc = '';

	//~ bitwise operator. Bitwise does not negate a number exactly. eg:  ~1000 is -1001, not -1000 (a = ~a + 1)
	balanceamount = ~balanceamount + 1;

	qryUpdateSqnc = `
		update customer set credit_amt = credit_amt + ${balanceamount} where 
		center_id = '${center_id}' and  
		id = '${customer_id}'
		 `;

	return new Promise(function (resolve, reject) {
		pool.query(qryUpdateSqnc, function (err, data) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};

const updateCustomerCreditMinus = (creditusedamount, center_id, customer_id) => {
	let qryUpdateSqnc = '';

	qryUpdateSqnc = `
		update customer set credit_amt = credit_amt - ${creditusedamount} where 
		center_id = '${center_id}' and  
		id = '${customer_id}'
		 `;

	return new Promise(function (resolve, reject) {
		pool.query(qryUpdateSqnc, function (err, data) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};

const updateCustomerBalanceAmount = (customer_id) => {
	let qryUpdate = '';

	qryUpdate = `
	update customer c set c.balance_amt = (
		select balance_amt from ledger l where l.customer_id = '${customer_id}' 
		order by id desc
		limit 1)
		where 
		c.id = '${customer_id}'  
		 `;

	return new Promise(function (resolve, reject) {
		pool.query(qryUpdate, function (err, data) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};

const updateCustomerLastPaidDate = (customer_id, last_paid_date) => {
	let dt = toTimeZoneFormat(last_paid_date, 'YYYY-MM-DD');
	let qryUpdate = `
	update customer c set c.last_paid_date = '${dt}' 
		where c.id = '${customer_id}' 
		 `;

	return new Promise(function (resolve, reject) {
		pool.query(qryUpdate, function (err, data) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};

const bankList = (center_id) => {
	let query = `select * from center_banks where center_id = ${center_id} order by bankname `;

	return promisifyQuery(query);
};

const paymentBankRef = (center_id, ref, id, mode) => {
	let query = '';

	if (mode === 'payment') {
		query = `select count(*) as count from payment where center_id = '${center_id}' and bank_ref = '${ref}' and customer_id = '${id}' `;
	} else if (mode === 'vendorpayment') {
		query = `select count(*) as count from vendor_payment where center_id = '${center_id}' and bank_ref = '${ref}' and vendor_id = '${id}' `;
	}

	return promisifyQuery(query);
};

const lastPaymentRecord = (center_id, customer_id) => {
	let sql = `select payment_no, payment_now_amt, payment_date, bank_ref,
	pymt_ref
	from 
	payment p,
	payment_mode pm
	where 
	pm.id = p.pymt_mode_ref_id
	and p.center_id = '${center_id}'
	and p.customer_id = '${customer_id}'
	order by p.id desc limit 1 `;

	return new Promise((resolve, reject) => {
		pool.query(sql, function (err, data) {
			if (err) {
				reject({ status: 'error', response: err });
			}
			resolve({ status: 'success', response: data });
		});
	});
};

const lastVendorPaymentRecord = (center_id, vendor_id) => {
	let sql = `select vendor_payment_no as payment_no, payment_now_amt, payment_date, bank_ref,
	pymt_ref
	from 
	vendor_payment p,
	payment_mode pm
	where 
	pm.id = p.pymt_mode_ref_id
	and p.center_id = '${center_id}'
	and p.vendor_id = '${vendor_id}'
	order by p.id desc limit 1 `;

	return new Promise((resolve, reject) => {
		pool.query(sql, function (err, data) {
			if (err) {
				reject({ status: 'error', response: err });
			}
			resolve({ status: 'success', response: data });
		});
	});
};

const addBulkPaymentReceived = async (requestBody) => {
	const cloneReq = { ...requestBody };

	const [customer, center_id, accountarr, invoicesplit, balanceamount] = Object.values(requestBody);

	let index = 0;

	for (const k of accountarr) {
		await updatePymtSequenceGenerator(center_id);

		let pymtNo = await getPymtSequenceNo(cloneReq);

		// add payment master
		let newPK = await addPaymentMaster(cloneReq, pymtNo, k, res);

		// (3) - updates pymt details
		let process = processBulkItems(cloneReq, newPK, invoicesplit);

		if (index == accountarr.length - 1) {
			if (req.body.creditsused === 'YES') {
				updateCustomerCreditMinus(requestBody.creditusedamount, cloneReq.center_id, cloneReq.customer.id, (err, data1) => {
					if (err) {
						let errTxt = err.message;
					} else {
						// todo nothing
					}
				});
			}

			// apply the excess amount to custome credit
			// applicable only if balanceamount < 0
			if (balanceamount < 0) {
				updateCustomerCredit(balanceamount, cloneReq.center_id, cloneReq.customer.id, (err, data1) => {
					if (err) {
						let errTxt = err.message;
					} else {
						// todo nothing
					}
				});
			}
			return { result: 'success' };
		}
		index++;
	}
};

function processBulkItems(cloneReq, newPK, invoicesplit) {
	invoicesplit.forEach((e) => {
		let sql = `INSERT INTO payment_detail(pymt_ref_id, sale_ref_id, applied_amount) VALUES
		( '${newPK}', '${e.id}', '${e.applied_amount}' )`;

		let pymtdetailsTblPromise = new Promise(function (resolve, reject) {
			pool.query(sql, function (err, data) {
				if (err) {
					reject(err);
				} else {
					// check if there is any credit balance for the customer, if yes, first apply that

					addPaymentLedgerRecord(cloneReq, newPK, e.applied_amount, e.id, (err, data2) => {
						if (err) {
							let errTxt = err.message;
						} else {
							// do nothing
						}
					});
					resolve(data);
				}
			});
		});
	});
}

// dinesh to redo
const isPaymentBankRef = async (requestBody) => {
	let center_id = requestBody.center_id;
	let bank_ref = requestBody.bankref;
	let customer_id = requestBody.customerid;

	let result = await paymentBankRef(center_id, bank_ref, customer_id, 'payment');

	let result1 = await lastPaymentRecord(center_id, customer_id);

	return {
		result: result.response,
		result1: result1.response,
	};
};

const vendorPaymentBankRef = async (requestBody) => {
	let center_id = requestBody.center_id;
	let bank_ref = requestBody.bankref;
	let vendor_id = requestBody.vendorid;

	let result = await paymentBankRef(center_id, bank_ref, vendor_id, 'vendorpayment');
	let result1 = await lastVendorPaymentRecord(center_id, vendor_id);

	return {
		result: result.response,
		result1: result1.response,
	};
};

module.exports = {
	addSaleLedgerRecord,
	addPaymentMaster,
	getLedgerByCustomers,
	getSaleInvoiceByCustomers,
	getPaymentsByCustomers,
	addPaymentLedgerRecord,
	updatePymtSequenceGenerator,
	getPymtSequenceNo,
	getPaymentsByCenter,
	getPymtTransactionsByCenter,
	getSaleInvoiceByCenter,
	updateCustomerCredit,
	updateCustomerCreditMinus,
	addReverseSaleLedgerRecord,
	addSaleLedgerAfterReversalRecord,
	getPymtTransactionByCustomers,
	updateCustomerLastPaidDate,

	bankList,
	paymentBankRef,
	lastPaymentRecord,
	lastVendorPaymentRecord,
	getPaymentsOverviewByCustomers,
	getPaymentsOverviewByCenter,

	// new
	addPaymentReceived,
	addBulkPaymentReceived,
	isPaymentBankRef,
	vendorPaymentBankRef,
};
