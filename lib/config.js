/**
 * Config
 */
const
	path = require('path'),
	fs = require('fs'),
	_ = require('lodash'),
	utils = require('./utils');

const 
	CONFIG_DIR = path.join(__dirname, '../conf'),
	DEFAULT_DIR = path.join(CONFIG_DIR, 'default.js');

var isWin = /^win/.test(process.platform),
	conf = {};

// load default config
fs.existsSync(DEFAULT_DIR) && _.merge(conf, require(DEFAULT_DIR));
var globPattern = CONFIG_DIR + '/**/*.' + (isWin ? 'win' : process.platform) + '.js';
utils.getGlobbedFiles(globPattern).forEach(function (filePath) {
	_.merge(conf, require(filePath));
});

module.exports = conf;