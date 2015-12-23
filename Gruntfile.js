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
					'dist/css/content-layout-control.css': 'src/less/control.less',
					'dist/css/content-layout-preview.css': 'src/less/preview.less',
				}
			}
		},

		// Configure JSHint
		jshint: {
			test: {
				src: [
					'!src/js/templates',
					'src/js/*.js',
					'src/js/components/**/*.js'
				]
			}
		},

		// Concatenate scripts
		concat: {
			build: {
				files: {
					'dist/js/content-layout-control.js': [
						'src/js/content-layout-control.js',
						'src/js/control.js',
						'src/js/control-post-panel.js',
						'src/js/control-link-panel.js',
						'src/js/components/model/*.js',
						'src/js/components/control/*.js',
					],
					'dist/js/content-layout-preview.js': [
						'src/js/content-layout-control.js',
						'src/js/preview.js',
						'src/js/components/model/*.js',
						'src/js/components/preview/*.js',
					],
				}
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
					'!js/*.js',
					'!js/components/**',
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
	grunt.registerTask('build', ['jshint', 'clean', 'less', 'concat', 'copy'] );

};
