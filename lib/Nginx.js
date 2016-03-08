/**
 * Nginx
 * @author Muhammad Dadu
 */
const
	_ = require('lodash'),
	util = require('util'),
	utils = require('./utils'),
	config = require('./config'),
	Lifecycle = require('./Lifecycle');

function Nginx(opts) {
	var self = this;

	(function loadConfig() {
		!opts && (opts = {});
		// load default config
		for (var key in config) {
			self[key] = config[key];
		}
		// load opts
		for (var key in opts) {
			self[key] = opts[key];
		}
		self.sudo = self.sudo && 'sudo ' || '';
	})();

	utils.zombieCommand.apply(this, ['which nginx']).then(function (exists) {
		self.hasNginx = true;
	}, function (err) {
		console.warn('[WARN]', 'Nginx not found');
	});

	Nginx.super_.call(this);
}
util.inherits(Nginx, Lifecycle);
