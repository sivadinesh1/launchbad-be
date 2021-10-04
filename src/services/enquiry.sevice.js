var pool = require('../config/db');

const { handleError, ErrorHandler } = require('../config/error');

const { toTimeZone, currentTimeInTimeZone, promisifyQuery } = require('../utils/utils');

const insertEnquiryDetail = async (k, jsonObj, tmpid) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `INSERT INTO enquiry_detail ( enquiry_id, product_id, askqty, product_code, notes, status)
        values ( '${tmpid}', (select id from product where product_code='${k.product_code}' and center_id = '${jsonObj.center_id}'), '${k.quantity}', '${k.product_code}', '${k.notes}', 'O')`;

	return promisifyQuery(query);
};

const fetchEnquiryDetailByEnqId = async (enqid) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `
	select orig.*, s.available_stock, s.id as stock_pk
from
(select ed.*, c.id as customer_id, c.name, c.address1, c.address2, c.district, c.pin, c.gst, c.mobile2, e.remarks, e.estatus,
	p.id as pid, p.center_id, p.brand_id, p.product_code as pcode, p.description as pdesc, p.unit, p.packetsize, p.hsncode,
	p.currentstock, p.unit_price, p.mrp, p.purchase_price,
	p.salesprice, p.rackno, p.location, p.maxdiscount, p.taxrate, 
	p.minqty, p.itemdiscount, p.reorderqty, p.avgpurprice,
	p.avgsaleprice, p.margin
	from 
	enquiry e,
	customer c,
	enquiry_detail ed
	LEFT outer JOIN product p
	ON p.id = ed.product_id where
	e.id = ed.enquiry_id and
	e.customer_id = c.id and e.id =  ${enqid}) as orig
	LEFT outer JOIN stock s
	ON orig.product_id = s.product_id and
	s.mrp = orig.mrp
	`;

	return promisifyQuery(query);
};

const fetchCustomerDetailsByEnqId = async (enqid) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `
	select c.*, e.* from 
enquiry e,
customer c
where
c.id = e.customer_id and
e.id = ${enqid}
	`;

	return promisifyQuery(query);
};

const updateEnquiry = async (status, enqId, updatedby) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `update enquiry 
			set
				estatus = '${status}',
				processed_date = '${today}',
				updatedby = '${updatedby}',
				updateddate = '${today}'

			where
				id = '${enqId}' `;

	return promisifyQuery(query);
};

const updateEnquiryDetail = async (product_id, stock_id, allotedQty, processed, status, enquiry_detail_id, updatedby) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `update enquiry_detail `;

	if (product_id !== '') {
		query =
			query +
			`
		set
			product_id = '${product_id}',
			stock_id = '${stock_id}',
			giveqty = '${allotedQty}',
			processed = '${processed}',
			status = '${status}', 
			updatedby = '${updatedby}',
			updateddate = '${today}'
			`;
	} else {
		query =
			query +
			`
		set
			giveqty = '${allotedQty}',
			status = '${status}',
			updatedby = '${updatedby}',
			updateddate = '${today}'
			`;
	}

	query =
		query +
		`
		where
		id = '${enquiry_detail_id}' `;

	return promisifyQuery(query);
};

const insertBackOrder = async (center_id, customer_id, enquiry_detail_id, askQty, reason, status, createdby) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');
	let now = currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY');

	let query = `
		insert into
			backorder (center_id, customer_id, enquiry_detail_id, qty, reason, status, order_date, createdby, createddate)
		VALUES ('${center_id}', '${customer_id}', '${enquiry_detail_id}', '${askQty}', '${reason}', '${status}', '${now}', '${createdby}', '${today}') 
	`;

	return promisifyQuery(query);
};

const getSuccessfullyProcessedItems = async (enquiry_id) => {
	let query = `
	select
		count(*) as count
	from 
		enquiry_detail e
	where
		enquiry_id = '${enquiry_id}' and
		e.status in ('P', 'F')`;

	return promisifyQuery(query)[0].count;
};

const draftEnquiry = async (requestBody) => {
	let jsonObj = requestBody;

	var objectKeysArray = Object.keys(jsonObj);
	objectKeysArray.forEach(function (objKey) {
		var objValue = jsonObj[objKey];

		// first update enquiry table with STATUS = 'D'
		let upQry1 = `update enquiry set estatus = 'D' where id = '${objValue.enquiry_id}' `;

		pool.query(upQry1, function (err, data) {
			if (err) {
				return handleError(new ErrorHandler('500', '/draft-enquiry update enquiry', err), res);
			}
		});

		// then update enquiry details table with STATUS = 'D' & with updated values
		let upQuery1 = `update enquiry_detail
		set
		product_id = '${objValue.product_id}',
		stock_id = ${objValue.stockid},
		giveqty = '${objValue.giveqty}',
		processed = '${objValue.processed}',
		status = 'D'
		where id = '${objValue.id}' `;

		let upQuery2 = `update enquiry_detail
			set
			product_id = null,
			stock_id = null,
			giveqty = '${objValue.giveqty}',
			processed = '${objValue.processed}',
			status = 'D'
			where id = '${objValue.id}' `;

		let uQrys = objValue.product_id === null ? upQuery2 : upQuery1;

		pool.query(uQrys, function (err, data) {
			if (err) {
				return handleError(new ErrorHandler('500', '/draft-enquiry update enquiry_detail', err), res);
			}
		});
	});

	return {
		result: 'success',
	};
};

const moveToSale = async (requestBody) => {
	let jsonObj = requestBody.enquries;
	let userid = requestBody.userid;

	let today = new Date();
	let now = new Date();

	today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');
	now = currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY');

	var objectKeysArray = Object.keys(jsonObj);

	let idx = 1;

	// iterate each record from enquiry detail
	objectKeysArray.forEach(async (objKey, index) => {
		var objValue = jsonObj[objKey];

		/** No Product Id, obviously its a backorder */
		if (objValue.product_id === '' || objValue.product_id === null) {
			// b - full back order
			// updt enq_det_tbl status as B , giveqty = 0
			// insert backorder tbl with reason prodcut code not found

			let result = await updateEnquiryDetail('', '', '0', '', 'B', objValue.id, userid);
			let result1 = await insertBackOrder(
				objValue.center_id,
				objValue.customer_id,
				objValue.id,
				objValue.askqty,
				'Product Code Not found',
				'O',
				userid,
				res,
			);
		} else if (objValue.askqty > objValue.giveqty && objValue.giveqty === 0) {
			// item code is present but given qty is 0, so effectively this goes in to backorder straight

			const bqty = objValue.askqty - objValue.giveqty;

			let result = await updateEnquiryDetail(objValue.product_id, objValue.stockid, '0', objValue.processed, 'B', objValue.id, userid);

			let result1 = await insertBackOrder(objValue.center_id, objValue.customer_id, objValue.id, bqty, 'Zero Quantity Alloted', 'O', userid);
		} else if (objValue.askqty > objValue.giveqty && objValue.giveqty !== 0) {
			// p - partial fullfilment, customer asks 100 Nos, given 50 Nos
			// updt enq_det_tbl status as P (Partial), give qty = actual given
			// insert backorder tbl with reason Partial fullfillmeent

			const bqty = objValue.askqty - objValue.giveqty;

			let result = await updateEnquiryDetail(
				objValue.product_id,
				objValue.stockid,
				objValue.giveqty,
				objValue.processed,
				'P',
				objValue.id,
				userid,
			);

			let result1 = await insertBackOrder(
				objValue.center_id,
				objValue.customer_id,
				objValue.id,
				bqty,
				'Partial fullfillmeent',
				'O',
				userid,
				res,
			);
		} else if (objValue.giveqty >= objValue.askqty && objValue.product_id !== '' && objValue.product_id !== null) {
			// F- fullfilled
			// updt enq_det_tbl status as F, give qty = actual given

			let result = await updateEnquiryDetail(
				objValue.product_id,
				objValue.stockid,
				objValue.giveqty,
				objValue.processed,
				'F',
				objValue.id,
				userid,
			);
		}

		if (objectKeysArray.length === idx) {
			finalEnquiryStatusUpdte(jsonObj, userid);
		}
		idx = idx + 1;
	});
};

const finalEnquiryStatusUpdte = async (jsonObj, userid) => {
	let rows = await getSuccessfullyProcessedItems(jsonObj[0].enquiry_id);

	let finalresult = '';

	if (rows === 0) {
		// E - executed means will not appear in open enquiry page
		finalresult = await updateEnquiry('E', jsonObj[0].enquiry_id, userid);
	} else {
		// P - processed, ready for sale in open qneuiry page
		finalresult = await updateEnquiry('P', jsonObj[0].enquiry_id, userid);
	}

	if (finalresult === 'success') {
		return {
			result: 'success',
		};
	} else {
		return {
			result: 'failure',
		};
	}
};

const updateGiveqtyEnquiryDetails = async (requestBody) => {
	let giveqty = requestBody.giveqty;
	let id = requestBody.enqdetailid;

	let query = `update enquiry_detail
	set
	giveqty = '${giveqty}'
	where id = '${id}' `;

	return promisifyQuery(query);
};

const updateCustomerEnquiry = async (id, enqid) => {
	let query = `update enquiry
	set
	customer_id = '${id}'
	where id = '${enqid}' `;

	return promisifyQuery(query);
};

const updateStatusEnquiryDetails = async (requestBody) => {
	let status = requestBody.status;
	let id = requestBody.enqdetailid;

	if (status === 'B') {
		let query = `update enquiry_detail
		set
		product_id = null,
		status = '${status}'
		where id = '${id}' `;

		return promisifyQuery(query);
	}
};

const updateEnquiryDetails = async (requestBody) => {
	let jsonObj = requestBody.body;

	var objectKeysArray = Object.keys(jsonObj);
	objectKeysArray.forEach(function (objKey) {
		var objValue = jsonObj[objKey];
	});
};

const insertEnquiryDetails = async (requestBody) => {
	let jsonObj = requestBody;

	var today = new Date();
	let count = 0;

	today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `INSERT INTO enquiry ( center_id, customer_id, enquiry_date, estatus, remarks) 
							values ( '${jsonObj.center_id}', '${jsonObj.customerctrl.id}', '${today}', 'O','${jsonObj.remarks}')`;

	pool.query(query, async function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', 'error /insert-enquiry-details insert enquiry..step1..', err), res);
		} else {
			let tmpid = data.insertId;

			const prodArr = jsonObj['productarr'];

			for (const k of prodArr) {
				await insertEnquiryDetail(k, jsonObj, tmpid, (err, data) => {
					if (err) {
						let errTxt = err.message;

						return handleError(new ErrorHandler('500', '/insert-enquiry-details', err), res);
					} else {
						let newPK = data.insertId;
						// do nothing...
					}
				});

				count++;
				if (count === prodArr.length) {
					return {
						result: 'success',
					};
				}
			}
		}
	});
};

const addMoreEnquiryDetails = async (requestBody) => {
	let jsonObj = requestBody;

	var today = new Date();

	today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query1 = `INSERT INTO enquiry_detail ( enquiry_id, product_id, askqty, product_code, notes, status)
							values ( '${jsonObj.enquiry_id}', 
							(select id from product where product_code='${jsonObj.product_code}' 
							and center_id = '${jsonObj.center_id}'), 
							'${jsonObj.askqty}', '${jsonObj.product_code}', '${jsonObj.notes}', 'O')`;

	pool.query(query1, function (err, data) {
		if (err) {
			return handleError(new ErrorHandler('500', '/add-more-enquiry-details', err), res);
		} else {
			return {
				result: data.insertId,
			};
		}
	});
};

const openEnquiries = async (center_id, status) => {
	let query = `select e.id, e.enquiry_date, e.estatus, c.name as custname,
  
	(select count(*) from enquiry_detail where enquiry_id = e.id)
	as noofitems
	from enquiry e, customer c
	where 
		e.customer_id = c.id and
	estatus = '${status}' and e.center_id = '${center_id}'
	order by 
	enquiry_date desc`;

	return promisifyQuery(query);
};

const getEnquiryDetails = async (enqid) => {
	let enquiryDetails;
	let customerDetails;

	await fetchEnquiryDetailByEnqId(enqid, (err, data) => {
		if (err) {
			let errTxt = err.message;

			return handleError(new ErrorHandler('500', `/get-enquiry-details/:enqid ${enqid}`, err), res);
		} else {
			enquiryDetails = data;
			// do nothing...
		}
	});

	await fetchCustomerDetailsByEnqId(enqid, (err, data) => {
		if (err) {
			let errTxt = err.message;

			return handleError(new ErrorHandler('500', `/get-enquiry-details/:enqid ${enqid} fetchCustomerDetailsByEnqId .`, err), res);
		} else {
			customerDetails = data;
			// do nothing...
		}
	});

	return res.json({
		enquiryDetails: enquiryDetails,
		customerDetails: customerDetails,
	});
};

const getEnquiryMaster = async (enqid) => {
	let query = `
	select 
	e.id as enqid,
	e.enquiry_date as enquiry_date,
	e.estatus as estatus,
	e.sale_id as sale_id,
	e.processed_date as processed_date,
	c.id as customer_id,
	 c.name as customer_name,
	 c.address1 as address1,
	 c.address2 as address2,
	 c.address3 as address3,
	 c.gst as gst,
	 c.mobile as mobile,
	 c.credit_amt,
	 csa.address1 as csa_address1,
	 csa.address2 as csa_address2
	from enquiry e,
	customer c,
	customer_shipping_address csa
	where 
	c.id = e.customer_id and
	csa.customer_id = c.id and
	e.id = ${enqid}	
	
	`;

	return promisifyQuery(query);
};

const getCustomerData = async (enqid) => {
	let sql = `select c.*, s.code 
	from
	customer c,
	enquiry e,
	state s
	where
	e.customer_id = c.id and
	s.id = c.state_id and
	e.id = ${enqid}
	`;

	return promisifyQuery(query);
};

const getEnquiredProductData = async (center_id, customerid, enqid, orderdate) => {
	// fetch values only of enq detail status in {P - processed, F - fullfilled} B- backorder is ignored
	let query = `select a.product_code as product_code, a.description, a.mrp, a.taxrate, b.available_stock,
	ed.giveqty as qty, a.unit_price, a.id as product_id, b.id as stock_pk, e.enquiry_date,
	IFNULL(
	(
	select concat(value,'~',type)
	from discount
	where str_to_date('${orderdate}','%d-%m-%Y')  
	between str_to_date(startdate, '%d-%m-%Y') and str_to_date(enddate, '%d-%m-%Y') and
  customer_id = '${customerid}' and
	gst_slab = a.taxrate and
	a.brand_id = discount.brand_id and
  discount.brand_id = a.brand_id
	), 
	
	(  select concat(value,'~',type) 
from discount 
where str_to_date('${orderdate}','%d-%m-%Y')  
between str_to_date(startdate, '%d-%m-%Y') and str_to_date(enddate, '%d-%m-%Y') and
customer_id = '${customerid}' and
gst_slab = a.taxrate and
discount.brand_id = 0 )
	
	) as disc_info
	
	
	from 
	enquiry e,
	enquiry_detail ed,
	product a, 
	stock b
	where
	e.id = ed.enquiry_id and
	ed.product_id = a.id and
	a.id = b.product_id and
	b.id = ed.stock_id and
	ed.status in ('P', 'F')  and
	ed.giveqty != 0 and
	e.id = ${enqid}
	`;

	return promisifyQuery(query);
};

const getBackOrder = async (center_id) => {
	let sql = `SELECT c.name as customer_name, p.product_code as product_code, p.id as product_id,
	p.description as description, ed.notes, ed.askqty, ed.giveqty, b.reason, b.order_date, s.available_stock
	FROM 
	backorder b, 
	enquiry_detail ed,
	product p,
	stock s, customer c
	WHERE 
	s.product_id = p.id and c.id = b.customer_id and
	b.enquiry_detail_id = ed.id and
	p.id = ed.product_id and
	b.center_id = '${center_id}' and
	str_to_date(order_date, '%d-%m-%YYYY') BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW()
	union all
	SELECT c.name as customer_name, "N/A" as product_code, "N/A" as product_id, "N/A" as description, ed.notes, ed.askqty, ed.giveqty, b.reason, 
	b.order_date, "N/A" as available_stock FROM 
	backorder b, customer c,
	enquiry_detail ed
	WHERE 
	b.enquiry_detail_id = ed.id and
	c.id = b.customer_id and
	ed.product_id is null and
	b.center_id = '${center_id}' and
	str_to_date(order_date, '%d-%m-%YYYY') BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW();
	`;

	return promisifyQuery(query);
};

const searchEnquiries = async (requestBody) => {
	let center_id = requestBody.center_id;
	let status = requestBody.status;
	let customer_id = requestBody.customerid;
	let from_date = requestBody.fromdate;
	let to_date = requestBody.todate;
	let order = requestBody.order;

	if (from_date !== '') {
		from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata');
	}

	if (to_date !== '') {
		to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata');
	}

	let custsql = `and e.customer_id = '${customer_id}' `;

	let query = `select
	e.id as id,
	e.center_id as center_id,
	e.customer_id as customer_id,
	CAST(e.enquiry_date AS CHAR) as enquiry_date,
	e.estatus as estatus,
	e.remarks as remarks,
	e.sale_id as sale_id,
	e.processed_date as processed_date,
	c.id as customer_id, c.name as customer_name,
    	case e.estatus
				when 'O' then 'New'
				when 'D' then 'Draft'
				when 'E' then 'Executed'
				when 'P' then 'Invoice Ready'
				when 'C' then 'Completed'
				when 'X' then 'Cancelled'
    end as status_txt,
	(select count(*) from enquiry_detail where enquiry_id = e.id)
	as noofitems
	from
	enquiry e,
	customer c
	where
	c.id = e.customer_id and

	e.center_id =  '${center_id}' and
	str_to_date(DATE_FORMAT(enquiry_date,'%d-%m-%YYYY') , '%d-%m-%YYYY') between
	str_to_date('${from_date}', '%d-%m-%YYYY') and
	str_to_date('${to_date}', '%d-%m-%YYYY')  `;

	if (customer_id !== 'all') {
		query = query + custsql;
	}

	if (status !== 'all') {
		query = query + ` and e.estatus =  '${status}' `;
	}

	query = query + `order by enquiry_date ${order} `;

	return promisifyQuery(query);
};

const deleteEnquiryDetails = async (requestBody) => {
	let id = requestBody.id;
	let enq_id = requestBody.enquiry_id;

	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	// step 1
	let auditQuery = `
	INSERT INTO audit_tbl (module, module_ref_id, module_ref_det_id, actn, old_value, new_value, audit_date, center_id)
	VALUES
		('Enquiry', '${enq_id}', '${id}', 'delete', 
		(SELECT CONCAT('[{', result, '}]') as final
		FROM (
			SELECT GROUP_CONCAT(CONCAT_WS(',', CONCAT('"saleId": ', enquiry_id), CONCAT('"productId": "', product_id, '"'), CONCAT('"askqty": "', askqty, '"')) SEPARATOR '},{') as result
			FROM (
				SELECT enquiry_id, product_id, askqty, notes
				FROM enquiry_detail where id = '${id}'
			) t1
		) t2)
		, '', '${today}', (select center_id from enquiry where id = '${enq_id}')
		) `;

	// step 1
	let auditPromise = await new Promise(function (resolve, reject) {
		pool.query(auditQuery, function (err, data) {
			if (err) {
				return reject(handleError(new ErrorHandler('500', '/delete-enquiry-details', err), res));
			}
			resolve(data);
		});
	});

	// step 2
	let deletePromise = await new Promise(function (resolve, reject) {
		let query = `
			delete from enquiry_detail where id = '${id}' `;

		pool.query(query, function (err, data) {
			if (err) {
				return reject(handleError(new ErrorHandler('500', '/delete-enquiry-details', err), res));
			}
			resolve(data);
		});
	});

	return {
		result: 'success',
	};
};

const deleteEnquiry = async (id) => {
	let query = `update enquiry set estatus = 'X' where id = '${id}' `;
	return promisifyQuery(query);
};

const getEnquiryById = async (enquiryid) => {
	let query = `select * 
  from 
		enquiry_detail ed,
		enquiry em, 
		parts p
  where
		ed.partno = p.partno and
		em.id = ed.enquiry_id and
		ed.enquiry_id = ${enquiryid}
  `;

	return promisifyQuery(query);
};

const getCustomerDetailsById = async (enquiryid) => {
	let query = ` select c.*
  from 
		enquiry em, 
		customer c
	where
		em.customer_id = c.id and
		em.id = ${enquiryid}`;
	return promisifyQuery(query);
};

module.exports = {
	insertEnquiryDetail,
	fetchCustomerDetailsByEnqId,
	fetchEnquiryDetailByEnqId,
	updateEnquiryDetail,
	insertBackOrder,
	updateEnquiry,
	getSuccessfullyProcessedItems,

	draftEnquiry,
	moveToSale,
	updateGiveqtyEnquiryDetails,
	updateCustomerEnquiry,
	updateStatusEnquiryDetails,
	updateEnquiryDetails,
	insertEnquiryDetails,
	addMoreEnquiryDetails,
	openEnquiries,
	getEnquiryDetails,
	getEnquiryMaster,
	getCustomerData,
	getEnquiredProductData,
	getBackOrder,
	searchEnquiries,
	deleteEnquiryDetails,

	deleteEnquiry,
	getEnquiryById,
	getCustomerDetailsById,
};
