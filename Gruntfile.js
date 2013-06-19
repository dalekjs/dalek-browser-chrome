module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({

    // load module meta data
    pkg: grunt.file.readJSON('package.json'),

    // define a src set of files for other tasks
    src: {
      lint: ['Gruntfile.js', 'index.js', 'install.js', 'lib/**/*.js', 'test/*.js'],
      complexity: ['index.js', 'install.js', 'lib/**/*.js', 'test/*.js'],
      test: ['test/*.js'],
      src: ['index.js', 'install.js', 'lib/**/*.js']
    },

    // clean coverage helper file
    clean: ['coverage', 'report', 'report.zip'],

    // linting
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: '<%= src.lint %>'
    },

    // testing
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: 'coverage/blanket'
        },
        src: '<%= src.test %>'
      },
      coverage: {
        options: {
          reporter: 'html-cov',
          quiet: true
        },
        src: '<%= src.test %>',
        dest: 'report/coverage/index.html'
      }
    },

    // code metrics
    complexity: {
      generic: {
        src: '<%= src.complexity %>',
        options: {
          cyclomatic: 4,
          halstead: 20,
          maintainability: 100
        }
      }
    },
    plato: {
      generic: {
        options : {
          jshint : grunt.file.readJSON('.jshintrc')
        },
        files: {
          'report/complexity': '<%= src.complexity %>',
        }
      }
    },

    // api docs
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: '.',
          outdir: 'report/api'
        }
      }
    },

    // user docs
    documantix: {
      options: {
        header: 'dalekjs/dalekjs.com/master/assets/header.html',
        footer: 'dalekjs/dalekjs.com/master/assets/footer.html',
        target: 'report/docs'
      },
      src: ['index.js']
    },

    // compress artifacts
    compress: {
      main: {
        options: {
          archive: 'report.zip'
        },
        files: [
          {src: ['report/**'], dest: '/'}
        ]
      }
    }

  });

  // prepare files & folders for grunt:plato & coverage
  grunt.registerTask('prepare', function () {
    var fs = require('fs');

    var platoDummyFolders = ['coverage', 'report', 'report/coverage', 'report/complexity', 'report/complexity/files', 'report/complexity/files/test', 'report/complexity/files/index_js', 'report/complexity/files/install_js'];
    var platoDummyFiles = ['/report/complexity/report.history.json', '/report/complexity/files/report.history.json', '/report/complexity/files/index_js/report.history.json', '/report/complexity/files/install_js/report.history.json'];

    // loopy loop
    ['/test/'].forEach(function (folder) {
      fs.readdirSync(__dirname + folder).forEach(function (file) {
        var platoFolder = '/report/complexity/files/' + folder.substring(1).replace(/\//g, '_') + file.replace('.js', '_js');
        platoDummyFolders.push(platoFolder);
        platoDummyFiles.push(platoFolder + '/report.history.json');
      });
    });

    // generate dirs for docs & reports
    platoDummyFolders.forEach(function (path) {
      fs.mkdirSync(__dirname + '/' + path);
    });

    // store some dummy reports, so that grunt plato doesnt complain
    platoDummyFiles.forEach(function (file) {
      fs.writeFileSync(__dirname + file, '{}');
    });

    // generate code coverage helper file
    var coverageHelper = 'require("blanket")({pattern: require("fs").realpathSync(__dirname + "/../index.js")});';
    fs.writeFileSync(__dirname + '/coverage/blanket.js', coverageHelper);
  });

  // load 3rd party tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-complexity');
  grunt.loadNpmTasks('grunt-documantix');
  grunt.loadNpmTasks('grunt-plato');

  // define runner tasks
  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', ['clean', 'prepare', 'lint', 'mochaTest', 'complexity']);
  grunt.registerTask('docs', ['clean', 'prepare', 'plato', 'mochaTest', 'documantix', 'yuidoc', 'compress']);
};
