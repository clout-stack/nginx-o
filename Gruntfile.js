/**
 * Gruntfile
 */

module.exports = function(grunt) {
    grunt.initConfig({
    	// Mocha config
        mochaTest: {
            test: {
                src: ['test/**/*_test.js']
            }
        }
    });

    grunt.loadNpmTasks('grunt-mocha-test');

	grunt.registerTask('test', 'mochaTest');
};
