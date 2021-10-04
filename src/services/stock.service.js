var pool = require('../config/db');

const { toTimeZone, toTimeZoneFormat, currentTimeInTimeZone, promisifyQuery } = require('../utils/utils');

const { handleError, ErrorHandler } = require('../config/error');

const insertItemHistoryTable = async (
	center_id,
	module,
	product_id,
	purchase_id,
	purchase_det_id,
	sale_id,
	sale_det_id,
	actn,
	actn_type,
	txn_qty,
	sale_return_id,
	sale_return_det_id,
	purchase_return_id,
	purchase_return_det_id,
) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'DD-MM-YYYY HH:mm:ss');

	let query = `
insert into item_history (center_id, module, product_ref_id, purchase_id, purchase_det_id, sale_id, sale_det_id, actn, actn_type, txn_qty, stock_level, txn_date, sale_return_id, sale_return_det_id, purchase_return_id, purchase_return_det_id)
values ('${center_id}', '${module}', '${product_id}', '${purchase_id}', '${purchase_det_id}',
'${sale_id}', '${sale_det_id}',
'${actn}', '${actn_type}', '${txn_qty}', `;

	// if (module !== 'Product') {
	query = query + `	(select IFNULL(sum(available_stock), 0) as available_stock  from stock where product_id = '${product_id}'  ), `;
	// }

	query =
		query +
		`	
			 '${today}', '${sale_return_id}', '${sale_return_det_id}', '${purchase_return_id}', '${purchase_return_det_id}' ) `;

	return promisifyQuery(query);
};

const updateStock = (qty_to_update, product_id, mrp, mode) => {
	let query =
		mode === 'add'
			? `update stock set available_stock =  available_stock + '${qty_to_update}' where product_id = '${product_id}' and mrp = '${mrp}' `
			: `update stock set available_stock =  available_stock - '${qty_to_update}' where product_id = '${product_id}' and mrp = '${mrp}' `;

	return promisifyQuery(query);
};

// dinesh check
// multiply by * -1 so that qty_to_update is minus, query works as expected
const updateStockViaId = async (qty_to_update, product_id, stock_id, mode) => {
	let query =
		mode === 'add'
			? `update stock set available_stock =  available_stock + '${qty_to_update}' where product_id = '${product_id}' and id = '${stock_id}' `
			: `update stock set available_stock =  available_stock - '${qty_to_update}' where product_id = '${product_id}' and id = '${stock_id}' `;

	return await promisifyQuery(query);
};

const isStockIdExist = async (k) => {
	todayYYMMDD = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD');
	let query = `
	select count(*) as count from stock where product_id = '${k.product_id}' and mrp  = '${k.mrp}' `;

	let data = promisifyQuery(query);
	return data[0].count;
};

const insertToStock = async (product_id, mrp, available_stock, open_stock) => {
	let upDate = new Date();
	todayYYMMDD = toTimeZoneFormat(upDate, 'Asia/Kolkata', 'YYYY-MM-DD');

	let query = `
	insert into stock (product_id, mrp, available_stock, open_stock, updateddate)
	values ('${product_id}', '${mrp}', '${available_stock}', '${open_stock}' , '${todayYYMMDD}')`;

	return promisifyQuery(query);
};

const correctStock = async (product_id, mrp, stock_qty) => {
	let query = `update stock set available_stock =  '${stock_qty}' where product_id = '${product_id}' and mrp = '${mrp}' `;

	let data = promisifyQuery(query);
	return 'updated';
};

const getProductWithAllMRP = (product_id) => {
	todayYYMMDD = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD');
	let sql = ` select 
	s.id as stock_id, 
	s.product_id as product_id,
	p.description as product_description,
	s.mrp, 
	s.available_stock, 
	s.open_stock 
	from 
	stock s,
	product p
	where
	p.id = s.product_id and
	s.product_id = '${product_id}'
	 `;

	return promisifyQuery(query);
};

const deleteProductFromStock = async (product_id, mrp) => {
	todayYYMMDD = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD');

	let query = `delete from stock where product_id = ${product_id} and mrp = ${mrp}`;

	let data = promisifyQuery(query);

	let historyAddRes = await insertItemHistoryTable(
		center_id,
		'Product',
		product_id,
		'0',
		'0',
		'0',
		'0',
		'PRD',
		`Deleted MRP - ${mrp}`,
		'0',
		'0', // sale_return_id
		'0', // sale_return_det_id
		'0', // purchase_return_id
		'0', // purchase_return_det_id
	);

	let update = await updateLatestProductMRP(product_id, center_id);

	return {
		result: data,
	};
};

const updateLatestProductMRP = async (product_id, center_id) => {
	let query = `
	update product set 
mrp = (select max(mrp) from stock where
product_id = '${product_id}')
where 
id = '${product_id}' and
center_id = '${center_id}'
`;

	return promisifyQuery(query);
};

const searchAllDraftPurchase = async (center_id) => {
	let query = `select p.*, v.id as vendor_id, v.name as vendor_name,
	case p.status
        when 'D' then 'Draft'
        when 'C' then 'Completed'
    end as pstatus
	from
	purchase p,
	vendor v
	where
	v.id = p.vendor_id and
	p.status = 'D' and 
	p.center_id = '${center_id}' `;

	return promisifyQuery(query);
};

// str_to_date(stock_inwards_datetime, '%Y-%m-%d %T') between
// str_to_date('2020-05-01 00:00:00', '%Y-%m-%d %T') and
// str_to_date('2020-05-08 23:59:00', '%Y-%m-%d %T')

const searchPurchase = async (requestBody) => {
	let center_id = requestBody.center_id;
	let status = requestBody.status;
	let vendor_id = requestBody.vendorid;
	let from_date = requestBody.fromdate;
	let to_date = requestBody.todate;
	let order = requestBody.order;

	if (from_date !== '') {
		from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata') + ' 00:00:00';
	}

	if (to_date !== '') {
		to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata') + ' 23:59:00';
	}

	let vendsql = `and p.vendor_id = '${vendor_id}' `;
	let statussql = `and p.status = '${status}' `;

	let sql = `select p.*, v.id as vendor_id, v.name as vendor_name
	from
	purchase p,
	vendor v
	where
	v.id = p.vendor_id and
	
	p.center_id = '${center_id}' and
	str_to_date(received_date,  '%d-%m-%Y %T') between
	str_to_date('${from_date}',  '%d-%m-%Y %T') and
	str_to_date('${to_date}',  '%d-%m-%Y %T') `;

	if (vendor_id !== 'all') {
		sql = sql + vendsql;
	}

	if (status !== 'all') {
		sql = sql + statussql;
	}

	sql = sql + `order by str_to_date(received_date,  '%d-%m-%Y %T') ${order}`;

	return promisifyQuery(query);
};

const searchSales = async (requestBody) => {
	let center_id = requestBody.center_id;
	let status = requestBody.status;
	let customer_id = requestBody.customerid;
	let from_date = requestBody.fromdate;
	let to_date = requestBody.todate;
	let sale_type = requestBody.saletype;
	let search_type = requestBody.searchtype;
	let invoice_no = requestBody.invoiceno;
	let order = requestBody.order;

	let sql = '';
	let query = '';

	if (search_type === 'all') {
		if (from_date !== '') {
			from_date = toTimeZone(requestBody.fromdate, 'Asia/Kolkata') + ' 00:00:00';
		}

		if (to_date !== '') {
			to_date = toTimeZone(requestBody.todate, 'Asia/Kolkata') + ' 23:59:00';
		}

		let custsql = `and s.customer_id = '${customer_id}' `;
		let statussql = `and s.status = '${status}' `;

		sql = `select s.*, c.id as customer_id, c.name as customer_name
        from
        sale s,
        customer c
        where
        c.id = s.customer_id and
        
				s.center_id = '${center_id}' and
				
				str_to_date(invoice_date,  '%d-%m-%Y %T') between
				str_to_date('${from_date}',  '%d-%m-%Y %T') and
				str_to_date('${to_date}',  '%d-%m-%Y %T') `;

		if (customer_id !== 'all') {
			sql = sql + custsql;
		}

		if (status !== 'all') {
			sql = sql + statussql;
		}

		if (sale_type !== 'all') {
			if (sale_type === 'GI') {
				sql = sql + " and s.sale_type = 'gstinvoice' ";
			} else if (sale_type === 'SI') {
				sql = sql + " and s.sale_type = 'stockissue' ";
			}
		}
		// check dinesh
		if (invoice_no.trim().length > 0) {
			sql = sql + `and invoice_no = '${invoice_no.trim()}' `;
		}

		sql = sql + ' order by invoice_no ' + order;
	} else if (search_type !== 'all') {
		query = ` 
		select s.*, c.id as customer_id, c.name as customer_name
					from
					sale s,
					customer c
					where
					c.id = s.customer_id and
					
					s.center_id = '${center_id}' and
					invoice_no = '${invoice_no.trim()}'
					
		`;
	}

	return promisifyQuery(search_type === 'all' ? sql : query);
};

const purchaseMaster = async (purchase_id) => {
	let query = `
	select p.*
from 
purchase p
where
p.id = '${purchase_id}' `;

	return promisifyQuery(query);
};

const deleteSaleDetails = async (id) => {
	let query = `
	delete from sale_detail where id = '${id}' `;

	let data = promisifyQuery(query);
	return {
		result: 'success',
	};
};

const deleteItemHistory = async (sale_id) => {
	let query = `
	delete from item_history where sale_id = '${sale_id}' `;

	let data = promisifyQuery(query);

	return { result: 'success' };
};

const purchaseDetails = async (purchase_id) => {
	let sql = `
	select pd.*, 
pd.id as id, 
pd.purchase_id as purchase_id,
pd.product_id as product_id,
pd.qty as qty,
pd.purchase_price as purchase_price,
pd.mrp as mrp,
pd.batchdate as batchdate,
pd.tax as tax,
pd.igst as igst,
pd.cgst as cgst,
pd.sgst as sgst,
pd.taxable_value as tax_value,
pd.total_value as total_value,
ps.revision as revision,
p.product_code, p.description, p.packetsize, p.taxrate,
s.id as stock_pk, p.hsncode as hsncode from
purchase_detail pd,
product p,
stock s,
purchase ps
where
ps.id = pd.purchase_id and
s.product_id = p.id and
p.id = pd.product_id and
s.id = pd.stock_id and
pd.purchase_id = '${purchase_id}' 
	 `;

	return promisifyQuery(query);
};

const deletePurchaseDetails = async (requestBody) => {
	let center_id = requestBody.center_id;
	let id = requestBody.id;
	let purchase_id = requestBody.purchaseid;
	let qty = requestBody.qty;
	let product_id = requestBody.product_id;
	let stock_id = requestBody.stock_id;
	let mrp = requestBody.mrp;

	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let auditQuery = `
	INSERT INTO audit_tbl (module, module_ref_id, module_ref_det_id, actn, old_value, new_value, audit_date, center_id)
	VALUES
		('Purchase', '${purchase_id}', '${id}', 'delete', 
		(SELECT CONCAT('[{', result, '}]') as final
		FROM (
			SELECT GROUP_CONCAT(CONCAT_WS(',', CONCAT('"purchaseId": ', purchase_id), CONCAT('"productId": "', product_id, '"'), CONCAT('"qty": "', qty, '"')) SEPARATOR '},{') as result
			FROM (
				SELECT purchase_id, product_id, qty
				FROM purchase_detail where id = '${id}'
			) t1
		) t2)
		, '', '${today}', '${center_id}'
		) `;

	// step 1
	let auditPromise = promisifyQuery(auditQuery);

	// step 2

	let query = `
			delete from purchase_detail where id = '${id}' `;

	let deletePromise = promisifyQuery(query);

	//

	// step 3
	let stockUpdatePromise = await updateStockViaId(qty, product_id, stock_id, 'minus');

	// step 4 , reverse item history table entries.

	let itemHistory = await insertItemHistoryTable(
		center_id,
		'Purchase',
		product_id,
		purchase_id,
		id, //purchase_det_id
		'0', // sale_id
		'0', //sale_det_id
		'PUR',
		`Deleted MRP - ${mrp}`,
		qty, //txn_qty
		'0', // sale_return_id
		'0', // sale_return_det_id
		'0', // purchase_return_id
		'0', // purchase_return_det_id
	);

	return {
		result: 'success',
	};
};

const deletePurchaseById = async (purchase_id) => {
	let purchaseDetails = await getPurchaseDetails(purchase_id);

	let idx = 0;

	let retValue = await deletePurchaseDetailsRecs(purchaseDetails, purchase_id);

	if (retValue === 'done') {
		{
			return { result: 'success' };
		}
	}
};

function getPurchaseDetails(purchase_id) {
	let sql = `
	select pd.*, 
pd.id as id, 
pd.purchase_id as purchase_id,
pd.product_id as product_id,
pd.qty as qty,
pd.purchase_price as purchase_price,
pd.mrp as mrp,
pd.batchdate as batchdate,
pd.tax as tax,
pd.igst as igst,
pd.cgst as cgst,
pd.sgst as sgst,
pd.taxable_value as tax_value,
pd.total_value as total_value,
p.product_code, p.description, p.packetsize, p.taxrate from 
purchase_detail pd,
product p
where
p.id = pd.product_id and
pd.purchase_id = '${purchase_id}' 
	 `;

	return promisifyQuery(query);
}

const deletePurchaseDetailsRecs = async (purchaseDetails, purchase_id) => {
	let idx = 0;

	purchaseDetails.forEach(async (element, index) => {
		idx = index + 1;
		let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

		let auditQuery = `
		INSERT INTO audit_tbl (module, module_ref_id, module_ref_det_id, actn, old_value, new_value, audit_date, center_id)
		VALUES
			('Purchase', '${purchase_id}', '${element.id}', 'delete', 
			(SELECT CONCAT('[{', result, '}]') as final
			FROM (
				SELECT GROUP_CONCAT(CONCAT_WS(',', CONCAT('"purchaseId": ', purchase_id), CONCAT('"productId": "', product_id, '"'), CONCAT('"qty": "', qty, '"')) SEPARATOR '},{') as result
				FROM (
					SELECT purchase_id, product_id, qty
					FROM purchase_detail where id = '${element.id}'
				) t1
			) t2)
			, '', '${today}', (select center_id from sale where id = '${sale_id}')
			) `;

		// step 1
		let auditPromise = await promisifyQuery(auditQuery);

		// step 2
		let query = `
				delete from purchase_detail where id = '${element.id}' `;
		let deletePromise = await promisifyQuery(query);

		// step 3
		let stockUpdatePromise = await updateStockViaId(element.qty, element.product_id, element.stock_id, 'minus');
	});

	if (purchaseDetails.length === idx) {
		return new Promise(function (resolve, reject) {
			resolve('done');
		}).catch(() => {
			/* do whatever you want here */
		});
	}
};

const deletePurchaseMasterById = async (purchase_id) => {
	let query = `
		delete from purchase where 
	id = '${purchase_id}' `;

	let data = promisifyQuery(query);
	return { result: 'success' };
};

const stockCorrection = async (requestBody) => {
	let product_id = requestBody.product_id;
	let mrp = requestBody.mrp;
	let stock_qty = requestBody.corrected_stock;
	let center_id = requestBody.center_id;

	let data = await correctStock(product_id, mrp, stock_qty);

	let historyAddRes = await insertItemHistoryTable(
		center_id,
		'Product',
		product_id,
		'0',
		'0',
		'0',
		'0',
		'PRD',
		`Stock Correction: MRP - ${mrp} : Qty - ${stock_qty}`,
		'0',
		'0', // sale_return_id
		'0', // sale_return_det_id
		'0', // purchase_return_id
		'0', // purchase_return_det_id
	);

	return {
		result: data,
	};
};

module.exports = {
	insertItemHistoryTable,
	updateStock,
	updateStockViaId,
	isStockIdExist,
	insertToStock,
	correctStock,
	getProductWithAllMRP,
	deleteProductFromStock,
	updateLatestProductMRP,

	searchAllDraftPurchase,
	searchPurchase,
	searchSales,
	purchaseMaster,
	deleteSaleDetails,
	deleteItemHistory,
	purchaseDetails,
	deletePurchaseDetails,
	deletePurchaseById,
	deletePurchaseMasterById,
	stockCorrection,
};
