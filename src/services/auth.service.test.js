const request = require('supertest');
const app = require('../app');
var assert = require('assert');

jest.useFakeTimers();

const { checkUsernameExists } = require('./auth.service');

test('checkUsernameExists --->', async () => {
	let obj = await checkUsernameExists('9999999990');
	expect(obj[0]).toEqual(expect.objectContaining({ username: '9999999990' }));
});

it('POST /login --> 200 ', function (done) {
	request(app)
		.post('/v1/api/auth/login')
		.send({
			username: 9999999990,
			password: 'tts1234',
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.then((response) => {
			assert(response.body.obj.username, '9999999990');
			done();
		})
		.catch((err) => done(err));
});

it('POST /login INVALID CREDENTIALS --> 200 ', function (done) {
	request(app)
		.post('/v1/api/auth/login')
		.send({
			username: 9999999990,
			password: 'tts12341',
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.then((response) => {
			assert(response.body.result, 'INVALID_CREDENTIALS');
			done();
		})
		.catch((err) => done(err));
});

it('POST /login USER NOT FOUND --> 200 ', function (done) {
	request(app)
		.post('/v1/api/auth/login')
		.send({
			username: 199999999,
			password: 'tts1234',
		})
		.set('Accept', 'application/json')
		.expect('Content-Type', /json/)
		.expect(200)
		.then((response) => {
			assert(response.body.result, 'USER_NOT_FOUND');
			done();
		})
		.catch((err) => done(err));
});
