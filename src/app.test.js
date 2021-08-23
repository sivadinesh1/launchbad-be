const request = require('supertest');
const app = require('./app');
var assert = require('assert');
jest.useFakeTimers();
describe('Get States API', () => {
	it('GET /get-states --> array of states', () => {
		request(app)
			.get('/v1/api/admin/get-states')
			.expect('Content-Type', /json/)
			.expect(200)
			.then((response) => {
				expect(response.body).toEqual(expect.arrayContaining([expect.objectContaining({ code: expect.any(String) })]));
			})
			.catch((err) => console.log(err));
	});

	it('POST /add-vendor --> 201 ', function (done) {
		request(app)
			.post('/v1/api/admin/add-vendor')
			.send({
				address1: 'asd',
				address2: 'asdf',
				address3: 'asf',
				center_id: 1,
				district: 'aas',
				email: '',
				gst: '',
				mobile: 9999999992,
				mobile2: '',
				name: 'vend',
				phone: 9999999999,
				pin: '444444',
				state_id: 7,
				whatsapp: '',
			})
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(201)

			.end(function (err, res) {
				if (err) return done(err);
				return done();
			});
	});
});
