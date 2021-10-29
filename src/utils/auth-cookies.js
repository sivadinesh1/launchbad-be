const { parse } = require('cookie');
const TOKEN_NAME = 'authToken';
var cookie = require('cookie');

const MAX_AGE = 60 * 60 * 8; // 8 hours

function setTokenCookie(res, token) {
	return new Promise((resolve, reject) => {
		res.setHeader(
			'Set-Cookie',
			cookie.serialize('authToken', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV !== 'development',
				maxAge: 365 * 24 * 60 * 60,
				sameSite: 'strict',
				path: '/',
			}),
		);
		resolve('ss');
	});
}

function removeTokenCookie(res) {
	res.setHeader(
		'Set-Cookie',
		cookie.serialize('authToken', '', {
			httpOnly: true,
			secure: process.env.NODE_ENV !== 'development',
			maxAge: 0,
			sameSite: 'strict',
			path: '/',
		}),
	);
}

function parseCookies(req) {
	// For API Routes we don't need to parse the cookies.
	if (req.cookies) return req.cookies;

	// For pages we do need to parse the cookies.
	const cookie = req.headers?.cookie;
	return parse(cookie || '');
}

function getTokenCookie(req) {
	const cookies = parseCookies(req);
	return cookies[TOKEN_NAME];
}

module.exports = {
	setTokenCookie,
	removeTokenCookie,
	getTokenCookie,
	parseCookies,
};
