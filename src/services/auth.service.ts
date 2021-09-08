const bcrypt = require('bcrypt');
import prisma from '../config/prisma';

const { promisifyQuery, bigIntToString } = require('../utils/utils');

export const getPermissions = async (center_id: any, role_id: any) => {
	const result = await prisma.permissions.findMany({
		where: {
			center_id: center_id,
			role_id: role_id,
		},
	});
	return bigIntToString(result);
};

const checkUsernameExists = async (username: any) => {
	let query = `
  select u.id as userid, u.username, u.userpass as userpass, u.firstname, r.name as role, r.id as role_id, c.id as center_id, c.name as center_name, cm.id as company_id,
	cm.name as company_name, s.code, p.name as plan_name
	from
	users u,
	user_role ur,
	role r,
	center c,
	state s,
	company cm,
	plans p,
	subscriptions subs
	where
	subs.plan_id = p.id and
	subs.center_id = u.centerid and
	subs.is_active = 'Y' and

	s.id = c.state_id and
	u.id = ur.user_id and
	ur.role_id = r.id and
	u.centerid = c.id and
	cm.id = c.company_id and
	username='${username}'
	 `;

	return promisifyQuery(query);
};

const updateCenterForSuperAdmin = (center_id: any) => {
	let query = `  update users set centerid = ${center_id} where username = 9999999990 `;

	return promisifyQuery(query);
};

const login = async (requestBody: any) => {
	const [username, password] = Object.values(requestBody);
	let user = await checkUsernameExists(username);

	if (user !== null && user.length === 0) {
		return { result: 'USER_NOT_FOUND' };
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
