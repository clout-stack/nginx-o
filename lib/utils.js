/**
 * Clout Javascript Framework
 * @utils
 */

const 
	_ = require('lodash'),
	glob = require('glob'),
	exec = require('child_process').exec,
	path = require('path'),
	fs = require('fs'),
	Promise = require('promise'),
	Handlebars = require('handlebars');

var utils = module.exports;

const TEMPLATES_DIR = path.join(__dirname, '../templates');

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
		(!cb || typeof cb !== 'function') && (cb = function (a, b) { if (a) { return reject(a); } resolve(b); });
		exec(sudo + command, function (err, stdout, stderr) {
			if (err || stderr) { return cb(err || stderr); }
			cb(null, stdout.trim());
		});
	});
};

// register helpers
Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
	switch (operator){
		case "==":
			return (v1==v2)?options.fn(this):options.inverse(this);
		case "!=":
			return (v1!=v2)?options.fn(this):options.inverse(this);
		case "===":
			return (v1===v2)?options.fn(this):options.inverse(this);
		case "!==":
			return (v1!==v2)?options.fn(this):options.inverse(this);
		case "&&":
			return (v1&&v2)?options.fn(this):options.inverse(this);
		case "||":
			return (v1||v2)?options.fn(this):options.inverse(this);
		case "<":
			return (v1<v2)?options.fn(this):options.inverse(this);
		case "<=":
			return (v1<=v2)?options.fn(this):options.inverse(this);
		case ">":
			return (v1>v2)?options.fn(this):options.inverse(this);
		case ">=":
			return (v1>=v2)?options.fn(this):options.inverse(this);
		default:
        	return eval(""+v1+operator+v2)?options.fn(this):options.inverse(this)
	}
});

utils.render = function (template, context) {
	return new Promise(function (resolve, reject) {
		var templatePath = null;
		(function () {
			var toLook = [template,
				path.join(TEMPLATES_DIR, template),
				path.join(TEMPLATES_DIR, template + '.ejs'),
				path.join(TEMPLATES_DIR, template + '.conf'),
				path.join(TEMPLATES_DIR, template + '.conf.ejs')];

			for (var i = 0, l = toLook.length; i < l; ++i) {
				if (fs.existsSync(toLook[i])) {
					templatePath = toLook[i];
					return;
				}
			}
		})();
		if (!templatePath) { return reject('Template not found'); }
		// compile template
		var tmplate = Handlebars.compile(String(fs.readFileSync(templatePath)));
		// generate html
		var html = tmplate(context);
		resolve(html);
	});
}
