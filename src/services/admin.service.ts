import prisma from '../config/prisma';
var pool = require('../config/db');

const { encryptPassword, currentTimeInTimeZone, promisifyQuery, bigIntToString } = require('../utils/utils');

const { insertUser, insertUserRole, checkUserExist } = require('../services/user.service');

export const getProductsCount = async (center_id: any) => {
	const result = await prisma.product.count({
		where: {
			center_id: Number(center_id),
		},
	});

	return result;
};

//:New
// const getProductInfo = async (center_id: any, product_id: any) => {
// 	let query = `
// 		select p.*, b.name as brand_name, b.id as brand_id
// 		from
// 		product p,
// 		brand b
// 		where
// 		p.brand_id = b.id and
// 		p.id = '${product_id}' and
// 		p.center_id = '${center_id}' `;

// 	return new Promise((resolve, reject) => {
// 		pool.query(query, (err: any, data: any) => {
// 			if (err) {
// 				return reject(err);
// 			}
// 			resolve(data);
// 		});
// 	});
// };

export const getProductInfo = async (center_id: any, product_id: any) => {
	const result = await prisma.product.findMany({
		where: {
			id: Number(product_id),
			center_id: Number(center_id),
		},
		include: {
			brand: true,
		},
	});
	return bigIntToString(result);
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
	let addBank = await insertBank(insertValues);
	if (insertValues.isdefault) {
		let response = await updateCenterBankInfo(insertValues);
	}
	return 'success';
};

const insertBank = async (insertValues: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');
	const result = await prisma.center_banks.create({
		data: {
			center_id: Number(insertValues.center_id),
			bankname: insertValues.bankname,
			accountname: insertValues.accountname,
			accountno: insertValues.accountno,
			ifsccode: insertValues.ifsccode,
			branch: insertValues.branchdetails,
			isdefault: insertValues.isdefault === true ? 'Y' : 'N',
			createddate: new Date(today),
			createdby: insertValues.createdby,
		},
	});
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

export const updateBkInfo = async (updateValues: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');
	let id = updateValues.id;

	let bankname = updateValues.bankname;
	let accountname = updateValues.accountname;
	let accountno = updateValues.accountno;
	let ifsccode = updateValues.ifsccode;
	let branch = updateValues.branchdetails;
	let isdefault = updateValues.isdefault === true ? 'Y' : 'N';
	let updatedby = updateValues.updatedby;
	let updateddate = new Date(today);

	const result = await prisma.center_banks.update({
		where: {
			id: Number(id),
		},
		data: {
			bankname: bankname,
			accountname: accountname,
			accountno: accountno,
			ifsccode: ifsccode,
			branch: branch,
			isdefault: isdefault,
			updatedby: updatedby,
			updateddate: updateddate,
		},
	});

	return bigIntToString(result);
};

export const updateCenterBankInfo = async (updateValues: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');
	let id = updateValues.center_id;
	let bankname = `${updateValues.bankname}, IFSC: ${updateValues.ifsccode}`;
	let accountname = updateValues.accountname;
	let accountno = updateValues.accountno;
	let ifsccode = updateValues.ifsc;
	let branch = updateValues.branchdetails;

	const result = await prisma.center.update({
		where: {
			id: Number(id),
		},
		data: {
			bankname: bankname,
			accountname: accountname,
			accountno: accountno,
			ifsccode: ifsccode,
			branch: branch,
		},
	});

	return bigIntToString(result);
};

export const updateBankDefaults = async (updateValues: any) => {
	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');
	let center_id = updateValues.center_id;
	let status = updateValues.status;

	const result = await prisma.center_banks.updateMany({
		where: {
			center_id: Number(center_id),
		},
		data: {
			isdefault: 'N',
		},
	});

	return bigIntToString(result);
};

module.exports = {
	insertUser,

	insertUserRole,

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
