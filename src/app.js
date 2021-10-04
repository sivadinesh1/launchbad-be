const express = require('express');
const cors = require('cors');
const httpStatus = require('http-status');
const { errorConverter, errorHandler } = require('./middleware/error');
const reflectMetadata = require('reflect-metadata');
const config = require('./config/config');
const morgan = require('./config/morgan');
const keys = require('./config/keys');

const ApiError = require('./utils/ApiError');

const routes = require('./routes/v1');
const routes2 = require('./routes/v2');

const app = express();

if (config.env !== 'test') {
	app.use(morgan.successHandler);
	app.use(morgan.errorHandler);
}

app.use(express.static('public'));
app.use(express.static('upload'));

seqnce = 0;

var corsOptions = {
	credentials: true,
	origin: true,
	optionsSuccessStatus: 200,
};

app.use(function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});

app.use(cors(corsOptions));

app.use(
	express.json({
		limit: '50mb',
	}),
);
app.use(
	express.urlencoded({
		extended: false,
	}),
);

// v1 api routes
app.use('/v1', routes);
app.use('/v2', routes2);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
	next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
