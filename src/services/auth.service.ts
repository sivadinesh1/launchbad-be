const bcrypt = require('bcrypt');
import prisma from '../config/prisma';

const { promisifyQuery, bigIntToString } = require('../utils/utils');

export const getPermissions = async (center_id: any, role_id: any) => {
	const result = await prisma.permissions.findMany({
		where: {
			center_id: Number(center_id),
			role_id: Number(role_id),
		},
	});
	return bigIntToString(result);
};

export const checkUsernameExists = async (username: any, center_id: any) => {
	const result = await prisma.users.findMany({
		where: {
			username: username,
		},
		select: {
			id: true,
			centerid: true,
			username: true,
			userpass: true,

			user_role: {
				include: {
					role: true, // Include role categories
				},
			},
			center: {
				include: {
					company: true,
					subscriptions: {
						where: {
							AND: [{ is_active: 'Y' }],
						},
						include: {
							plans: true,
						},
					},
				},
			},
		},
	});

	return bigIntToString(result[0]);
};

export const updateCenterForSuperAdmin = (center_id: any) => {
	let query = `  update users set centerid = ${center_id} where username = 9999999990 `;

	return promisifyQuery(query);
};

export const login = async (requestBody: any) => {
	const [username, password] = Object.values(requestBody);
	let { centerid: center_id, userpass, ...user } = await checkUsernameExists(username, '');

	console.log('user', JSON.stringify(user));

	if (user !== null && user.length === 0) {
		return { result: 'USER_NOT_FOUND' };
	}

	if (await bcrypt.compare(password, userpass)) {
		return { result: 'success', role: user.user_role[0].role.name, role_id: user.user_role[0].role_id, center_id, username };
	} else {
		return { result: 'INVALID_CREDENTIALS' };
	}

	return await passwordMatch(password, user);
};

// /**
//  * Login with username and password
//  * @param {string} email
//  * @param {string} password
//  * @returns {Promise<User>}
//  */
// const loginUserWithEmailAndPassword = async (email, password) => {
//   const user = await userService.getUserByEmail(email);
//   if (!user || !(await user.isPasswordMatch(password))) {
//     throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
//   }
//   return user;
// };

const passwordMatch = async (receivedpassword: any, user: any) => {
	if (await bcrypt.compare(receivedpassword, user[0].userpass)) {
		return {
			result: 'success',
			role: user[0].role,
			userid: user[0].userid,
			obj: user[0],
		};
	} else {
		return { result: 'INVALID_CREDENTIALS' };
	}
};

module.exports = {
	getPermissions,
	checkUsernameExists,
	updateCenterForSuperAdmin,
	login,
};

// const data = await prisma.profile.findMany({
//   select: {
//     id: true,
//     name: true,
//     configuration_country: 'country' // work like an 'as'
//  }
// })

// const { column_name: alias_name } = await prisma.test.findMany();
