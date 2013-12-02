
var path = require('path');

module.exports = function (grunt) {
    
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    
    grunt.initConfig({
        clean: {
            dist: './public/**/*.*'
        },
        copy: {
            dist: {
                files: [
                    { expand: true, dot: true, cwd: './assets', dest: './public', src: [ '**/*.*' ]},
                    { expand: true, dot: true, cwd: './', dest: './public', src: [ 'shared/**/*.*' ]},
                    { expand: true, dot: true, cwd: './vendor/font-awesome', dest: './public', src: [ 'fonts/**/*.*' ] }
                ]
            }
        },
        html2js: {
            options: {
                base: '.'
            },
            main: {
                src: ['./app/**/*.tpl.html', './components/**/*.tpl.html'],
                dest: './.tmp/templates.js'
            }
        },
        concat: {
            dev: {
                src: [
                    './vendor/curl/dist/curl/curl.js',
                    './vendor/d3/d3.js',
                    './vendor/jquery/jquery.js',
                    './vendor/angular/angular.js',
                    './vendor/angular-resource/angular-resource.js',
                    './vendor/angular-ui-router/release/angular-ui-router.js',
                    './vendor/pouchdb/index.js',
                    './.tmp/script.js'
                ],
                dest: './public/script.js'
            },
            prod: {
                src: [
                    './vendor/curl/dist/curl/curl.js',
                    './vendor/d3/d3.min.js',
                    './vendor/jquery/jquery.min.js',
                    './vendor/angular/angular.min.js',
                    './vendor/angular-resource/angular-resource.min.js',
                    './vendor/angular-ui-router/release/angular-ui-router.min.js',
                    './vendor/pouchdb/index.js',
                    './.tmp/script.js'
                ],
                dest: './public/script.js'
            }
        },
        uglify: {
            dev: {
                options: {
                    mangle: false,
                    compress: false,
                    beautify: true
                },
                files: {
                    './.tmp/script.js': [
                        './shared/**/*.js',
                        './.tmp/templates.js',
                        './components/modules.js',
                        './components/**/*.js',
                        './app/modules.js',
                        './app/**/*.js',
                        '!./app/**/*.spec.js',
                        '!./app/**/*.scenario.js',
                        '!./components/**/*.spec.js',
                        '!./components/**/*.scenario.js',
                        '!./shared/**/*.spec.js',
                        '!./shared/**/*.scenario.js'
                    ]
                }
            },
            prod: {
                options: {
                    mangle: true,
                    compress: true
                },
                files: {
                    './.tmp/script.js': [
                        './shared/**/*.js',
                        './.tmp/templates.js',
                        './components/modules.js',
                        './components/**/*.js',
                        './app/modules.js',
                        './app/**/*.js',
                        '!./app/**/*.spec.js',
                        '!./app/**/*.scenario.js',
                        '!./components/**/*.spec.js',
                        '!./components/**/*.scenario.js',
                        '!./shared/**/*.spec.js',
                        '!./shared/**/*.scenario.js'
                    ]
                }
            }
        },
        less: {
            options: {
                yuicompress: true
            },
            prod: {
                files: {
                    './public/style.css': './app/dashboard.less'
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
                    { 'expand': true, 'cwd': '.', 'src': 'index.html', 'dest': './public' }
                ]
            }
        },
        watch: {
            resources: {
                'files': [
                    './index.html',
                    './app/**/*.*',
                    './assets/**/*.*',
                    './components/**/*.*'
                ],
                'tasks': ['build-dev'],
                'options': {
                    'spawn': false,
                    'interval': 500
                }
            }
        },
        karma: {
            unit: {
                configFile: './karma.unit-test.conf.js',
                autoWatch: false,
                singleRun: true
            },
            integration: {
                configFile: './karma.integration.conf.js',
                autoWatch: false,
                singleRun: true
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
        'watch:resources'
    ]);

    grunt.registerTask('build-dev', [
        'clean',
        'html2js',
        'uglify:dev',
        'concat:dev',
        'less',
        'replace',
        'copy',
        'rename'
    ]);

    grunt.registerTask('build', [
        'clean',
        'html2js',
        'uglify:prod',
        'concat:prod',
        'less',
        'replace',
        'copy',
        'rename'
    ]);

    grunt.registerTask('default', ['build']);
    
};
