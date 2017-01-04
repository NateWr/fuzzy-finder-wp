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
					'dist/assets/css/finder.css': [
						'src/assets/less/finder.less',
						'src/assets/less/finder-*.less'
					]
				}
			}
		},

		// Configure JSHint
		jshint: {
			test: {
				src: 'src/assets/js/*.js'
			}
		},

		// Concatenate scripts
		concat: {
			build: {
				files: {
					'dist/assets/js/finder.js': [
						'src/assets/js/finder.js',
						'src/assets/js/finder-*.js'
					]
				}
			}
		},

		// Minimize scripts
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				files: {
					'dist/assets/js/finder.js' : 'dist/assets/js/finder.js'
				}
			}
		},

		// Copy files from /src to /dist that aren't compiled
		copy: {
			main: {
				files: [{
					expand: true,
					dot: true,
					cwd: 'src',
					dest: 'dist',
					src: [
						'**/*.{php,txt,md}',
					]
				}]
			}
		},

		// Watch for changes on some files and auto-compile them
		watch: {
			less: {
				files: ['src/assets/less/*.less'],
				tasks: ['less']
			},
			js: {
				files: ['src/assets/js/*.js'],
				tasks: ['jshint', 'concat', 'uglify']
			},
			copy: {
				files: ['src/**/*.{php,txt,md}'],
				tasks: ['copy']
			},
		},

		// Build a package for distribution
		compress: {
			main: {
				options: {
					archive: 'fuzzy-finder-wp-<%= pkg.version %>.zip'
				},
				files: [
					{
						expand: true,
						cwd: 'dist/',
						src: [
							'*', '**/*',
						],
						dest: 'fuzzy-finder-wp/',
					}
				]
			}
		}

	});

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('default', ['watch']);

};
