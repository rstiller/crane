
var path = require('path');

module.exports = function (grunt) {
    
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    grunt.initConfig({
        clean: {
            dist: './public'
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: './app',
                    dest: './public',
                    src: [
                        'font/*.*',
                        'images/*.*'
                    ]
                }]
            }
        },
        uglify: {
            dev: {
                options: {
                    mangle: false,
                    compress: false
                },
                files: {
                    './public/script.js': [ './app/scripts/**/*.js', './app/libs/angular/angular.js' ]
                }
            },
            prod: {
                options: {
                    mangle: true,
                    compress: true
                },
                files: {
                    './public/script.js': [ './app/scripts/**/*.js', './app/libs/angular/angular.js' ]
                }
            },
            css: {
                options: {
                    mangle: false,
                    compress: false
                },
                files: {
                    './public/style.css': [ './app/styles/**/*.css' ]
                }
            }
        },
        rename: {
            script: {
                src: './public/script.js',
                dest: './public/<%= grunt.hash("./public/script.js") %>-script.js'
            },
            style: {
                src: './public/style.css',
                dest: './public/<%= grunt.hash("./public/style.css") %>-style.css'
            }
        },
        replace: {
            script: {
                options: {
                    'variables': {
                        'script': '<%= grunt.hash("./public/script.js") %>-script.js',
                        'style': '<%= grunt.hash("./public/style.css") %>-style.css'
                    },
                    'prefix': '@@'
                },
                files: [
                    { 'expand': true, 'cwd': './app', 'src': 'index.html', 'dest': './public' }
                ]
            }
        },
        watch: {
            resources: {
                'files': ['./app/index.html', './app/font/*.*', './app/scripts/*.*', './app/styles/*.*'],
                'tasks': ['build-dev'],
                'options': {
                    'nospawn': true,
                    'interval': 500
                }
            }
        }
    });
    
    grunt.hash = function hash(filename) {
        var crypto = require('crypto');
        var content = require('fs').readFileSync(filename, { 'encoding': 'utf8' });
        return crypto.createHash('md5').update(content).digest('hex');
    };

    grunt.registerTask('dev', [
        'build-dev',
        'watch'
    ]);

    grunt.registerTask('build-dev', [
        'clean',
        'uglify:dev',
        'uglify:css',
        'replace',
        'copy',
        'rename'
    ]);

    grunt.registerTask('build', [
        'clean',
        'uglify:prod',
        'uglify:css',
        'replace',
        'copy',
        'rename'
    ]);

    grunt.registerTask('default', ['build']);
    
};
