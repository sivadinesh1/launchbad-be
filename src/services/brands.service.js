var pool = require('../config/db');

const { toTimeZone, currentTimeInTimeZone, promisifyQuery } = require('../utils/utils');

const insertBrand = async (insertValues) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `  INSERT INTO brand (center_id, name, createdon, isactive ) VALUES (?, ?, '${today}', 'A')`;

	let values = [insertValues.center_id, insertValues.name];

	return promisifyQuery(query);
};

const updateBrand = async (updateValues, id) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = ` 	update brand set center_id = '${updateValues.center_id}',
	name = '${updateValues.name}' where 
	id = '${id}'
	`;

	return promisifyQuery(query);
};

const getAllBrands = async (center_id, status) => {
	let query = `select * from brand b
	          where 
	          b.center_id = '${center_id}' and isactive = '${status}' order by b.name`;

	return promisifyQuery(query);
};

const getBrandsMissingDiscountsByCustomer = async (center_id, status, customer_id) => {
	let query = `select b.id, b.name from brand b where b.center_id = '${center_id}' and b.id not in 
						(select distinct d.brand_id 
						from 
						discount d
						where 
						b.center_id = '${center_id}' and isactive = '${status}' and
						d.customer_id = '${customer_id}'
						) order by b.name`;

	return promisifyQuery(query);
};

// fetch rows from customer tbl & customer shipping addres tbl
const getSearchBrands = async (centerid, searchstr) => {
	let query = `
	select b.*
	from
	brand b
	where 
	b.center_id = '${centerid}' and 
	( LOWER(b.name) like LOWER('%${searchstr}%')) 
	limit 50  `;

	return promisifyQuery(query);
};

const deleteBrand = async (id) => {
	let query = `update brand set isactive = 'D' where id = '${id}' `;
	return promisifyQuery(query);
};

module.exports = {
	insertBrand,
	updateBrand,
	getAllBrands,
	getSearchBrands,
	getBrandsMissingDiscountsByCustomer,
	deleteBrand,
};
