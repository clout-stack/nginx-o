/**
 * Nginx
 * @author Muhammad Dadu
 */
var path = require('path'),
	fs = require('fs'),
	_ = require('lodash'),
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	exec = require('child_process').exec,
	procinfo = require('procinfo'),
	Promise = require('promise'),
	config = require('./config');

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
	Nginx.zombieCommand.apply(this, ['which nginx']).then(function (exists) {
		self.hasNginx = true;
	}, function (err) {
		console.warn('[WARN]', 'Nginx not found');
	});
	(function loadReloadEmitter() {
		var pidFile = self.pidFile,
			toWatch = pidFile;
		function notRunning() {
			// was previously online, assume stopped
			if (self.online) {
				self.online = false;
				self.emit('stopped');
			}
		}
		function readFile(evt) {
			if (evt) { this.close(); }
			fs.readFile(pidFile, 'utf8', function (err, proc) {
				if (err) { // assume nginx is not running
					toWatch = path.dirname(pidFile);
					self.watcher = fs.watch(toWatch, readFile);
					return notRunning();
				}
				toWatch = pidFile;
				proc = parseInt(proc, 10);
				procinfo(proc, function (err, procInfo) {
					if (err) { return notRunning(); }
					self.pid = procInfo.pids[0];
					if (!err && !self.online) {
						self.online = true;
						self.emit('started');
					}
				});
				self.watcher = fs.watch(toWatch, readFile);
			});
		}
		readFile();
	})();
}
util.inherits(Nginx, EventEmitter);

Nginx.prototype.end = function() {
	this.watcher && this.watcher.close();
}

Nginx.prototype.reload = function(cb) {
	return Nginx.zombieCommand.apply(this, 'nginx -s reload', cb);
}

Nginx.prototype.start = function(cb) {
	return Nginx.zombieCommand.apply(this, ['nginx', cb]);
}

Nginx.prototype.stop = function(cb) {
	return Nginx.zombieCommand.apply(this, ['nginx -s stop', cb]);
}

/** Methods */
Nginx.zombieCommand = function zombieCommand(command, cb) {
	var sudo = this.sudo || '';
	return new Promise(function (resolve, reject) {
		!cb && (cb = function (a, b) { if (a) { return reject(a); } resolve(b); });
		exec(sudo + command, function (err, stdout, stderr) {
			if (err || stderr) { return cb(err || stderr); }
			cb(null, stdout.trim());
		});
	});
}

module.exports = Nginx;
