/**
 * Nginx Lifecycle
 * @author Muhammad Dadu
 */

const
	util = require('util'),
	utils = require('./utils'),
	path = require('path'),
	fs = require('fs'),
	Lifecycle = require('./Lifecycle'),
	Promise = require('promise');

function Server() {
	Server.super_.call(this);
}
util.inherits(Server, Lifecycle);

/**
 * list conf's
 * @param  {Function} cb  callback
 * @return {Promise}      promise
 */
Server.prototype.list = function (cb) {
	var globPattern = this.confDir + '/**/' + this.identifier + '*.conf',
		self = this;
	return new Promise(function (resolve, reject) {
		(!cb || typeof cb !== 'function') && (cb = function (a, b) { if (a) { return reject(a); } resolve(b); });
		var files = utils.getGlobbedFiles(globPattern),
			ids = [];
		files.forEach(function (file) {
			ids.push(file.replace(self.confDir + '/' + self.identifier, '').replace('.conf', ''));
		});
		cb(null, ids);
	});
}

/**
 * Create a new vhost
 * @param  {Object}   opts 				
 * @param  {String}   opts.id 			unique identifier
 * @param  {String}   opts.raw			[text to save]
 * @param  {String}   opts.template		[template name or path]
 * @param  {Object}   opts.values		[values for the template]
 * @param  {Function} cb   				callback
 * @return {Promise}        			promise
 */
Server.prototype.create = function (opts, cb) {
	var self = this;
	return new Promise(function (resolve, reject) {
		(!cb || typeof cb !== 'function') && (cb = function (a, b) { if (a) { return reject(a); } resolve(b); });
		!opts.id && (opts.id = String((new Date()).getTime()));
		!opts.template && (opts.template = 'default');
		var filePath = path.join(self.confDir, self.identifier + opts.id + '.conf');
		// verify nonexistance
		if (fs.existsSync(filePath)) { return cb('vhost with id `' + opts.id + '` exists'); }
		if (!opts.raw && opts.values && !opts.template) { return cb('Missing attributes'); }
		if (opts.raw) {
			return fs.writeFile(filePath, opts.raw, function (err) {
				if (err) { return cb(err); }
				return cb(null, opts);
			});
		}
		utils.render(opts.template, opts.values).then(function (html) {
			return fs.writeFile(filePath, html, 'utf8', function (err) {
				if (err) { return cb(err); }
				return cb(null, opts);
			});
		}, cb);
	});
}

/**
 * Read a vhost
 * @param  {String}   id 	unique identifier
 * @param  {Function} cb   	callback
 * @return {Promise}        promise
 */
Server.prototype.read = function (id, cb) {
	var self = this;
	return new Promise(function (resolve, reject) {
		(!cb || typeof cb !== 'function') && (cb = function (a, b) { if (a) { return reject(a); } resolve(b); });
		if (!id) { return cb('id is missing'); }
		var filePath = path.join(self.confDir, self.identifier + id + '.conf');
		// verify existance
		if (!fs.existsSync(filePath)) { return cb('vhost with id `' + id + '` does not exist'); }
		fs.readFile(filePath, function (err, file) {
			if (err) { return cb(err); }
			cb(null, file);
		});
	});
}

/**
 * Update a vhost
 * @param  {String}   id 				unique identifier
 * @param  {Object}   opts
 * @param  {String}   opts.raw			[text to save]
 * @param  {String}   opts.template		[template name or path]
 * @param  {Object}   opts.values		[values for the template]
 * @param  {Function} cb   				callback
 * @return {Promise}        			promise
 */
Server.prototype.update = function (id, opts, cb) {
	var self = this;
	return new Promise(function (resolve, reject) {
		(!cb || typeof cb !== 'function') && (cb = function (a, b) { if (a) { return reject(a); } resolve(b); });
		if (!id) { return cb('id is missing'); }
		var filePath = path.join(self.confDir, self.identifier + id + '.conf');
		// verify existance
		if (!fs.existsSync(filePath)) { return cb('vhost with id `' + id + '` does not exist'); }
		opts.id = id;
		self.delete(id).then(self.create(opts)).then(function (a) {
			cb(null, a);
		}, cb);
	});
}

/**
 * Delete a vhost
 * @param  {String}   id 	unique identifier
 * @param  {Function} cb   	callback
 * @return {Promise}        promise
 */
Server.prototype.delete = function (id, cb) {
	var self = this;
	return new Promise(function (resolve, reject) {
		(!cb || typeof cb !== 'function') && (cb = function (a, b) { if (a) { return reject(a); } resolve(b); });
		if (!id) { return cb('id is missing'); }
		var filePath = path.join(self.confDir, self.identifier + id + '.conf');
		// verify existance
		if (!fs.existsSync(filePath)) { return cb('vhost with id `' + id + '` does not exist'); }
		fs.unlink(filePath, function (err) {
			if (err) { return cb(err); }
			cb(null);
		});
	});
}

module.exports = Server;
