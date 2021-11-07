const { setTimezone } = require('../utils/utils.js');

const JWT = require('jsonwebtoken');
const cookie = require('cookie');

const auth =
	(...requiredRights) =>
	async (req, res, next) => {
		let cCookie = cookie.parse(req ? req.headers.cookie || '' : document.cookie);

		try {
			let user = JWT.verify(cCookie['authToken'], process.env.ACCESS_TOKEN_SECRET);
			req.user = user;
			//console.log('user:: ' + JSON.stringify(user));
			setTimezone(user.timezone);

			next();
		} catch (error) {
			// throw new Error('Authorization Failed');
			return res.status(401).send('Authorization Failed');
		}
	};

const parseCookies = async (req) => {
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
