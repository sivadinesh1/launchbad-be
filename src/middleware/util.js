const { cookie } = 'cookie';

export const parseCookies = (req) => {
	return cookie.parse(req ? req.headers.cookie || '' : document.cookie);
};

module.exports = {
	parseCookies,
};
