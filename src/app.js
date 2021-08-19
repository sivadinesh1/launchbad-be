const express = require('express');
const cors = require('cors');
const { handleError, ErrorHandler } = require('./config/error');
const config = require('./config/config');
const logger = require('./config/log4js');

const routes = require('./routes/v1');
const routes2 = require('./routes/v2');

const app = express();

app.use(express.static('public'));
app.use(express.static('upload'));

seqnce = 0;

var corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200,
};

// logger is actual logging
app.use(logger.express);

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

app.get('/error', (req, res) => {
	throw new ErrorHandler(500, 'Internal server error');
});

app.use((err, req, res) => {
	handleError(err, res);
});

module.exports = app;
