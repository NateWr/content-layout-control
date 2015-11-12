'use strict';

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({

		// Load grunt project configuration
		pkg: grunt.file.readJSON('package.json'),

		// Configure less CSS compiler
		less: {
			build: {
				options: {
					compress: true,
					cleancss: true,
					ieCompat: true
				},
				files: {
					'dist/css/customize-control.css': 'src/less/customize-control.less',
				}
			}
		},

		// Configure JSHint
		jshint: {
			test: {
				src: [
					'!src/js/templates',
					'src/js/customize-control.js',
					'src/js/customize-preview.js',
					'src/js/components/**/*.js'
				]
			}
		},

		// Watch for changes on some files and auto-compile them
		watch: {
			js: {
				files: ['src/js/**/*.js'],
				tasks: ['jshint']
			},
			build: {
				files: [
					'**',
					'!node_modules/**',
					'!Gruntfile.js',
					'!package.json',
					'!.git/**',
					'!.gitignore',
					'!dist/**',
					'!.*', // hidden files
					'!**/*~' // hidden files
				],
				tasks: ['build']
			}
		},

		// Copy files to build directory
		copy: {
			build: {
				expand: true,
				cwd: 'src/',
				src: [
					'**',
					'!less/**',
					'!.*', // hidden files
					'!**/*~' // hidden files
				],
				dest: 'dist/'
			},
			readme: {
				src: [
					'license.md',
					'readme.md'
				],
				dest: 'dist/'
			}
		},

		// Clean up the build directory
		clean: {
			build: ['dist/**']
		}

	});

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', ['watch:js']);
	grunt.registerTask('build', ['jshint', 'clean', 'less', 'copy'] );

};
