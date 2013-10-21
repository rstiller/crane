
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
                files: [{
                    expand: true,
                    dot: true,
                    cwd: './src/assets',
                    dest: './public',
                    src: [
                        '**/*.*'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: './src/vendor/font-awesome',
                    dest: './public',
                    src: [
                        'font/**/*.*'
                    ]
                }]
            }
        },
        html2js: {
            main: {
                src: ['src/app/**/*.tpl.html', 'src/components/**/*.tpl.html'],
                dest: './.tmp/templates.js'
            },
        },
        uglify: {
            dev: {
                options: {
                    mangle: false,
                    compress: false,
                    beautify: true
                },
                files: {
                    './public/script.js': [
                        './src/vendor/jquery/jquery.js',
                        './src/vendor/angular/angular.js',
                        './src/vendor/angular-resource/angular-resource.js',
                        './src/vendor/angular-ui-router/release/angular-ui-router.js',
                        './src/vendor/ng-grid/build/ng-grid.js',
                        './.tmp/templates.js',
                        './src/components/modules.js',
                        './src/components/**/*.js',
                        './src/app/modules.js',
                        './src/app/**/*.js',
                        '!./src/app/**/*.spec.js',
                        '!./src/app/**/*.scenario.js'
                    ]
                }
            },
            prod: {
                options: {
                    mangle: true,
                    compress: true
                },
                files: {
                    './public/script.js': [
                        './src/vendor/jquery/jquery.js',
                        './src/vendor/angular/angular.js',
                        './src/vendor/angular-resource/angular-resource.js',
                        './src/vendor/angular-ui-router/release/angular-ui-router.js',
                        './src/vendor/ng-grid/build/ng-grid.js',
                        './.tmp/templates.js',
                        './src/components/modules.js',
                        './src/components/**/*.js',
                        './src/app/modules.js',
                        './src/app/**/*.js',
                        '!./src/app/**/*.spec.js',
                        '!./src/app/**/*.scenario.js'
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
                    './public/style.css': './src/app/dashboard.less'
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
                    { 'expand': true, 'cwd': './src', 'src': 'index.html', 'dest': './public' }
                ]
            }
        },
        watch: {
            resources: {
                'files': ['./src/index.html', './src/app/**/*.*', './src/assets/**/*.*', './src/components/**/*.*'],
                'tasks': ['build-dev'],
                'options': {
                    'nospawn': true,
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
        'watch'
    ]);

    grunt.registerTask('build-dev', [
        'clean',
        'html2js',
        'uglify:dev',
        'less',
        'replace',
        'copy',
        'rename'
    ]);

    grunt.registerTask('build', [
        'clean',
        'html2js',
        'uglify:prod',
        'less',
        'replace',
        'copy',
        'rename'
    ]);

    grunt.registerTask('default', ['build']);
    
};
