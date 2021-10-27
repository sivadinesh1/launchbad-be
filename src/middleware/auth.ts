const { setTimezone } = require('../utils/utils.ts');

const JWT = require('jsonwebtoken');
const cookie = require('cookie');

const auth =
	(...requiredRights: any) =>
	async (req: any, res: any, next: any) => {
		let cCookie = cookie.parse(req ? req.headers.cookie || '' : document.cookie);

		try {
			let user = JWT.verify(cCookie['authToken'], process.env.ACCESS_TOKEN_SECRET);
			req.user = user;
			setTimezone(user.timezone);

			next();
		} catch (error) {
			// throw new Error('Authorization Failed');
			return res.status(401).send('Authorization Failed');
		}
	};

export const parseCookies = async (req: any) => {
	let cCookie = cookie.parse(req ? req.headers.cookie || '' : document.cookie);

	try {
		let user = JWT.verify(cCookie['authToken'], process.env.ACCESS_TOKEN_SECRET);
		req.user = user;
	} catch (err) {
		console.log('ccook:: error' + JSON.stringify(err));
	}
};

module.exports = {
	parseCookies,
	auth,
};
