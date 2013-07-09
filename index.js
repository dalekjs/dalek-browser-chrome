/*!
 *
 * Copyright (c) 2013 Sebastian Golasch
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

'use strict';

// ext. libs
var Q = require('q');
var spawn = require('child_process').spawn;

// int. libs
var chromedriver = require('./lib/chromedriver');

/**
 * Chrome Driver base class
 *
 * @module DalekJS
 * @class ChromeDriver
 * @namespace Browser
 */

var ChromeDriver = {

  /**
   * Verbose version of the browser name
   *
   * @property longName
   * @type string
   * @default Google Chrome
   */

  longName: 'Google Chrome',

  /**
   * Default port of the ChromeWebDriverServer
   * The port may change, cause the port conflict resultion
   * tool might pick another one, if the default one is blocked
   *
   * @property port
   * @type integer
   * @default 9002
   */

  port: 9002,

  /**
   * Default host of the ChromeWebDriverServer
   * The host may be overriden with
   * a user configured value
   *
   * @property host
   * @type string
   * @default localhost
   */

  host: 'localhost',

  /**
   * Root path of the ChromeWebDriverServer
   *
   * @property path
   * @type string
   * @default /
   */

  path: '/',

  /**
   * Child process instance of the Chrome browser
   *
   * @property spawned
   * @type null|Object
   */

  spawned: null,

  /**
   * Resolves the driver port
   *
   * @method getPort
   * @return {integer} port WebDriver server port
   */

  getPort: function () {
    return this.port;
  },

  /**
   * Returns the driver host
   *
   * @method getHost
   * @return {string} host WebDriver server hostname
   */

  getHost: function () {
    return this.host;
  },

  /**
   * Launches the ChromeWebDriverServer
   *
   * @method launch
   * @return {object} promise Browser promise
   */

  launch: function () {
    var deferred = Q.defer();
    var stream = '';
    this.spawned = spawn(chromedriver.path, ['--port=' + this.getPort()]);

    this.spawned.stdout.on('data', function (data) {
      var dataStr = data + '';
      stream += dataStr;
      if (stream.search('Started ChromeDriver') !== -1) {
        deferred.resolve();
      }
    });
    return deferred.promise;
  },

  /**
   * Kills the ChromeWebDriverServer processe
   *
   * @method kill
   * @chainable
   */

  kill: function () {
    this.spawned.kill('SIGTERM');
    return this;
  }
};

// expose the module
module.exports = ChromeDriver;
