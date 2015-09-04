module.exports = function(grunt){
    //config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        build_path: 'build/',
        src_js: 'src/**/*.js',
        src_less: 'src/less/*.less',

        copy: {
            build: {expand: true, cwd: 'src/', src: ['index.html', 'images/loading.gif', 'favicon.ico'], dest: 'build/', filter: 'isFile'}
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                footer: '\n/* <%= pkg.name %> end ! */'
            },
            build: {
                src: ['<%= build_path %><%= pkg.name %>.js'],
                dest: '<%= build_path %><%= pkg.name %>.js'
            }
        },
        jshint: {
            files: '<%= src_js %>',
            options: {
                jshintrc: '.jshintrc'
            }
        },
        concat: {
            dist: {
                src: ['src/app.js', 'src/*/*.js'],
                dest: '<%= build_path %><%= pkg.name %>.js'
            }
        },
        less: {
            dist: {
                options: {
                    paths: ['src/less/']
                },
                src: '<%= src_less %>',
                dest: '<%= build_path %><%= pkg.name %>.css'
            }
        },
        cssmin: {
            combine: {
                files: {
                    '<%= build_path %><%= pkg.name %>.css': ['<%= build_path %><%= pkg.name %>.css']
                }
            }
        }
    });

    // Load the plugin that provides the "uglify" task.

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default task(s).
    grunt.registerTask('default', ['less', 'jshint', 'concat', 'copy']);
    grunt.registerTask('production', ['less', 'jshint', 'concat', 'cssmin', 'uglify', 'copy']);
};
