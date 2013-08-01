/* jshint camelcase: false */
module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({

    // load module meta data
    pkg: grunt.file.readJSON('package.json'),

    // define a src set of files for other tasks
    src: {
      lint: ['Gruntfile.js', 'index.js', 'install.js', 'lib/**/*.js', 'test/*.js'],
      complexity: ['index.js', 'install.js', 'lib/**/*.js'],
      test: ['test/*.js'],
      src: ['index.js', 'install.js', 'lib/**/*.js']
    },

    // clean automatically generated helper files & docs
    clean: {
      coverage: ['coverage', 'report/coverage'],
      report: ['report/complexity', 'report/api', 'report/docs'],
      reportZip: ['report.zip']
    },

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
          quiet: true,
          captureFile: 'report/coverage/index.html'
        },
        src: '<%= src.test %>'
      },
      jsoncoverage: {
        options: {
          reporter: 'json-cov',
          quiet: true,
          captureFile: 'report/coverage/coverage.json'
        },
        src: '<%= src.test %>'
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
        target: 'report/docs',
        vars: {
          title: 'DalekJS - Documentation - Browser - Google Chrome',
          desc: 'DalekJS - Documentation - Browser - Google Chrome',
          docs: true
        }
      },
      src: ['index.js']
    },

    // add current timestamp to the html document
    includereplace: {
      dist: {
        options: {
          globals: {
            timestamp: '<%= grunt.template.today("dddd, mmmm dS, yyyy, h:MM:ss TT") %>'
          },
        },
        src: 'report/docs/*.html',
        dest: '.'
      }
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
  grunt.registerTask('preparePlato', function () {
    var fs = require('fs');

    var platoDummyFolders = ['report', 'report/coverage', 'report/complexity', 'report/complexity/files', 'report/complexity/files/test', 'report/complexity/files/index_js', 'report/complexity/files/install_js', 'report/complexity/files/lib_chromedriver_js'];
    var platoDummyFiles = ['/report/complexity/report.history.json', '/report/complexity/files/report.history.json', '/report/complexity/files/index_js/report.history.json', '/report/complexity/files/install_js/report.history.json', '/report/complexity/files/lib_chromedriver_js/report.history.json'];

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
      if (!fs.existsSync(__dirname + '/' + path)) {
        fs.mkdirSync(__dirname + '/' + path);
      }
    });

    // store some dummy reports, so that grunt plato doesnt complain
    platoDummyFiles.forEach(function (file) {
      if (!fs.existsSync(__dirname + file)) {
        fs.writeFileSync(__dirname + file, '{}');
      }
    });
  });

  // prepare files & folders for coverage
  grunt.registerTask('prepareCoverage', function () {
    var fs = require('fs');

    // generate folders
    ['coverage', 'report', 'report/coverage'].forEach(function (folder) {
      if (!fs.existsSync(__dirname + '/' + folder)) {
        fs.mkdirSync(__dirname + '/' + folder);
      }
    });

    // generate code coverage helper file
    var coverageHelper = 'require("blanket")({pattern: [require("fs").realpathSync(__dirname + "/../index.js"), require("fs").realpathSync(__dirname + "/../lib/")]});';
    if (!fs.existsSync(__dirname + '/coverage/blanket.js')) {
      fs.writeFileSync(__dirname + '/coverage/blanket.js', coverageHelper);
    }
  });

  // generates a coverage badge
  grunt.registerTask('generateCoverageBadge', function () {
    var fs = require('fs');
    if (fs.existsSync(__dirname + '/node_modules/coverage-badge')) {
      if (fs.existsSync(__dirname + '/report/coverage/coverage.json')) {
        var green = [147,188,59];
        var yellow = [166,157,0];
        var red = [189,0,2];

        var getColor = function (coverage) {
          if (coverage > 90) {
            return mixColors(yellow, green, (coverage-90)/10);
          }

          if (coverage > 80) {
            return mixColors(red, yellow, (coverage-80)/10);
          }

          return createColor(red);
        };

        var mixColors = function (from, to, ratio) {
          var result = [], i;
          for (i=0; i<3; i++) {
            result[i] = Math.round(from[i] + (ratio * (to[i]-from[i])));
          }
          return createColor(result);
        };

        var createColor = function (values) {
          return 'rgba('+values[0]+','+values[1]+','+values[2]+',1)';
        };

        var Badge = require(__dirname + '/node_modules/coverage-badge/lib/Badge.js');
        var badgeFn = function(coverage) {
          coverage = Math.floor(Number(coverage));
          var badge = new Badge({
            box_color: getColor(coverage),
            box_text: coverage+'%',
            label_text: 'cov',
            height: 18,
            width: 49,
            box_width: 25,
            rounding: 0,
            padding: 0,
            label_font: '7pt DejaVu Sans',
            box_font: 'bold 7pt DejaVu Sans'
          });
          return badge.stream();
        };

        var coverage = JSON.parse(fs.readFileSync(__dirname + '/report/coverage/coverage.json')).coverage;
        var file = fs.createWriteStream(__dirname + '/report/coverage/coverage.png');
        badgeFn(coverage).pipe(file);
      }
    }
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
  grunt.loadNpmTasks('grunt-include-replace');

  // define runner tasks
  grunt.registerTask('lint', 'jshint');
  grunt.registerTask('test', ['clean:coverage', 'prepareCoverage', 'lint', 'mochaTest', 'generateCoverageBadge', 'complexity']);
  grunt.registerTask('docs', ['clean:reportZip', 'clean:report', 'preparePlato', 'plato', 'documantix', 'includereplace', 'yuidoc', 'compress']);
  grunt.registerTask('all', ['clean', 'test', 'docs']);
};
