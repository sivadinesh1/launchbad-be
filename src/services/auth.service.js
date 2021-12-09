const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');

const JWT = require('jsonwebtoken');

const { promisifyQuery, bigIntToString } = require('../utils/utils');

const getPermissions = async (center_id, role_id) => {
	const result = await prisma.permissions.findMany({
		where: {
			center_id: Number(center_id),
			role_id: Number(role_id),
		},
	});
	return bigIntToString(result);
};

const checkUsernameExists = async (username, center_id) => {
	console.log('username : ' + username);
	let result;
	try {
		result = await prisma.users.findMany({
			where: {
				username: username,
			},
			select: {
				id: true,
				center_id: true,
				username: true,
				userpass: true,
				firstname: true,

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

		if (result.length > 0) {
			return bigIntToString(result[0]);
		} else {
			return 'false';
		}
	} catch (error) {
		console.log(error);
	}
};

const updateCenterForSuperAdmin = (center_id) => {
	let query = `  update users set center_id = ${center_id} where username = 9999999990 `;

	return promisifyQuery(query);
};

const login = async (requestBody) => {
	const [username, password] = Object.values(requestBody);
	let {
		center_id: center_id,
		userpass,
		id,
		...user
	} = await checkUsernameExists(username, '');

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
			first_name: user.firstname,
			id,
			center_name: user?.center.name,
			center_district: user?.center.district,
			code: user?.center?.state.code,
			timezone: user?.center?.timezone,
		};
	} else {
		return { result: 'INVALID_CREDENTIALS' };
	}
};

const generateToken = (id, center_id, role, timezone) => {
	return new Promise((resolve, reject) => {
		const payload = { id, center_id, role, timezone };
		const secret = process.env.ACCESS_TOKEN_SECRET;
		const options = { expiresIn: '1d' };

		JWT.sign(payload, secret, options, (err, token) => {
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

module.exports = {
	login,
	generateToken,
	updateCenterForSuperAdmin,
	checkUsernameExists,
	getPermissions,
};
