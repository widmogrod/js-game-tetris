module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            build: ['build/']
        },
        copy: {
            assets: {
                files: [
                    {expand: true, src: ['assets/**', 'index.html', 'js/require.js', 'js/main.js'], dest: 'build/'}
                ]
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'js/**']
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'js/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        watch: {
            options: {
                livereload: true
            },
            scripts: {
                files: ['js/**'],
                tasks: ['jshint'],
                options: {
                    spawn: false
                }
            },
            styles: {
                files: ['assets/main.css']
            }
        },
        requirejs: {
            compile: {
                options: {
                    name: 'main',
                    // name: 'game',
                    // name: 'shape/shape/interface',
                    baseUrl: "js",
                    mainConfigFile: "js/main.js",
                    out: "build/js/main.js"
                }
            }
        },
        shell: {
            listFolders: {
                options: {
                    stdout: true
                },
                command: 'ls'
            },
            ghPage: {
                command: 'git status'
            }
        },
        connect: {
            dev: {
                options: {
                    port: 9999,
                    keepalive: true,
                    livereload: true
                }
            }
        },
        jade: {
            dev: {
                options: {
                    data: {
                        dev: true
                    }
                },
                files: {
                    "index.html": "index.jade"
                }
            },
            release: {
                options: {
                    data: {
                        dev: false
                    }
                },
                files: {
                    "build/index.html": "test.jade"
                }
            }
        },
        concurrent: {
            dev: ['connect:dev', 'watch'],
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-concurrent');


    // Default task(s).
    grunt.registerTask('default', ['concurrent:dev']);
    grunt.registerTask('build', ['clean', 'copy', 'requirejs']);
};
