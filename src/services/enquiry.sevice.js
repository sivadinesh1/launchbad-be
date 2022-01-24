var pool = require('../config/db');

const { handleError, ErrorHandler } = require('../config/error');

const {
	toTimeZoneFormat,
	currentTimeInTimeZone,
	promisifyQuery,
} = require('../utils/utils');
const EnquiryRepo = require('../repos/enquiry.repo');

const insertEnquiryDetail = async (k, jsonObj, tmp_id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let query = `INSERT INTO enquiry_detail ( enquiry_id, product_id, ask_quantity, product_code, notes, status)
        values ( '${tmp_id}', (select id from product where product_code='${k.product_code}' and center_id = '${jsonObj.center_id}'), '${k.quantity}', '${k.product_code}', '${k.notes}', 'O')`;

	return promisifyQuery(query);
};

const fetchEnquiryDetailByEnqId = async (enq_id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let query = `
	select orig.*, s.available_stock, s.id as stock_pk
from
(select ed.*, c.id as customer_id, c.name, c.address1, c.address2, c.district, c.pin, c.gst, c.mobile2, e.remarks, e.e_status,
	p.id as pid, p.center_id, p.brand_id, p.product_code as product_code, p.product_description as product_description, p.unit, p.packet_size, p.hsn_code,
	p.current_stock, p.unit_price, p.mrp, p.purchase_price,
	p.sales_price, p.rack_info, p.location, p.max_discount, p.tax_rate, 
	p.minimum_quantity, p.item_discount, p.reorder_quantity, p.average_purchase_price,
	p.average_sale_price, p.margin
	from 
	enquiry e,
	customer c,
	enquiry_detail ed
	LEFT outer JOIN product p
	ON p.id = ed.product_id where
	e.id = ed.enquiry_id and
	e.customer_id = c.id and e.id =  ${enq_id}) as orig
	LEFT outer JOIN stock s
	ON orig.product_id = s.product_id and
	s.mrp = orig.mrp
	`;

	return promisifyQuery(query);
};

const fetchCustomerDetailsByEnqId = async (enq_id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let query = `
	select c.*, e.* from 
enquiry e,
customer c
where
c.id = e.customer_id and
e.id = ${enq_id}
	`;

	return promisifyQuery(query);
};

const updateEnquiry = async (status, enqId, updated_by) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let query = `update enquiry 
			set
				e_status = '${status}',
				processed_date = '${today}',
				updated_by = '${updated_by}',
				updatedAt = '${today}'

			where
				id = '${enqId}' `;

	return promisifyQuery(query);
};

const updateEnquiryDetail = async (
	product_id,
	stock_id,
	allotedQty,
	processed,
	status,
	enquiry_detail_id,
	updated_by
) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let query = `update enquiry_detail `;

	if (product_id !== '') {
		query =
			query +
			`
		set
			product_id = '${product_id}',
			stock_id = '${stock_id}',
			give_quantity = '${allotedQty}',
			processed = '${processed}',
			status = '${status}', 
			updated_by = '${updated_by}',
			updatedAt = '${today}'
			`;
	} else {
		query =
			query +
			`
		set
			give_quantity = '${allotedQty}',
			status = '${status}',
			updated_by = '${updated_by}',
			updatedAt = '${today}'
			`;
	}

	query =
		query +
		`
		where
		id = '${enquiry_detail_id}' `;

	return promisifyQuery(query);
};

const insertBackOrder = async (
	center_id,
	customer_id,
	enquiry_detail_id,
	ask_quantity,
	reason,
	status,
	created_by
) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');
	let now = currentTimeInTimeZone('DD-MM-YYYY');

	let query = `
		insert into
			backorder (center_id, customer_id, enquiry_detail_id, qty, reason, status, order_date, created_by, createdAt)
		VALUES ('${center_id}', '${customer_id}', '${enquiry_detail_id}', '${ask_quantity}', '${reason}', '${status}', '${now}', '${created_by}', '${today}') 
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
		let upQry1 = `update enquiry set e_status = 'D' where id = '${objValue.enquiry_id}' `;

		pool.query(upQry1, function (err, data) {
			if (err) {
				return handleError(
					new ErrorHandler(
						'500',
						'/draft-enquiry update enquiry',
						err
					),
					res
				);
			}
		});

		// then update enquiry details table with STATUS = 'D' & with updated values
		let upQuery1 = `update enquiry_detail
		set
		product_id = '${objValue.product_id}',
		stock_id = ${objValue.stock_id},
		give_quantity = '${objValue.give_quantity}',
		processed = '${objValue.processed}',
		status = 'D'
		where id = '${objValue.id}' `;

		let upQuery2 = `update enquiry_detail
			set
			product_id = null,
			stock_id = null,
			give_quantity = '${objValue.give_quantity}',
			processed = '${objValue.processed}',
			status = 'D'
			where id = '${objValue.id}' `;

		let u_Qry = objValue.product_id === null ? upQuery2 : upQuery1;

		pool.query(u_Qry, function (err, data) {
			if (err) {
				return handleError(
					new ErrorHandler(
						'500',
						'/draft-enquiry update enquiry_detail',
						err
					),
					res
				);
			}
		});
	});

	return {
		result: 'success',
	};
};

const moveToSale = async (requestBody) => {
	let jsonObj = requestBody.enquries;
	let user_id = requestBody.user_id;

	let today = new Date();
	let now = new Date();

	today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');
	now = currentTimeInTimeZone('DD-MM-YYYY');

	var objectKeysArray = Object.keys(jsonObj);

	let idx = 1;

	// iterate each record from enquiry detail
	objectKeysArray.forEach(async (objKey, index) => {
		var objValue = jsonObj[objKey];

		/** No Product Id, obviously its a back order */
		if (objValue.product_id === '' || objValue.product_id === null) {
			// b - full back order
			// updt enq_det_tbl status as B , give_quantity = 0
			// insert back order tbl with reason product code not found

			let result = await updateEnquiryDetail(
				'',
				'',
				'0',
				'',
				'B',
				objValue.id,
				user_id
			);
			let result1 = await insertBackOrder(
				objValue.center_id,
				objValue.customer_id,
				objValue.id,
				objValue.ask_quantity,
				'Product Code Not found',
				'O',
				user_id,
				res
			);
		} else if (
			objValue.ask_quantity > objValue.give_quantity &&
			objValue.give_quantity === 0
		) {
			// item code is present but given qty is 0, so effectively this goes in to back order straight

			const b_qty = objValue.ask_quantity - objValue.give_quantity;

			let result = await updateEnquiryDetail(
				objValue.product_id,
				objValue.stock_id,
				'0',
				objValue.processed,
				'B',
				objValue.id,
				user_id
			);

			let result1 = await insertBackOrder(
				objValue.center_id,
				objValue.customer_id,
				objValue.id,
				b_qty,
				'Zero Quantity Alloted',
				'O',
				user_id
			);
		} else if (
			objValue.ask_quantity > objValue.give_quantity &&
			objValue.give_quantity !== 0
		) {
			// p - partial fulfillment, customer asks 100 Nos, given 50 Nos
			// up_dt enq_det_tbl status as P (Partial), give qty = actual given
			// insert back order tbl with reason Partial fulfillment

			const b_qty = objValue.ask_quantity - objValue.give_quantity;

			let result = await updateEnquiryDetail(
				objValue.product_id,
				objValue.stock_id,
				objValue.give_quantity,
				objValue.processed,
				'P',
				objValue.id,
				user_id
			);

			let result1 = await insertBackOrder(
				objValue.center_id,
				objValue.customer_id,
				objValue.id,
				b_qty,
				'Partial fulfillment',
				'O',
				user_id,
				res
			);
		} else if (
			objValue.give_quantity >= objValue.ask_quantity &&
			objValue.product_id !== '' &&
			objValue.product_id !== null
		) {
			// F- fulfilled
			// up dt enq_det_tbl status as F, give qty = actual given

			let result = await updateEnquiryDetail(
				objValue.product_id,
				objValue.stock_id,
				objValue.give_quantity,
				objValue.processed,
				'F',
				objValue.id,
				user_id
			);
		}

		if (objectKeysArray.length === idx) {
			finalEnquiryStatusUpdate(jsonObj, user_id);
		}
		idx = idx + 1;
	});
};

const finalEnquiryStatusUpdate = async (jsonObj, user_id) => {
	let rows = await getSuccessfullyProcessedItems(jsonObj[0].enquiry_id);

	let final_result = '';

	if (rows === 0) {
		// E - executed means will not appear in open enquiry page
		final_result = await updateEnquiry('E', jsonObj[0].enquiry_id, user_id);
	} else {
		// P - processed, ready for sale in open enquiry page
		final_result = await updateEnquiry('P', jsonObj[0].enquiry_id, user_id);
	}

	if (final_result === 'success') {
		return {
			result: 'success',
		};
	} else {
		return {
			result: 'failure',
		};
	}
};

const updateGiveQuantityEnquiryDetails = async (requestBody) => {
	let give_quantity = requestBody.give_quantity;
	let id = requestBody.enq_detail_id;

	let query = `update enquiry_detail
	set
	give_quantity = '${give_quantity}'
	where id = '${id}' `;

	return promisifyQuery(query);
};

const updateCustomerEnquiry = async (id, enq_id) => {
	let query = `update enquiry
	set
	customer_id = '${id}'
	where id = '${enq_id}' `;

	return promisifyQuery(query);
};

const update_statusEnquiryDetails = async (requestBody) => {
	let status = requestBody.status;
	let id = requestBody.enq_detail_id;

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

// const insertEnquiryDetails = async (requestBody) => {
// 	let jsonObj = requestBody;

// 	var today = new Date();
// 	let count = 0;

// 	today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

// 	let query = `INSERT INTO enquiry ( center_id, customer_id, enquiry_date, e_status, remarks)
// 							values ( '${jsonObj.center_id}', '${jsonObj.customer_ctrl.id}', '${today}', 'O','${jsonObj.remarks}')`;

// 	pool.query(query, async function (err, data) {
// 		if (err) {
// 			return handleError(new ErrorHandler('500', 'error /insert-enquiry-details insert enquiry..step1..', err), res);
// 		} else {
// 			let tmp_id = data.insertId;

// 			const prodArr = jsonObj['product_arr'];

// 			for (const k of prodArr) {
// 				await insertEnquiryDetail(k, jsonObj, tmp_id, (err, data) => {
// 					if (err) {
// 						let errTxt = err.message;

// 						return handleError(new ErrorHandler('500', '/insert-enquiry-details', err), res);
// 					} else {
// 						let newPK = data.insertId;
// 						// do nothing...
// 					}
// 				});

// 				count++;
// 				if (count === prodArr.length) {
// 					return {
// 						result: 'success',
// 					};
// 				}
// 			}
// 		}
// 	});
// };

const insertEnquiryDetailsTxn = async (requestBody, center_id, user_id) => {
	let enquiry = requestBody;

	var today = new Date();
	let count = 0;

	try {
		// (1) Updates inv_seq in tbl financial_year, then {returns} formatted sequence {YY/MM/inv_seq}
		const status = await prisma.$transaction(async (prisma) => {
			let result2 = await EnquiryRepo.AddEnquiry(
				enquiry,
				center_id,
				user_id,
				prisma
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

const addMoreEnquiryDetails = async (requestBody) => {
	let jsonObj = requestBody;

	var today = new Date();

	today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let query1 = `INSERT INTO enquiry_detail ( enquiry_id, product_id, ask_quantity, product_code, notes, status)
							values ( '${jsonObj.enquiry_id}', 
							(select id from product where product_code='${jsonObj.product_code}' 
							and center_id = '${jsonObj.center_id}'), 
							'${jsonObj.ask_quantity}', '${jsonObj.product_code}', '${jsonObj.notes}', 'O')`;

	pool.query(query1, function (err, data) {
		if (err) {
			return handleError(
				new ErrorHandler('500', '/add-more-enquiry-details', err),
				res
			);
		} else {
			return {
				result: data.insertId,
			};
		}
	});
};

const openEnquiries = async (center_id, status) => {
	let query = `select e.id, e.enquiry_date, e.e_status, c.name as customer_name,
  
	(select count(*) from enquiry_detail where enquiry_id = e.id)
	as no_of_items
	from enquiry e, customer c
	where 
		e.customer_id = c.id and
	e_status = '${status}' and e.center_id = '${center_id}'
	order by 
	enquiry_date desc`;

	return promisifyQuery(query);
};

const getEnquiryDetails = async (enq_id) => {
	let enquiryDetails;
	let customerDetails;

	await fetchEnquiryDetailByEnqId(enq_id, (err, data) => {
		if (err) {
			let errTxt = err.message;

			return handleError(
				new ErrorHandler(
					'500',
					`/get-enquiry-details/:enqid ${enq_id}`,
					err
				),
				res
			);
		} else {
			enquiryDetails = data;
			// do nothing...
		}
	});

	await fetchCustomerDetailsByEnqId(enq_id, (err, data) => {
		if (err) {
			let errTxt = err.message;

			return handleError(
				new ErrorHandler(
					'500',
					`/get-enquiry-details/:enq-id ${enq_id} fetchCustomerDetailsByEnqId .`,
					err
				),
				res
			);
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

const getEnquiryMaster = async (enq_id) => {
	let query = `
	select 
	e.id as enq_id,
	e.enquiry_date as enquiry_date,
	e.e_status as e_status,
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
	e.id = ${enq_id}	
	
	`;

	return promisifyQuery(query);
};

const getCustomerData = async (enq_id) => {
	let sql = `select c.*, s.code 
	from
	customer c,
	enquiry e,
	state s
	where
	e.customer_id = c.id and
	s.id = c.state_id and
	e.id = ${enq_id}
	`;

	return promisifyQuery(query);
};

const getEnquiredProductData = async (
	center_id,
	customer_id,
	enq_id,
	order_date
) => {
	// fetch values only of enq detail status in {P - processed, F - fulfilled} B- back order is ignored
	let query = `select a.product_code as product_code, a.product_description, a.mrp, a.tax_rate, b.available_stock,
	ed.give_quantity as qty, a.unit_price, a.id as product_id, b.id as stock_pk, e.enquiry_date,
	IFNULL(
	(
	select concat(value,'~',type)
	from discount
	where str_to_date('${order_date}','%d-%m-%Y')  
	between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') and
  customer_id = '${customer_id}' and
	gst_slab = a.tax_rate and
	a.brand_id = discount.brand_id and
  discount.brand_id = a.brand_id
	), 
	
	(  select concat(value,'~',type) 
from discount 
where str_to_date('${order_date}','%d-%m-%Y')  
between str_to_date(start_date, '%d-%m-%Y') and str_to_date(end_date, '%d-%m-%Y') and
customer_id = '${customer_id}' and
gst_slab = a.tax_rate and
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
	ed.give_quantity != 0 and
	e.id = ${enq_id}
	`;

	return promisifyQuery(query);
};

const getBackOrder = async (center_id) => {
	let sql = `SELECT c.name as customer_name, p.product_code as product_code, p.id as product_id,
	p.product_description as description, ed.notes, ed.ask_quantity, ed.give_quantity, b.reason, b.order_date, s.available_stock
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
	SELECT c.name as customer_name, "N/A" as product_code, "N/A" as product_id, "N/A" as description, ed.notes, ed.ask_quantity, ed.give_quantity, b.reason, 
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
	let customer_id = requestBody.customer_id;
	let from_date = requestBody.from_date;
	let to_date = requestBody.to_date;
	let order = requestBody.order;

	if (from_date !== '') {
		from_date = toTimeZoneFormat(requestBody.from_date, 'YYYY-MM-DD');
	}

	if (to_date !== '') {
		to_date = toTimeZoneFormat(requestBody.to_date, 'YYYY-MM-DD');
	}

	let customer_sql = `and e.customer_id = '${customer_id}' `;

	let query = `select
	e.id as id,
	e.center_id as center_id,
	e.customer_id as customer_id,
	CAST(e.enquiry_date AS CHAR) as enquiry_date,
	e.e_status as e_status,
	e.remarks as remarks,
	e.sale_id as sale_id,
	e.processed_date as processed_date,
	c.id as customer_id, c.name as customer_name,
    	case e.e_status
				when 'O' then 'New'
				when 'D' then 'Draft'
				when 'E' then 'Executed'
				when 'P' then 'Invoice Ready'
				when 'C' then 'Completed'
				when 'X' then 'Cancelled'
    end as status_txt,
	(select count(*) from enquiry_detail where enquiry_id = e.id)
	as no_of_items
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
		query = query + customer_sql;
	}

	if (status !== 'all') {
		query = query + ` and e.e_status =  '${status}' `;
	}

	query = query + `order by enquiry_date ${order} `;

	return promisifyQuery(query);
};

const deleteEnquiryDetails = async (requestBody) => {
	let id = requestBody.id;
	let enq_id = requestBody.enquiry_id;

	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	// step 1
	let auditQuery = `
	INSERT INTO audit (module, module_ref_id, module_ref_det_id, action, old_value, new_value, audit_date, center_id)
	VALUES
		('Enquiry', '${enq_id}', '${id}', 'delete', 
		(SELECT CONCAT('[{', result, '}]') as final
		FROM (
			SELECT GROUP_CONCAT(CONCAT_WS(',', CONCAT('"saleId": ', enquiry_id), CONCAT('"productId": "', product_id, '"'), CONCAT('"ask_quantity": "', ask_quantity, '"')) SEPARATOR '},{') as result
			FROM (
				SELECT enquiry_id, product_id, ask_quantity, notes
				FROM enquiry_detail where id = '${id}'
			) t1
		) t2)
		, '', '${today}', (select center_id from enquiry where id = '${enq_id}')
		) `;

	// step 1
	let auditPromise = await new Promise(function (resolve, reject) {
		pool.query(auditQuery, function (err, data) {
			if (err) {
				return reject(
					handleError(
						new ErrorHandler('500', '/delete-enquiry-details', err),
						res
					)
				);
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
				return reject(
					handleError(
						new ErrorHandler('500', '/delete-enquiry-details', err),
						res
					)
				);
			}
			resolve(data);
		});
	});

	return {
		result: 'success',
	};
};

const deleteEnquiry = async (id) => {
	let query = `update enquiry set e_status = 'X' where id = '${id}' `;
	return promisifyQuery(query);
};

const getEnquiryById = async (enquiry_id) => {
	let query = `select * 
  from 
		enquiry_detail ed,
		enquiry em, 
		parts p
  where
		ed.part_no = p.part_no and
		em.id = ed.enquiry_id and
		ed.enquiry_id = ${enquiry_id}
  `;

	return promisifyQuery(query);
};

const getCustomerDetailsById = async (enquiry_id) => {
	let query = ` select c.*
  from 
		enquiry em, 
		customer c
	where
		em.customer_id = c.id and
		em.id = ${enquiry_id}`;
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
	updateGiveQuantityEnquiryDetails,
	updateCustomerEnquiry,
	update_statusEnquiryDetails,
	updateEnquiryDetails,
	insertEnquiryDetails,
	insertEnquiryDetailsTxn,
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
