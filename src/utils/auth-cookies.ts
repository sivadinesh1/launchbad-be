import { serialize, parse } from 'cookie';
import cookie from 'cookie';

const TOKEN_NAME = 'authToken';

export const MAX_AGE = 60 * 60 * 8; // 8 hours

export function setTokenCookie(res: any, token: any) {
	return new Promise((resolve, reject) => {
		res.setHeader(
			'Set-Cookie',
			cookie.serialize('authToken', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV !== 'development',
				maxAge: 60 * 60,
				sameSite: 'strict',
				path: '/',
			}),
		);
		resolve('ss');
	});
}

export function removeTokenCookie(res: any) {
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

export function parseCookies(req: any) {
	// For API Routes we don't need to parse the cookies.
	if (req.cookies) return req.cookies;

	// For pages we do need to parse the cookies.
	const cookie = req.headers?.cookie;
	return parse(cookie || '');
}

export function getTokenCookie(req: any) {
	const cookies = parseCookies(req);
	return cookies[TOKEN_NAME];
}

module.exports = {
	setTokenCookie,
	removeTokenCookie,
	getTokenCookie,
	parseCookies,
};
