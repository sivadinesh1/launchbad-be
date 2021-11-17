const logger = require('./logger');

class ErrorHandler extends Error {
	constructor(statusCode, message, errString) {
		super();
		this.statusCode = statusCode;
		this.message = message;
		logger.error('ERRORS: status code: ' + statusCode + ' << DETAILS >>' + message + ' << ERRSTRING >>' + errString);
	}
}

const handleError = (err, res) => {
	const { statusCode, message, errString } = err;

	res.json({
		result: 'error',
		statusCode,
		message,
		errString,
	});
};

module.exports = {
	ErrorHandler,
	handleError,
};
