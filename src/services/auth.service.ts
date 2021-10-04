const bcrypt = require('bcrypt');
import prisma from '../config/prisma';

const JWT = require('jsonwebtoken');
import cookie from 'cookie';

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
			center_id: true,
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
					state: true,
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
	let query = `  update users set center_id = ${center_id} where username = 9999999990 `;

	return promisifyQuery(query);
};

export const login = async (requestBody: any) => {
	const [username, password] = Object.values(requestBody);
	let { center_id: center_id, userpass, id, ...user } = await checkUsernameExists(username, '');

	console.log('user >> ', JSON.stringify(user));

	console.log('user >> ', user.center.name);

	if (user !== null && user.length === 0) {
		return { result: 'USER_NOT_FOUND' };
	}

	if (await bcrypt.compare(password, userpass)) {
		return {
			result: 'success',
			role: user.user_role[0].role.name,
			role_id: user.user_role[0].role_id,
			center_id,
			username,
			id,
			center_name: user?.center.name,
			center_district: user?.center.district,
			code: user?.center?.state.code,
		};
	} else {
		return { result: 'INVALID_CREDENTIALS' };
	}
};

export const generateToken = (id: any, center_id: any, role: any) => {
	return new Promise((resolve, reject) => {
		const payload = { id, center_id, role };
		const secret = process.env.ACCESS_TOKEN_SECRET;
		const options = { expiresIn: '1d' };

		JWT.sign(payload, secret, options, (err: any, token: any) => {
			if (err) return reject(err);
			resolve(token);
		});
	});
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
