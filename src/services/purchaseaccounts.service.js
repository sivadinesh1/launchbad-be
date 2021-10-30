var pool = require('../config/db');

const { toTimeZone, currentTimeInTimeZone, toTimeZoneFormat, promisifyQuery } = require('../utils/utils');

const { handleError, ErrorHandler } = require('../config/error');

const addPurchaseLedgerRecord = (insertValues, purchase_ref_id, callback) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	// balance amount is taken from querying purchase_ledger table, with Limit 1, check the subquery.
	let query = `
INSERT INTO purchase_ledger ( center_id, vendor_id, purchase_ref_id, ledger_detail, credit_amt, balance_amt, ledger_date)
VALUES
  ( ? , ?, ?, 'purchase', ?, IFNULL((select balance_amt from (select (balance_amt) as balance_amt
    FROM purchase_ledger
    where center_id = '${insertValues.center_id}'  and vendor_id = '${insertValues.vendor_ctrl.id}'
    ORDER BY  id DESC
    LIMIT 1) a), 0) + '${insertValues.net_total}', '${today}'
  ) `;

	let values = [insertValues.center_id, insertValues.vendor_ctrl.id, purchase_ref_id, insertValues.net_total];

	return new Promise(function (resolve, reject) {
		pool.query(query, values, async function (err, data) {
			if (err) {
				reject(err);
			}
			let updateVendorBalance = await updateVendorBalanceAmount(insertValues.vendor_ctrl.id);
			resolve(data);
		});
	});
};

const addReversePurchaseLedgerRecord = (insertValues, purchase_ref_id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	// balance amount is taken from querying purchase ledger table, with Limit 1, check the subquery.
	let query = `
INSERT INTO purchase_ledger ( center_id, vendor_id, purchase_ref_id, ledger_detail, debit_amt, balance_amt, ledger_date)
VALUES
	( ? , ?, ?, 'Purchase Reversal', 
	
	IFNULL((select credit_amt from (select (credit_amt) as credit_amt
    FROM purchase_ledger
		where center_id = '${insertValues.center_id}'  and vendor_id = '${insertValues.vendor_ctrl.id}'
		and ledger_detail = 'Invoice' and purchase_ref_id = '${purchase_ref_id}'
    ORDER BY  id DESC
		LIMIT 1) a), 0),
		
		(
			
	
	 IFNULL((select balance_amt from (select (balance_amt ) as balance_amt
    FROM purchase_ledger
		where center_id = '${insertValues.center_id}'  and vendor_id = '${insertValues.vendor_ctrl.id}'
		
    ORDER BY  id DESC
		LIMIT 1) a), 0)
		-
		IFNULL((select credit_amt from (select (credit_amt) as credit_amt
			FROM purchase_ledger
			where center_id = '${insertValues.center_id}'  and vendor_id = '${insertValues.vendor_ctrl.id}'
			and ledger_detail = 'purchase' and purchase_ref_id = '${purchase_ref_id}'
			ORDER BY  id DESC
			LIMIT 1) a), 0)
		
		), '${today}'
  ) `;

	let values = [insertValues.center_id, insertValues.vendor_ctrl.id, purchase_ref_id];

	return new Promise(function (resolve, reject) {
		pool.query(query, values, async function (err, data) {
			if (err) {
				return reject(err);
			}
			let updateVendorBalance = await updateVendorBalanceAmount(insertValues.vendor_ctrl.id);
			return resolve(data);
		});
	});
};

const addPurchaseLedgerAfterReversalRecord = (insertValues, purchase_ref_id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	// balance amount is taken from querying purchase ledger table, with Limit 1, check the subquery.
	let query = `
INSERT INTO purchase_ledger ( center_id, vendor_id, purchase_ref_id, ledger_detail, credit_amt, balance_amt, ledger_date)
VALUES
  ( ? , ?, ?, 'purchase', ?, (credit_amt + IFNULL((select balance_amt from (select (balance_amt) as balance_amt
    FROM purchase_ledger
    where center_id = '${insertValues.center_id}'  and vendor_id = '${insertValues.vendor_ctrl.id}'
    ORDER BY  id DESC
    LIMIT 1) a), 0)), '${today}'
  ) `;

	let values = [insertValues.center_id, insertValues.vendor_ctrl.id, purchase_ref_id, insertValues.net_total];

	return new Promise(function (resolve, reject) {
		pool.query(query, values, async function (err, data) {
			if (err) {
				return reject(err);
			}
			let updateVendorBalance = await updateVendorBalanceAmount(insertValues.vendor_ctrl.id);
			return resolve(data);
		});
	});
};

const updateVendorBalanceAmount = (vendor_id) => {
	let qryUpdate = '';

	qryUpdate = `
	update vendor v set v.balance_amt = (
		select balance_amt from purchase_ledger l where l.vendor_id = '${vendor_id}' 
		order by id desc
		limit 1)
		where 
		v.id = '${vendor_id}'  
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

const getPurchaseInvoiceByCenter = (center_id, from_date, to_date, vendor_id, searchtype, invoiceno) => {
	let query = `	select p.id as purchase_id, 
	p.center_id as center_id, 
	p.vendor_id as vendor_id, 
	p.invoice_no as invoice_no, 
	p.invoice_date as invoice_date, 
	abs(datediff(STR_TO_DATE(p.invoice_date,'%d-%m-%Y'), CURDATE())) as aging_days,
	p.net_total as invoice_amt, 
	v.vendor_name as vendor_name, v.address1 as vendor_address1,
	v.address2 as vendor_address2,
	(select
		(
				 CASE
						WHEN  sum(pd.applied_amount) = p.net_total THEN 'PAID'
						WHEN  (sum(pd.applied_amount) <= p.net_total &&  sum(pd.applied_amount) > 0 )THEN 'PARTIALLY PAID'
		
						ELSE 'NOT PAID'
				END)  as payment_status
		 
		from 
			vendor_payment_detail pd, 
			vendor_payment p2
		where 
			pd.purchase_ref_id = p.id and 
			pd.vend_pymt_ref_id = p2.id and 
			p2.is_cancelled = 'NO') as payment_status,
	IFNULL((select sum(pd.applied_amount) from vendor_payment_detail pd, vendor_payment p2
		where pd.purchase_ref_id = p.id and pd.vend_pymt_ref_id = p2.id and p2.is_cancelled = 'NO'), 0) as paid_amount,
	(p.net_total - IFNULL((select sum(pd.applied_amount) from vendor_payment_detail pd, vendor_payment p2
		where pd.purchase_ref_id = p.id and pd.vend_pymt_ref_id = p2.id and p2.is_cancelled = 'NO'), 0)) as 
		bal_amount
	from purchase p, vendor v
	where
		p.center_id = '${center_id}' and p.status = 'C' and
		p.vendor_id = v.id 
	
	`;

	if (vendor_id !== undefined && searchtype === 'all') {
		query =
			query +
			` and STR_TO_DATE(p.invoice_date,'%d-%m-%Y') between
		str_to_date('${from_date}', '%d-%m-%YYYY') and
		str_to_date('${to_date}', '%d-%m-%YYYY')`;
	}

	if (vendor_id !== undefined && vendor_id !== 'all' && searchtype === 'all') {
		query = query + ` and	p.vendor_id = '${vendor_id}' `;
	}

	if (searchtype === 'invonly') {
		query = query + ` and p.invoice_no like '%${invoiceno}%' `;
	}

	return promisifyQuery(query);
};

const updateVendorPymtSequenceGenerator = (center_id) => {
	let qryUpdateSqnc = '';

	qryUpdateSqnc = `
		update financial_year set vendor_pymt_seq = vendor_pymt_seq + 1 where 
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

const getVendorPymtSequenceNo = (cloneReq) => {
	let pymtNoQry = '';

	pymtNoQry = ` select concat("VP-",'${toTimeZoneFormat(cloneReq.accountarr[0].receiveddate, 'YY')}', "/", '${toTimeZoneFormat(
		cloneReq.accountarr[0].receiveddate,

		'MM',
	)}', "/", lpad(vendor_pymt_seq, 5, "0")) as pymtNo from financial_year 
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

const addVendorPaymentMaster = (cloneReq, pymtNo, insertValues, res) => {
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
		cloneReq.vendor.id,
		pymtNo,
		insertValues.receivedamount,
		cloneReq.vendor.credit_amt,
		toTimeZone(insertValues.receiveddate, 'Asia/Kolkata'),
		insertValues.pymtmode,
		insertValues.bankref,
		insertValues.pymtref,
		cloneReq.bank_id,
		cloneReq.bank_name,
		cloneReq.createdby,
	];

	let query = `
		INSERT INTO vendor_payment ( center_id, vendor_id, vendor_payment_no, payment_now_amt, advance_amt_used, payment_date, pymt_mode_ref_id, bank_ref, pymt_ref, last_updated, bank_id, bank_name, createdby)
		VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, '${today}', ?, ?, ? ) `;

	return new Promise(function (resolve, reject) {
		pool.query(query, values, async function (err, data) {
			if (err) {
				return handleError(
					new ErrorHandler('500', `Error addVendorPaymentMaster of purchaseaccounts.js ${query} and values are ${values}`, err),
					res,
				);
			}

			await updateVendorLastPaidDate(cloneReq.vendor.id, insertValues.receiveddate);

			return resolve(data.insertId);
		});
	});
};

const addVendorPaymentLedgerRecord = (insertValues, payment_ref_id, receivedamount, purchase_ref_id, callback) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let query = `
	INSERT INTO purchase_ledger ( center_id, vendor_id, purchase_ref_id, payment_ref_id, ledger_detail, debit_amt, balance_amt, ledger_date)
	VALUES
		( ? , ?, '${purchase_ref_id}', ?, 'Payment', ?, IFNULL((select balance_amt from (select (balance_amt) as balance_amt
			FROM purchase_ledger
			where center_id = '${insertValues.vendor.center_id}'  and vendor_id = '${insertValues.vendor.id}'
			ORDER BY  id DESC
			LIMIT 1) a), 0) - '${receivedamount}', '${today}'
		) `;

	let values = [insertValues.vendor.center_id, insertValues.vendor.id, payment_ref_id, receivedamount];

	pool.query(query, values, async function (err, data) {
		if (err) {
			return callback(err);
		}
		let updateVendorBalance = await updateVendorBalanceAmount(insertValues.vendor.id);
		return callback(null, data);
	});
};

const updateVendorCredit = (balanceamount, center_id, vendor_id) => {
	let qryUpdateSqnc = '';

	//~ bitwise operator. Bitwise does not negate a number exactly. eg:  ~1000 is -1001, not -1000 (a = ~a + 1)
	balanceamount = ~balanceamount + 1;

	qryUpdateSqnc = `
		update vendor set credit_amt = credit_amt + ${balanceamount} where 
		center_id = '${center_id}' and  
		id = '${vendor_id}'
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

const updateVendorCreditMinus = (creditusedamount, center_id, vendor_id) => {
	let qryUpdateSqnc = '';

	qryUpdateSqnc = `
		update vendor set credit_amt = credit_amt - ${creditusedamount} where 
		center_id = '${center_id}' and  
		id = '${vendor_id}'
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

const updateVendorLastPaidDate = (vendor_id, last_paid_date) => {
	let dt = toTimeZoneFormat(last_paid_date, 'YYYY-MM-DD');

	let qryUpdate = `
	update vendor c set c.last_paid_date = '${dt}' 
		where c.id = '${vendor_id}' 
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

const getVendorPaymentsByCenter = (requestBody) => {
	let center_id = requestBody.center_id;
	let from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata');
	let to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata');
	let vendor_id = requestBody.vendorid;
	let searchtype = requestBody.searchtype;
	let invoiceno = requestBody.invoiceno;

	let query = `
	select 
	c.name as vendor_name,
	c.id as vendor_id,
	pymt_mode_name as pymt_mode_name,
	p.bank_ref as bank_ref,
	p.pymt_ref as pymt_ref,
	p.vendor_payment_no as payment_no,
 DATE_FORMAT(STR_TO_DATE(p.payment_date,'%d-%m-%Y'), '%d-%b-%Y') as payment_date,
	p.advance_amt_used as advance_amt_used,
	pymt_mode_ref_id as pymt_mode_ref_id,
	pymt_ref as pymt_ref,
	last_updated as last_updated,
	s.invoice_no as invoice_no, 
	DATE_FORMAT(STR_TO_DATE(s.invoice_date,'%d-%m-%Y'), '%d-%b-%Y') as invoice_date,
	pd.applied_amount as applied_amount
	from 
				 vendor_payment p,
				 vendor_payment_detail pd,
				 purchase s,
				 vendor c,
				 payment_mode pm
				 where 
				 pm.id = p.pymt_mode_ref_id and
				 c.id = p.vendor_id and
				 p.id = pd.vend_pymt_ref_id and
				 pd.purchase_ref_id = s.id and
				 p.center_id = '${center_id}' `;

	if (vendor_id !== undefined && searchtype === 'all') {
		query =
			query +
			` and STR_TO_DATE(s.invoice_date,'%d-%m-%Y') between
		str_to_date('${from_date}', '%d-%m-%YYYY') and
		str_to_date('${to_date}', '%d-%m-%YYYY')`;
	}

	if (vendor_id !== undefined && vendor_id !== 'all' && searchtype === 'all') {
		query = query + ` and	p.vendor_id = '${vendor_id}' `;
	}

	if (searchtype === 'invonly') {
		query = query + ` and s.invoice_no like '%${invoiceno}%' `;
	}

	query = query + ` order by payment_date desc  `;

	return promisifyQuery(query);
};

const getPurchaseInvoiceByVendors = (requestBody) => {
	let center_id = requestBody.center_id;
	let from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata');
	let to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata');
	let vendor_id = requestBody.vendorid;
	let searchtype = requestBody.searchtype;
	let invoiceno = requestBody.invoiceno;

	let query = `	select s.id as purchase_id, s.center_id as center_id, s.vendor_id as vendor_id, s.invoice_no as invoice_no, 
	s.invoice_date as invoice_date, 
	abs(datediff(STR_TO_DATE(s.invoice_date,'%d-%m-%Y'), CURDATE())) as aging_days,
	s.net_total as invoice_amt, 
	s.purchase_type as purchase_type, 
	c.name as vendor_name, c.address1 as vendor_address1,
	c.address2 as vendor_address2,
	(select
	(
			 CASE
					WHEN  sum(pd.applied_amount) = s.net_total THEN 'PAID'
					WHEN  (sum(pd.applied_amount) <= s.net_total &&  sum(pd.applied_amount) > 0 )THEN 'PARTIALLY PAID'
	
					ELSE 'NOT PAID'
			END)  as payment_status
	
	from vendor_payment_detail pd, vendor_payment p2
	where pd.purchase_ref_id = s.id and pd.vend_pymt_ref_id = p2.id and p2.is_cancelled = 'NO') as payment_status,
	IFNULL((select sum(pd.applied_amount) from vendor_payment_detail pd, vendor_payment p2
	where pd.purchase_ref_id = s.id and pd.vend_pymt_ref_id = p2.id and p2.is_cancelled = 'NO'), 0) as paid_amount,
	(s.net_total - IFNULL((select sum(pd.applied_amount) from vendor_payment_detail pd, vendor_payment p2
	where pd.purchase_ref_id = s.id and pd.vend_pymt_ref_id = p2.id and p2.is_cancelled = 'NO'), 0)) as 
	bal_amount
	from purchase s, vendor c
	where
	c.id = '${vendor_id}' and
	s.center_id = '${center_id}' and
	s.vendor_id = c.id 

	`;

	if (vendor_id !== undefined && searchtype === 'all') {
		query =
			query +
			` and STR_TO_DATE(s.invoice_date,'%d-%m-%Y') between
		str_to_date('${from_date}', '%d-%m-%YYYY') and
		str_to_date('${to_date}', '%d-%m-%YYYY')`;
	}

	if (vendor_id !== undefined && vendor_id !== 'all' && searchtype === 'all') {
		query = query + ` and	s.vendor_id = '${vendor_id}' `;
	}

	if (searchtype === 'invonly') {
		query = query + ` and s.invoice_no = '${invoiceno}' `;
	}

	// stock issue should also be pulled out, check
	return promisifyQuery(query);
};

const getPaymentsByVendors = (requestBody) => {
	let center_id = requestBody.center_id;
	let from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata');
	let to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata');
	let vendor_id = requestBody.vendorid;
	let searchtype = requestBody.searchtype;
	let invoiceno = requestBody.invoiceno;

	let query = ` select p.*, pd.applied_amount as applied_amount, s.invoice_no as invoice_no, 
	s.invoice_date as invoice_date, s.net_total as invoice_amount,  pm.pymt_mode_name as pymt_mode from 
        vendor_payment p,
        vendor_payment_detail pd,
				purchase s,
				payment_mode pm
				where 
				pm.id = p.pymt_mode_ref_id and
        p.id = pd.vend_pymt_ref_id and
        pd.purchase_ref_id = s.id and
        p.center_id =   '${center_id}' `;

	if (vendor_id !== undefined && searchtype === 'all') {
		query =
			query +
			` and STR_TO_DATE(s.invoice_date,'%d-%m-%Y') between
					str_to_date('${from_date}', '%d-%m-%YYYY') and
					str_to_date('${to_date}', '%d-%m-%YYYY')`;
	}

	if (vendor_id !== undefined && vendor_id !== 'all' && searchtype === 'all') {
		query = query + ` and	p.vendor_id = '${vendor_id}' `;
	}

	if (searchtype === 'invonly') {
		query = query + ` and s.invoice_no = '${invoiceno}' `;
	}

	query = query + ` order by id desc  `;

	return promisifyQuery(query);
};

const getPymtTransactionByVendors = (center_id, vendor_id, callback) => {
	let query = ` 
	select 
	p.id as id, p.center_id as center_id, p.vendor_id as vendor_id,
	p.vendor_payment_no as payment_no,
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
  	vendor_payment p,
		vendor_payment_mode pm
	where 
		pm.id = p.pymt_mode_ref_id and
		p.center_id = '${center_id}' and p.vendor_id = '${vendor_id}'
	order by last_updated desc `;

	pool.query(query, function (err, data) {
		if (err) {
			return callback(err);
		}
		return callback(null, data);
	});
};

const getLedgerByVendors = (center_id, vendor_id) => {
	let query = ` select l.center_id, l.vendor_id, l.ledger_detail, l.credit_amt, l.debit_amt, l.balance_amt, l.ledger_date,
	(select s.invoice_no from purchase s where s.id = l.purchase_ref_id) as purchase_ref_id,
	(select p.vendor_payment_no from vendor_payment p where p.id = l.payment_ref_id) as payment_ref_id
	 from purchase_ledger l
	 where 
	 l.center_id =  '${center_id}' and l.vendor_id = '${vendor_id}' order by l.id desc  `;

	return promisifyQuery(query);
};

const addVendorPaymentReceived = async (requestBody) => {
	var today = new Date();
	today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	const cloneReq = { ...requestBody };

	const [vendor, center_id, accountarr] = Object.values(requestBody);

	let index = 0;

	for (const k of accountarr) {
		await updateVendorPymtSequenceGenerator(center_id);

		let pymtNo = await getVendorPymtSequenceNo(cloneReq);

		// add payment master
		let newPK = await addVendorPaymentMaster(cloneReq, pymtNo, k, res);

		// (3) - updates pymt details
		let process = processItems(cloneReq, newPK, k.purchase_ref_id, k.receivedamount);

		if (index == accountarr.length - 1) {
			return { result: 'success' };
		}
		index++;
	}
};

function processItems(cloneReq, newPK, purchase_ref_id, receivedamount) {
	let sql = `INSERT INTO vendor_payment_detail(vend_pymt_ref_id, purchase_ref_id, applied_amount) VALUES
		( '${newPK}', '${purchase_ref_id}', '${receivedamount}' )`;

	let pymtdetailsTblPromise = new Promise(function (resolve, reject) {
		pool.query(sql, function (err, data) {
			if (err) {
				reject(err);
			} else {
				// check if there is any credit balance for the vendor, if yes, first apply that

				addVendorPaymentLedgerRecord(cloneReq, newPK, receivedamount, purchase_ref_id, (err, data) => {
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

const addBulkVendorPaymentReceived = async (requestBody) => {
	const cloneReq = { ...requestBody };

	const [vendor, center_id, accountarr, invoicesplit, balanceamount] = Object.values(requestBody);

	let index = 0;

	for (const k of accountarr) {
		await updateVendorPymtSequenceGenerator(center_id);

		let pymtNo = await getVendorPymtSequenceNo(cloneReq);

		// add payment master
		let newPK = await addVendorPaymentMaster(cloneReq, pymtNo, k, res);

		//dinesh check
		// (3) - updates pymt details
		let process = processBulkItems(cloneReq, newPK, invoicesplit);

		if (index == accountarr.length - 1) {
			if (req.body.creditsused === 'YES') {
				updateVendorCreditMinus(req.body.creditusedamount, cloneReq.center_id, cloneReq.vendor.id, (err, data1) => {
					if (err) {
						let errTxt = err.message;
					} else {
						// todo nothing
					}
				});
			}

			// apply the excess amount to vendor credit
			// applicable only if balanceamount < 0
			if (balanceamount < 0) {
				updateVendorCredit(balanceamount, cloneReq.center_id, cloneReq.vendor.id, (err, data1) => {
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
		let sql = `INSERT INTO vendor_payment_detail(vend_pymt_ref_id, purchase_ref_id, applied_amount) VALUES
		( '${newPK}', '${e.id}', '${e.applied_amount}' )`;

		let pymtdetailsTblPromise = new Promise(function (resolve, reject) {
			pool.query(sql, function (err, data) {
				if (err) {
					reject(err);
				} else {
					// check if there is any credit balance for the vendor, if yes, first apply that

					addVendorPaymentLedgerRecord(cloneReq, newPK, e.applied_amount, e.id, (err, data2) => {
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

module.exports = {
	addPurchaseLedgerRecord,
	addReversePurchaseLedgerRecord,
	addPurchaseLedgerAfterReversalRecord,
	getPurchaseInvoiceByCenter,
	getVendorPymtSequenceNo,
	updateVendorPymtSequenceGenerator,
	addVendorPaymentLedgerRecord,
	addVendorPaymentMaster,
	updateVendorCredit,
	updateVendorCreditMinus,
	updateVendorBalanceAmount,
	updateVendorLastPaidDate,
	getVendorPaymentsByCenter,
	getPurchaseInvoiceByVendors,
	getPaymentsByVendors,
	getLedgerByVendors,
	addBulkVendorPaymentReceived,
};
