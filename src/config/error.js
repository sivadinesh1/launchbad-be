const logger = require('./logger');

class ErrorHandler extends Error {
	constructor(statusCode, message, errString) {
		super();
		this.statusCode = statusCode;
		this.message = message;
		logger.error('ERRORS: status code: ' + statusCode + ' << DETAILS >>' + message + ' << ERRSTRING >>' + errString);
		// logger.error('ERRORS: ' + statusCode + ' << DETAILS >>' + message);
	}
}

const handleError = (err, res) => {
	const { statusCode, message } = err;

	res.json({
		result: 'error',
		statusCode,
		message,
	});
};

module.exports = {
	ErrorHandler,
	handleError,
};
