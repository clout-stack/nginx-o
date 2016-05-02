/**
 * 
 */
const
	should = require('should'),
	Nginx = require('..');


describe('Nginx-o Tests', function() {
	var nginx = null;

	describe('Lifecycle Events', function() {
		it('create instance', function () {
			nginx = new Nginx();
			should.exist(nginx);
		});

		it('stop nginx if running', function (done) {
			if (!nginx.online) { return done(); }
			nginx.once('stopped', done); // add event listner
			nginx.stop(); // stop nginx
		});

		it('start nginx', function (done) {
			nginx.once('started', done); // add event listner
			nginx.start(); // stop nginx
		});
	});

	describe('Virtual Hosts CRUD', function () {
		it.skip('create');
		it.skip('read');
		it.skip('update');
		it.skip('delete');
	});
});

