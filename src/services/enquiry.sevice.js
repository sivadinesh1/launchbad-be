var pool = require('../config/db');
const { prisma } = require('../config/prisma');

const { handleError, ErrorHandler } = require('../config/error');

const {
	toTimeZoneFormat,
	currentTimeInTimeZone,
	promisifyQuery,
} = require('../utils/utils');
const EnquiryRepo = require('../repos/enquiry.repo');
const EnquiryDetailRepo = require('../repos/enquiry-detail.repo');
const BackOrderRepo = require('../repos/back-order.repo');
const ProductRepo = require('../repos/product.repo');

const insertEnquiryDetail = async (k, jsonObj, tmp_id) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let query = `INSERT INTO enquiry_detail ( enquiry_id, product_id, ask_quantity, product_code, notes, status)
        values ( '${tmp_id}', (select id from product where product_code='${k.product_code}' and center_id = '${jsonObj.center_id}'), '${k.quantity}', '${k.product_code}', '${k.notes}', 'O')`;

	return promisifyQuery(query);
};

const fetchEnquiryDetailByEnqId = async (enq_id) => {
	let query = `
	select orig.*, s.available_stock, s.id as stock_pk
	from
	(select ed.*, c.id as customer_id, c.name, c.address1, c.address2, c.district, c.pin, c.gst, c.mobile2, e.remarks, e.e_status,
		p.id as pid,  p.brand_id,  p.product_description as product_description, p.packet_size, p.hsn_code,
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
		e.customer_id = c.id and e.id =  ${enq_id} ) as orig
		LEFT outer JOIN stock s
		ON orig.product_id = s.product_id and
		s.mrp = orig.mrp
	`;

	return await promisifyQuery(query);
};

const fetchCustomerDetailsByEnqId = async (enq_id) => {
	let query = `
	select c.*, e.* from 
enquiry e,
customer c
where
c.id = e.customer_id and
e.id = ${enq_id}
	`;

	return await promisifyQuery(query);
};

const updateEnquiry = async (status, enq_id, updated_by) => {
	const updateEnqStatus = await EnquiryRepo.updateEnquiry(
		status,
		enq_id,
		updated_by,
		prisma
	);

	return updateEnqStatus;

	// let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	// let query = `update enquiry
	// 		set
	// 			e_status = '${status}',
	// 			processed_date = '${today}',
	// 			updated_by = '${updated_by}',
	// 			updatedAt = '${today}'

	// 		where
	// 			id = '${enqId}' `;

	// return promisifyQuery(query);
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
			back_order (center_id, customer_id, enquiry_detail_id, qty, reason, status, order_date, created_by, createdAt)
		VALUES ('${center_id}', '${customer_id}', '${enquiry_detail_id}', '${ask_quantity}', '${reason}', '${status}', '${now}', '${created_by}', '${today}') 
	`;

	return promisifyQuery(query);
};

// countOfSuccessfullyProcessedItems

const getSuccessfullyProcessedItems = async (enquiry_id, prisma) => {
	let count = await EnquiryDetailRepo.countOfSuccessfullyProcessedItems(
		enquiry_id,
		prisma
	);

	return count;

	// let query = `
	// select
	// 	count(*) as count
	// from
	// 	enquiry_detail e
	// where
	// 	enquiry_id = '${enquiry_id}' and
	// 	e.status in ('P', 'F')`;

	// return promisifyQuery(query)[0].count;
};

const draftEnquiry = async (requestBody, center_id, user_id) => {
	let enquiryArray = requestBody;

	try {
		// (1) Updates inv_seq in tbl financial_year, then {returns} formatted sequence {YY/MM/inv_seq}
		const status = await prisma.$transaction(async (prisma) => {
			let result = await EnquiryRepo.updateEnquiryStatus(
				enquiryArray[0].enquiry_id,
				'D',

				prisma
			);

			let result1 = await loopThroughEnquiryDetails(
				enquiryArray,
				user_id,
				prisma
			);
		});
		return {
			result: 'success',
		};
	} catch (error) {
		console.log('Error while draftEnquiry ' + error);
	}
};

const loopThroughEnquiryDetails = async (enquiryArray, user_id, prisma) => {
	for await (const item of enquiryArray) {
		let enquiry_detail_id = item.id;
		let product_id = item.product_id === null ? null : item.product_id;
		let stock_id =
			item.stock_id === null || item.stock_id === undefined
				? null
				: item.stock_id;
		let give_quantity = item.give_quantity;
		let processed = item.processed;
		let status = 'D';

		let result = await EnquiryDetailRepo.UpdateEnquiryDetail(
			enquiry_detail_id,
			product_id,
			stock_id,
			give_quantity,
			processed,
			status,
			user_id,
			prisma
		);
	}
};

const moveToSale = async (requestBody, center_id, user_id) => {
	let enqArrays = requestBody.enquiries;
	let enquiry_id = enqArrays[0].enquiry_id;

	try {
		// (1) Updates inv_seq in tbl financial_year, then {returns} formatted sequence {YY/MM/inv_seq}
		const status = await prisma.$transaction(async (prisma) => {
			let result = await processEnquiries(
				enqArrays,
				center_id,
				user_id,
				prisma
			);

			let result1 = await finalEnquiryStatusUpdate(
				enquiry_id,
				user_id,
				prisma
			);

			return {
				result: 'success',
			};
		});
		return status;
	} catch (error) {
		console.log('Error while moveToSale ' + error);
	}
};

const processEnquiries = async (enqArrays, center_id, user_id, prisma) => {
	for await (const item of enqArrays) {
		const customer_id = item.customer_id;
		const product_id = item.product_id === '' ? null : item.product_id;
		const stock_id = item.stock_id === '' ? null : item.stock_id;
		const give_quantity = item.give_quantity;
		const ask_quantity = item.ask_quantity;
		const processed = item.processed;
		const enquiry_detail_id = item.id;

		if (product_id === '' || product_id === null) {
			// status b - full back order
			// update enq_det_tbl status as B , give_quantity = 0
			let result1 = await EnquiryDetailRepo.UpdateEnquiryDetail(
				enquiry_detail_id,
				product_id,
				stock_id,
				'0',
				processed,
				'B',
				user_id,
				prisma
			);

			let backOrderObject = {
				customer_id,
				enquiry_detail_id,
				ask_quantity,
				reason: 'Product Code Not found',
				status: 'O',
			};

			// insert back order tbl with reason product code not found
			let result2 = await BackOrderRepo.addBackOrder(
				backOrderObject,
				center_id,
				user_id,
				prisma
			);
		} else if (ask_quantity > give_quantity && give_quantity === 0) {
			// item code is present but given qty is 0, so effectively this goes in to back order straight
			const b_qty = ask_quantity - give_quantity;

			// let result = await updateEnquiryDetail(objValue.product_id,
			// 	objValue.stockid, '0', objValue.processed, 'B', objValue.id, userid, res);

			let result3 = await EnquiryDetailRepo.UpdateEnquiryDetail(
				enquiry_detail_id,
				product_id,
				stock_id,
				'0',
				processed,
				'B',
				user_id,
				prisma
			);

			let backOrderObject = {
				customer_id,
				enquiry_detail_id,
				ask_quantity,
				reason: 'Zero Quantity Alloted',
				status: 'O',
			};

			let result4 = await BackOrderRepo.addBackOrder(
				backOrderObject,
				center_id,
				user_id,
				prisma
			);
		} else if (ask_quantity > give_quantity && give_quantity !== 0) {
			// p - partial fulfillment, customer asks 100 Nos, given 50 Nos
			// update enq_det_tbl status as P (Partial), give qty = actual given
			// insert back order tbl with reason Partial full fulfillment

			const b_qty = ask_quantity - give_quantity;

			let result4 = await EnquiryDetailRepo.UpdateEnquiryDetail(
				enquiry_detail_id,
				product_id,
				stock_id,
				give_quantity,
				processed,
				'P',
				user_id,
				prisma
			);

			let backOrderObject = {
				customer_id,
				enquiry_detail_id,
				b_qty,
				reason: 'Partial fulfillment',
				status: 'O',
			};

			let result5 = await BackOrderRepo.addBackOrder(
				backOrderObject,
				center_id,
				user_id,
				prisma
			);
		} else if (
			give_quantity >= ask_quantity &&
			product_id !== '' &&
			product_id !== null
		) {
			// F- fulfilled
			// update enq_det_tbl status as F, give qty = actual given

			let result4 = await EnquiryDetailRepo.UpdateEnquiryDetail(
				enquiry_detail_id,
				product_id,
				stock_id,
				give_quantity,
				processed,
				'F',
				user_id,
				prisma
			);
		}
	}
};

const finalEnquiryStatusUpdate = async (enquiry_id, user_id, prisma) => {
	let rows = await getSuccessfullyProcessedItems(enquiry_id, prisma);

	let final_result = '';

	if (rows === 0) {
		// E - executed means will not appear in open enquiry page
		final_result = await updateEnquiry('E', enquiry_id, user_id);
	} else {
		// P - processed, ready for sale in open enquiry page
		final_result = await updateEnquiry('P', enquiry_id, user_id);
	}

	return final_result;
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

	const prodArr = enquiry['product_arr'];

	var today = new Date();
	let count = 0;

	try {
		// (1) Updates inv_seq in tbl financial_year, then {returns} formatted sequence {YY/MM/inv_seq}
		const status = await prisma.$transaction(async (prisma) => {
			let result1 = await EnquiryRepo.AddEnquiry(
				enquiry.customer_ctrl.id,
				enquiry.remarks,
				center_id,
				user_id,
				prisma
			);

			let result2 = await addEnquiryDetailTxn(
				result1.id,
				prodArr,
				center_id,
				user_id,
				prisma
			);

			return {
				result: 'success',
			};
		});
		return status;
	} catch (error) {
		console.log('Error while inserting Sale ' + error);
	}
};

const addEnquiryDetailTxn = async (
	enquiry_id,
	prodArr,
	center_id,
	user_id,
	prisma
) => {
	for await (const item of prodArr) {
		// if(item.product_code !== '')
		// let product_id = await getProductId(
		// 	item.product_code,
		// 	center_id,
		// 	prisma
		// );

		let result_final = await addEnquiryDetailEach(
			enquiry_id,
			center_id,
			item.product_id !== '' ? item.product_id : null,
			item.quantity,
			item.product_code,
			item.notes,
			'O',
			user_id,
			prisma
		);
	}
};

// const getProductId = async (product_code, center_id, prisma) => {
// 	return await ProductRepo.getProductId(product_code, center_id, prisma);
// };

const addEnquiryDetailEach = async (
	enquiry_id,
	center_id,
	product_id,
	ask_quantity,
	product_code,
	notes,
	status,
	user_id,
	prisma
) => {
	return await EnquiryDetailRepo.AddEnquiryDetail(
		enquiry_id,
		center_id,
		product_id,
		ask_quantity,
		product_code,
		notes,
		status,
		user_id,
		prisma
	);
};

const addMoreEnquiryDetails = async (requestBody, center_id, user_id) => {
	let enquiry_id = requestBody.enquiry_id;
	let product_id = requestBody.product_id;
	let ask_quantity = requestBody.ask_quantity;
	let product_code = requestBody.product_code;
	let notes = requestBody.notes;
	let status = requestBody.status;

	var today = new Date();

	today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let data = await addEnquiryDetailEach(
		enquiry_id,
		center_id,
		product_id,
		ask_quantity,
		product_code,
		notes,
		'O',
		user_id,
		prisma
	);

	// let query = `INSERT INTO enquiry_detail ( enquiry_id, product_id, ask_quantity, product_code, notes, status)
	// 						values ( '${jsonObj.enquiry_id}',
	// 						(select id from product where product_code='${jsonObj.product_code}'
	// 						and center_id = '${jsonObj.center_id}'),
	// 						'${jsonObj.ask_quantity}', '${jsonObj.product_code}', '${jsonObj.notes}', 'O')`;

	// // insertId
	// let data = await promisifyQuery(query);
	// console.log('dinesh ' + JSON.stringify(data));
	return data;
};

// enquiry_id,
// center_id,
// product_id,
// ask_quantity,
// product_code,
// notes,
// status,
// user_id,
// prisma

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

	return await promisifyQuery(query);
};

const getEnquiryDetails = async (enq_id) => {
	let enquiryDetails = await fetchEnquiryDetailByEnqId(enq_id);
	let customerDetails = await fetchCustomerDetailsByEnqId(enq_id);

	return {
		enquiryDetails: enquiryDetails,
		customerDetails: customerDetails,
	};
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

	return await promisifyQuery(query);
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

	return await promisifyQuery(query);
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
	let query = ` 
	SELECT c.name as customer_name, p.product_code as product_code, p.id as product_id,
		p.product_description as description, ed.notes, ed.ask_quantity, ed.give_quantity, b.reason, b.order_date, s.available_stock
		FROM 
		back_order b, 
		enquiry_detail ed,
		product p,
		stock s, customer c
		WHERE 
		s.product_id = p.id and c.id = b.customer_id and
		b.enquiry_detail_id = ed.id and
		p.id = ed.product_id and
		b.center_id = '${center_id}' and
	order_date BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW()
		union all
		SELECT c.name as customer_name, "N/A" as product_code, "N/A" as product_id, "N/A" as description, ed.notes, ed.ask_quantity, ed.give_quantity, b.reason, 
		b.order_date, "N/A" as available_stock FROM 
		back_order b, customer c,
		enquiry_detail ed
		WHERE 
		b.enquiry_detail_id = ed.id and
		c.id = b.customer_id and
		ed.product_id is null and
		b.center_id = '${center_id}' and
		order_date BETWEEN DATE_SUB(NOW(), INTERVAL 30 DAY) AND NOW();
	`;

	return await promisifyQuery(query);
};

const searchEnquiries = async (requestBody, center_id) => {
	let status = requestBody.status;
	let customer_id = requestBody.customer_id;
	let from_date = requestBody.from_date;
	let to_date = requestBody.to_date;
	let order = requestBody.order;

	let offset = requestBody.offset;
	let length = requestBody.length;

	if (from_date !== '') {
		from_date =
			toTimeZoneFormat(requestBody.from_date, 'YYYY-MM-DD') + ' 00:00:00';
	}

	if (to_date !== '') {
		to_date =
			toTimeZoneFormat(requestBody.to_date, 'YYYY-MM-DD') + ' 23:59:59';
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
	enquiry_date between
	'${from_date}' and
	'${to_date}'  `;

	if (customer_id !== 'all') {
		query = query + customer_sql;
	}

	if (status !== 'all') {
		query = query + ` and e.e_status =  '${status}' `;
	}

	query = query + `order by enquiry_date ${order} limit ${offset}, ${length}`;

	let result1 = await promisifyQuery(query);

	let result2 = await searchEnquiriesCountStar(requestBody, center_id);

	return { full_count: result2[0].full_count, result: result1 };
};

const searchEnquiriesCountStar = async (requestBody, center_id) => {
	let status = requestBody.status;
	let customer_id = requestBody.customer_id;
	let from_date = requestBody.from_date;
	let to_date = requestBody.to_date;

	if (from_date !== '') {
		from_date = toTimeZoneFormat(requestBody.from_date, 'YYYY-MM-DD');
	}

	if (to_date !== '') {
		to_date = toTimeZoneFormat(requestBody.to_date, 'YYYY-MM-DD');
	}

	let customer_sql = `and e.customer_id = '${customer_id}' `;

	let query = `select count(*) as full_count
	from
	enquiry e,
	customer c
	where
	c.id = e.customer_id and

	e.center_id =  '${center_id}' and
	enquiry_date between
	'${from_date}' and
	'${to_date}'  `;

	if (customer_id !== 'all') {
		query = query + customer_sql;
	}

	if (status !== 'all') {
		query = query + ` and e.e_status =  '${status}' `;
	}

	return await promisifyQuery(query);
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
	// insertEnquiryDetails,
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

// id:2293
// invoice_no:null
// mrp:490
// notes:'Kit- Valve Guide With Stem Seal (Rb22)'
// packet_size:1
// processed:'YS'
// product_code:'P000214'
// product_desc:'Kit- Valve Guide With Stem Seal (Rb22)'
// product_id:65616
// qty:1
// rack:null
// status:'P'
// stock_id:null
// unit_price:279.06
// __proto__:Object
