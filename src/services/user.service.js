const { prisma } = require('../config/prisma');

const { currentTimeInTimeZone, promisifyQuery, encryptPassword, bigIntToString } = require('../utils/utils');

const findOne = async (username) => {
	const users = await prisma.users.findUnique({
		where: {
			username: username,
		},
	});
	return bigIntToString(users);
};

const insertUser = async (insertValues) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');

	let hashed_password = await encryptPassword(insertValues.password);

	let center_id = insertValues.center_id;
	let username = insertValues.username;
	let firstname = insertValues.firstname;
	let mobilenumber = insertValues.mobilenumber;

	const result = await prisma.users.create({
		data: {
			center_id: Number(center_id),
			username: username,
			userpass: hashed_password,
			firstname: firstname,
			mobilenumber: mobilenumber,
			createddatetime: new Date(today),
			status: 'A',
		},
	});

	let user_id = result.id;

	return user_id;
};

const insertUserRole = async (insertValues) => {
	let role_id = insertValues.role_id;
	let user_id = insertValues.user_id;

	const result = await prisma.user_role.create({
		data: {
			role_id: Number(role_id),
			user_id: Number(user_id),
		},
	});

	return result;
};

const checkUserExist = async (insertValues) => {
	const users = await prisma.users.findMany({
		where: {
			username: insertValues.username,
		},
		include: {
			user_role: {
				include: {
					role: true, // Include role categories
				},
			},
		},
	});

	const returnValue = bigIntToString(users);
	returnValue[0]['role_name'] = returnValue[0].user_role[0].role.name;
	returnValue[0]['role_desc'] = returnValue[0].user_role[0].role.description;
	returnValue[0]['role'] = returnValue[0].user_role[0].role_id;
	returnValue[0].user_role = '';

	return returnValue[0];
};

const updateUserStatus = async (updateValues) => {
	let today = currentTimeInTimeZone('YYYY-MM-DD HH:mm:ss');
	let id = updateValues.id;
	let status = updateValues.status;

	const result = await prisma.users.update({
		where: {
			id: Number(id),
		},
		data: {
			status: status,
			updateddatetime: new Date(today),
		},
	});

	return bigIntToString(result);
};

const getUsers = async (center_id, status) => {
	const result = await prisma.users.findMany({
		where: {
			center_id: Number(center_id),
			status: status,
		},
		include: {
			user_role: {
				include: {
					role: true, // Include role categories
				},
			},
		},
		orderBy: {
			firstname: 'asc',
		},
	});
	return bigIntToString(result);
};

// const getUsers = (center_id, status) => {
// 	let query = `
//   select u.*, r.id as role_id, r.name as role, r.description as description from
// users u,
// role r,
// user_role ur
// where
// u.id = ur.user_id and
// ur.role_id = r.id and
// u.center_id = '${center_id}' and status = '${status}'
//   `;

// 	return new Promise(function (resolve, reject) {
// 		pool.query(query, function (err, data) {
// 			if (err) {
// 				reject(err);
// 			}
// 			resolve(data);
// 		});
// 	});
// };

module.exports = {
	updateUserStatus,
	getUsers,
};

// const updateUserStatus = (updateValues) => {
// 	let today = currentTimeInTimeZone('Asia/Kolkata', 'YYYY-MM-DD HH:mm:ss');

// 	let query = `  update users set status = ? where id = ? `;

// 	let values = [updateValues.status, updateValues.id];

// 	return new Promise(function (resolve, reject) {
// 		pool.query(query, values, function (err, data) {
// 			if (err) {
// 				reject(err);
// 			}

// 			resolve(data);
// 		});
// 	});
// };
