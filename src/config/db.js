const util = require('util');
var mysql = require('mysql');

var pool = mysql.createPool({
	connectionLimit: 100, //important
	host: '127.0.0.1',
	user: 'root',
	password: 'tesla',
	database: 'reddotdb',
	debug: false,
});

// var pool = mysql.createPool({
// 	connectionLimit: 100, //important
// 	host: 'ec2-13-126-139-223.ap-south-1.compute.amazonaws.com',
// 	user: 'root',
// 	password: 'tesla',
// 	database: 'reddotuat',
// 	debug: false,
// 	ssl: true,
// });

// Ping database to check for common exception errors.
pool.getConnection((err, connection) => {
	if (err) {
		if (err.code === 'PROTOCOL_CONNECTION_LOST') {
			console.error('Database connection was closed.');
		}
		if (err.code === 'ER_CON_COUNT_ERROR') {
			console.error('Database has too many connections.');
		}
		if (err.code === 'ECONNREFUSED') {
			console.error('Database connection was refused.');
		}
	}

	if (connection) connection.release();

	return;
});

// Promisify for Node.js async/await.
pool.query = util.promisify(pool.query);

module.exports = pool;
