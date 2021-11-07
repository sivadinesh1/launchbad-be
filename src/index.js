const https = require('https');
const http = require('http');
const app = require('./app');
const fs = require('fs');

// var options = {
// 	key: fs.readFileSync('/etc/letsencrypt/live/launchpaderp.com/privkey.pem'),
// 	cert: fs.readFileSync('/etc/letsencrypt/live/launchpaderp.com/cert.pem'),
// 	ca: fs.readFileSync('/etc/letsencrypt/live/launchpaderp.com/chain.pem'),
// };

// var options = {
// 	key: fs.readFileSync('/etc/letsencrypt/live/launchpad.squapl.com/privkey.pem'),
// 	cert: fs.readFileSync('/etc/letsencrypt/live/launchpad.squapl.com/cert.pem'),
// 	ca: fs.readFileSync('/etc/letsencrypt/live/launchpad.squapl.com/chain.pem'),
// };

//devlopment en

//demo
// https.createServer(options, app).listen(8440);
// prod
// https.createServer(options, app).listen(8441);

// if (process.env.NODE_ENV === 'development') {
http.createServer(app).listen(5050);
// } else {
// 	var options = {
// 		key: fs.readFileSync(process.env.SSL_KEY),
// 		cert: fs.readFileSync(process.env.SSL_CERT),
// 		ca: fs.readFileSync(process.env.SSL_CHAIN),
// 	};

// 	https.createServer(options, app).listen(process.env.PORT);
// }

// pm2 log --lines 500
// rm all_files.sql && cat *.sql  > all_files.sql
