/**
 * Nginx Lifecycle
 * @author Muhammad Dadu
 */

const
	path = require('path'),
	fs = require('fs'),
	EventEmitter = require('events').EventEmitter,
	util = require('util'),
	utils = require('./utils'),
	procinfo = require('procinfo');

function Lifecycle(opts) {
	var self = this,
		pidFile = self.pidFile,
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
}
util.inherits(Lifecycle, EventEmitter);

Lifecycle.prototype.end = function() {
	this.watcher && this.watcher.close();
}

Lifecycle.prototype.reload = function(cb) {
	return utils.zombieCommand.apply(this, 'nginx -s reload', cb);
}

Lifecycle.prototype.start = function(cb) {
	return utils.zombieCommand.apply(this, ['nginx', cb]);
}

Lifecycle.prototype.stop = function(cb) {
	return utils.zombieCommand.apply(this, ['nginx -s stop', cb]);
}

module.exports = Lifecycle;
