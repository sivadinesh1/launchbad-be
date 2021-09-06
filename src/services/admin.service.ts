import prisma from '../config/prisma';
var pool = require('../config/db');

const { encryptPassword, currentTimeInTimeZone, promisifyQuery, bigIntToString } = require('../utils/utils');

const { insertUser, insertUserRole, checkUserExist } = require('../services/user.service');

//:New
const getProductsCount = async (center_id: any) => {
	let query = `select count(*) as count from product p where 
		p.center_id = '${center_id}' `;

	return new Promise((resolve, reject) => {
		pool.query(query, (err: any, data: any) => {
			if (err) {
				return reject(err);
			}
			resolve(data[0]);
		});
	});
};

//:New
const getProductInfo = async (center_id: any, product_id: any) => {
	let query = `
		select p.*, b.name as brand_name, b.id as brand_id  
		from 
		product p,
		brand b 
		where
		p.brand_id = b.id and
		p.id = '${product_id}' and
		p.center_id = '${center_id}' `;

	return new Promise((resolve, reject) => {
		pool.query(query, (err: any, data: any) => {
			if (err) {
				return reject(err);
			}
			resolve(data);
		});
	});
};

export const getStates = async () => {
	const result = await prisma.state.findMany({
		orderBy: {
			description: 'asc',
		},
	});
	return bigIntToString(result);
};

export const getTimezones = async () => {
	const result = await prisma.timezones.findMany({
		orderBy: {
			description: 'asc',
		},
	});
	return bigIntToString(result);
};

const addUser = async (jsonObj: any) => {
	const user = await checkUserExist(jsonObj);
	if (user !== null) {
		return { message: 'DUP_USERNAME' };
	} else {
		let id = await insertUser(jsonObj);

		if (id !== null || id !== '' || id !== undefined) {
			let userrole = await insertUserRole({
				user_id: id,
				role_id: jsonObj.role_id,
			});

			return { message: 'User Inserted' };
		}
	}
};

const getUsers = (center_id: any, status: any) => {
	let query = `
  select u.*, r.id as role_id, r.name as role, r.description as description from 
users u,
role r,
user_role ur
where
u.id = ur.user_id and
ur.role_id = r.id and
u.centerid = '${center_id}' and status = '${status}'
  `;

	return new Promise(function (resolve, reject) {
		pool.query(query, function (err: any, data: any) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};

const getOutstandingBalance = (center_id: any, limit: any) => {
	let query = ` 
	select c.*,
	count(s.id) as inv_count
	 from 
	customer as c,
	sale as s
	where 
	c.id = s.customer_id and
	c.center_id = '${center_id}'
		and c.balance_amt != 0 
		group by c.id
		order by c.balance_amt desc 	 `;

	if (limit !== 0) {
		query = query + ` limit ${limit}`;
	}

	return new Promise(function (resolve, reject) {
		pool.query(query, function (err: any, data: any) {
			if (err) {
				reject(err);
			}
			resolve(data);
		});
	});
};

const updateLogo = (center_id: any, logo_name: any, logo_url: any, position: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = '';

	if (position === 'main') {
		query = ` update center set logo_name = '${logo_name}', logo_url = '${logo_url}' 
		where id = ${center_id} `;
	} else if (position === 'side') {
		query = ` update center set side_logo_name = '${logo_name}', side_logo_url = '${logo_url}' 
		where id = ${center_id} `;
	}

	return new Promise(function (resolve, reject) {
		pool.query(query, function (err: any, data: any) {
			if (err) {
				reject(err);
			}

			resolve('success');
		});
	});
};

const addBank = async (insertValues: any) => {
	insertBank(insertValues);
	if (insertValues.isdefault) {
		let response = await updateCenterBankInfo(insertValues);
		return 'success';
	}
};

const insertBank = async (insertValues: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `  INSERT INTO center_banks(center_id, bankname, accountname, accountno, ifsccode, branch,
		isdefault,
		createddate, createdby)
VALUES
	( '${insertValues.center_id}', '${insertValues.bankname}', '${insertValues.accountname}', 
		'${insertValues.accountno}', '${insertValues.ifsccode}', '${insertValues.branchdetails}', 
		'${insertValues.isdefault === true ? 'Y' : 'N'}',
		'${today}', '${insertValues.createdby}') `;

	const data = promisifyQuery(query);
	return 'success';
};

const updateBank = async (insertValues: any) => {
	if (insertValues.isdefault) {
		let updateDefaults = await updateBankDefaults(insertValues.center_id);
	}

	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	const result = updateBkInfo(insertValues);

	if (insertValues.isdefault) {
		let response = await updateCenterBankInfo(insertValues);
	}

	return 'success';
};
const updateBkInfo = (insertValues: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');
	let query = `  update center_banks set
	bankname = '${insertValues.bankname}',
	accountname = '${insertValues.accountname}',
	accountno = '${insertValues.accountno}',
	ifsccode = '${insertValues.ifsccode}',
	branch = '${insertValues.branchdetails}',
	isdefault = '${insertValues.isdefault === true ? 'Y' : 'N'}',
	updateddate = '${today}',
	updatedby = '${insertValues.updatedby}' 
	where id = '${insertValues.id}'
	`;
	return promisifyQuery(query);
};

const updateCenterBankInfo = (updateValues: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `  update center set  bankname = ?,
	accountname = ?, accountno = ?, ifsccode = ?, branch = ?
	where
	id = ? `;

	let values = [
		`${updateValues.bankname}, IFSC: ${updateValues.ifsccode}`,
		updateValues.accountname,
		updateValues.accountno,
		updateValues.ifsc,
		updateValues.branchdetails,
		updateValues.center_id,
	];

	return promisifyQuery(query, values);
};

const updateBankDefaults = async (center_id: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

	let query = `  update center_banks set
	isdefault = 'N'
	where center_id = '${center_id}'
	`;

	return new Promise(function (resolve, reject) {
		pool.query(query, function (err: any, data: any) {
			if (err) {
				reject(err);
			}
			resolve('success');
		});
	});
};

module.exports = {
	insertUser,

	insertUserRole,
	getUsers,
	getOutstandingBalance,
	checkUserExist,
	updateLogo,
	insertBank,
	updateCenterBankInfo,
	updateBank,
	updateBankDefaults,
	//:New
	getProductsCount,
	getProductInfo,
	getStates,
	getTimezones,
	addUser,
	addBank,
};
