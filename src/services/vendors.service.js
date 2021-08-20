var pool = require('../config/db');

const { toTimeZone, currentTimeInTimeZone } = require('../utils/utils');

const insertVendor = async (insertValues) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `
		INSERT INTO vendor (center_id, name, address1, address2, address3, district, state_id, pin, 
		gst, phone, mobile, mobile2, whatsapp, email, createdon, isactive)
		VALUES
			(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '${today}', 'A'
			) `;

	let values = [
		insertValues.center_id,
		insertValues.name,
		insertValues.address1,
		insertValues.address2,
		insertValues.address3,
		insertValues.district,
		insertValues.state_id,
		insertValues.pin,
		insertValues.gst,
		insertValues.phone,
		insertValues.mobile,
		insertValues.mobile2,
		insertValues.whatsapp,
		insertValues.email,
	];

	return new Promise((resolve, reject) => {
		pool.query(query, values, (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(data);
		});
	});
};

const updateVendor = async (updateValues, id) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `
	update vendor set center_id = '${updateValues.center_id}',
	name = '${updateValues.name}', address1 = '${updateValues.address1}',address2 = '${updateValues.address2}', address3 = '${updateValues.address3}',
	district = '${updateValues.district}', state_id = '${updateValues.state_id}', pin = '${updateValues.pin}',gst = '${updateValues.gst}',
	phone = '${updateValues.phone}', mobile = '${updateValues.mobile}', mobile2 = '${updateValues.mobile2}', whatsapp = '${updateValues.whatsapp}',
	email = '${updateValues.email}'
	where
	id = '${id}'
	`;

	return new Promise((resolve, reject) => {
		pool.query(query, (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(data);
		});
	});
};

// fetch rows from customer tbl & customer shipping addres tbl
const getSearchVendors = (centerid, searchstr, callback) => {
	let query = `
	select v.id, v.center_id, v.name, v.address1, v.address2, v.district, 
	v.pin, v.gst, v.phone, v.mobile, v.mobile2, v.whatsapp,  v.email, v.isactive, s.code as code
	from
	vendor v,
	state s
	where 
	v.state_id = s.id and isactive = 'A' and center_id = '${centerid}' and 
	( LOWER(v.name) like LOWER('%${searchstr}%')) 
	limit 50  `;

	let values = [centerid, searchstr];

	pool.query(query, values, function (err, data) {
		if (err) return callback(err);
		return callback(null, data);
	});
};

const getVendorDetails = async (center_id, vendor_id) => {
	let query = `select v.*, s.code as code,
	 s.description as state 
	from vendor v, 
	state s where 
	s.id = v.state_id and
	v.id = '${vendor_id}' and
	v.center_id = '${center_id}' order by v.name`;

	return new Promise((resolve, reject) => {
		pool.query(query, (err, data) => {
			if (err) {
				return reject(err);
			}
			resolve(data);
		});
	});
};

module.exports = {
	insertVendor,
	updateVendor,
	getSearchVendors,

	getVendorDetails,
};
