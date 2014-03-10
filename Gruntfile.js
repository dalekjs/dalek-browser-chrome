module.exports = function (grunt) {
  'use strict';

  // check task runtime
  require('time-grunt')(grunt);

  // load generic configs
  var configs = require('dalek-build-tools');

  // project config
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
    clean: configs.clean,

    // speed up build by defining concurrent tasks
    concurrent: configs.concurrent,

    // linting
    jshint: configs.jshint,

    // testing
    mochaTest: configs.mocha,

    // code metrics
    complexity: configs.complexity,
    plato: configs.plato(grunt.file.readJSON('.jshintrc')),

    // api docs
    yuidoc: configs.yuidocs(),

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
        dest: './'
      }
    },

    // up version, tag & commit
    bump: configs.bump({
      pushTo: 'git@github.com:dalekjs/dalek-browser-chrome.git',
      files: ['package.json', 'CONTRIBUTORS.md', 'CHANGELOG.md']
    }),

    // generate contributors file
    contributors: configs.contributors,

    // compress artifacts
    compress: configs.compress,

    // prepare files for grunt-plato to
    // avoid error messages (weird issue...)
    preparePlato: {
      options: {
        folders: [
          'coverage',
          'report',
          'report/coverage',
          'report/complexity',
          'report/complexity/files',
          'report/complexity/files/index_js',
          'report/complexity/files/install_js',
          'report/complexity/files/lib_chromedriver_js'
        ],
        files: [
          'report.history.json',
          'files/index_js/report.history.json',
          'files/install_js/report.history.json',
          'files/lib_chromedriver_js/report.history.json'
        ]
      }
    },

    // prepare files & folders for coverage
    prepareCoverage: {
      options: {
        folders: ['coverage', 'report', 'report/coverage'],
        pattern: '[require("fs").realpathSync(__dirname + "/../index.js")]'
      }
    },

    // list requires that need to be changed
    // for generating a canary build
    'release-canary': {
      options: {
        files: ['index.js']
      }
    },

    // archives the docs if a new version appears
    archive: {
      options: {
        file: 'chrome.html'
      }
    }

  });

  // load 3rd party tasks
  require('load-grunt-tasks')(grunt);
  grunt.loadTasks('./node_modules/dalek-build-tools/tasks');

  // define runner tasks
  grunt.registerTask('lint', 'jshint');
  
  // split test & docs for speed
  grunt.registerTask('test', ['clean:coverage', 'prepareCoverage', 'concurrent:test', 'generateCoverageBadge']);
  grunt.registerTask('docs', ['clean:reportZip', 'clean:report', 'preparePlato', 'documantix', 'includereplace', 'concurrent:docs', 'compress']);
  
  // release tasks
  grunt.registerTask('releasePatch', ['test', 'bump-only:patch', 'contributors', 'changelog', 'bump-commit']);
  grunt.registerTask('releaseMinor', ['test', 'bump-only:minor', 'contributors', 'changelog', 'bump-commit']);
  grunt.registerTask('releaseMajor', ['test', 'bump-only:major', 'contributors', 'changelog', 'bump-commit']);
  
  // clean, test, generate docs (the CI task)
  grunt.registerTask('all', ['clean', 'test', 'docs']);
  
};
