/**
 * Clout Javascript Framework
 * @utils
 */

const 
	_ = require('lodash'),
	glob = require('glob'),
	exec = require('child_process').exec,
	Promise = require('promise');

var utils = module.exports;

/**
 * Get files by glob patterns
 */
utils.getGlobbedFiles = function getGlobbedFiles(globPatterns) {
	var self = this,
		output = [];
	if (_.isArray(globPatterns)) {
		globPatterns.forEach(function (globPattern) {
			output = _.union(output, self.getGlobbedFiles(globPattern, toRemove));
		});
	} else if (_.isString(globPatterns)) {
		var files = glob(globPatterns, {
			sync: true
		});
		output = _.union(output, files);
	}
	return output;
};

utils.zombieCommand = function zombieCommand(command, cb) {
	var sudo = this.sudo || '';
	return new Promise(function (resolve, reject) {
		!cb && (cb = function (a, b) { if (a) { return reject(a); } resolve(b); });
		exec(sudo + command, function (err, stdout, stderr) {
			if (err || stderr) { return cb(err || stderr); }
			cb(null, stdout.trim());
		});
	});
};