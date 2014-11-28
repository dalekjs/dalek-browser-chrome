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
var fs = require('fs');
var cp = require('child_process');
var portscanner = require('portscanner');

// int. libs
var chromedriver = require('./lib/chromedriver');

/**
 * This module is a browser plugin for [DalekJS](//github.com/dalekjs/dalek).
 * It provides all a WebDriverServer & browser launcher for Google Chrome.
 *
 * The browser plugin can be installed with the following command:
 *
 * ```bash
 * $ npm install dalek-browser-chrome --save-dev
 * ```
 *
 * You can use the browser plugin by adding a config option to the your [Dalekfile](/pages/config.html)
 *
 * ```javascript
 * "browser": ["chrome"]
 * ```
 *
 * Or you can tell Dalek that it should test in this browser via the command line:
 *
 * ```bash
 * $ dalek mytest.js -b chrome
 * ```
 *
 * The Webdriver Server tries to open Port 9002 by default,
 * if this port is blocked, it tries to use a port between 9003 & 9092
 * You can specifiy a different port from within your [Dalekfile](/pages/config.html) like so:
 *
 * ```javascript
 * "browsers": [{
 *   "chrome": {
 *     "port": 5555 
 *   }
 * }]
 * ```
 *
 * It is also possible to specify a range of ports:
 *
 * ```javascript
 * "browsers": [{
 *   "chrome": {
 *     "portRange": [6100, 6120] 
 *   }
 * }]
 * ```
 *
 * If you would like to test Chrome Canary oder Chromium releases, you can simply apply a snd. argument,
 * which defines the browser type:
 *
 * ```bash
 * $ dalek mytest.js -b chrome:canary
 * ```
 *
 * for canary, and if you would like to use chromium, just append `:chromium`:
 *
 * ```bash
 * $ dalek mytest.js -b chrome:chromium
 * ```
 *
 * This will only work if you installed your browser in the default locations,
 * if the browsers binary is located in a non default location, you are able to specify
 * its location in your [Dalekfile](/pages/config.html):
 *
 * ```javascript
 * "browsers": [{
 *   "chrome": {
 *     "binary": "/Applications/Custom Located Chrome.app/MacOS/Contents/Chrome" 
 *   }
 * }]
 * ```
 *
 * This also works for the canary &amp; chromium builds
 *
 * ```javascript
 * "browsers": [{
 *   "chrome": {
 *     "binary": "/Applications/Custom Located Chrome.app/MacOS/Contents/Chrome" 
 *   }
 * }]
 * ```
 *
 * @module DalekJS
 * @class ChromeDriver
 * @namespace Browser
 * @part Chrome
 * @api
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
   * The port may change, cause the port conflict resolution
   * tool might pick another one, if the default one is blocked
   *
   * @property port
   * @type integer
   * @default 9002
   */

  port: 9002,

  /**
   * Default maximum port of the ChromeWebDriverServer
   * The port is the highest port in the range that can be allocated
   * by the ChromeWebDriverServer
   *
   * @property maxPort
   * @type integer
   * @default 9092
   */

  maxPort: 9092,

  /**
   * Default host of the ChromeWebDriverServer
   * The host may be overridden with
   * a user configured value
   *
   * @property host
   * @type string
   * @default localhost
   */

  host: 'localhost',

  /**
   * Default desired capabilities that should be
   * transferred when the browser session gets requested
   *
   * @property desiredCapabilities
   * @type object
   */

  desiredCapabilities: {
    browserName: 'chrome',
    chromeOptions: {}
  },

  /**
   * Driver defaults, what should the driver be able to access.
   *
   * @property driverDefaults
   * @type object
   */

  driverDefaults: {
    viewport: true,
    status: true,
    sessionInfo: true
  },

  /**
   * Root path of the ChromeWebDriverServer
   *
   * @property path
   * @type string
   * @default /wd/hub
   */

  path: '/wd/hub',

  /**
   * Child process instance of the Chrome browser
   *
   * @property spawned
   * @type null|Object
   * @default null
   */

  spawned: null,

  /**
   * Chrome processes that are running on startup,
   * and therefor shouldn`t be closed
   *
   * @property openProcesses
   * @type array
   * @default []   
   */

  openProcesses: [],

  /**
   * Name of the process (platform dependent)
   * that represents the browser itself
   *
   * @property processName
   * @type string
   * @default chrome.exe / Chrome   
   */

  processName: (process.platform === 'win32' ? 'chrome.exe' : 'Chrome'),

  /**
   * Different browser types (Canary / Chromium) that can be controlled
   * via the Chromedriver
   *
   * @property browserTypes
   * @type object
   */

  browserTypes: {

    /**
     * Chrome Canary
     *
     * @property canary
     * @type object
     */

    canary: {
      name: 'Chrome Canary',
      linux: 'google-chrome-canary',
      darwin: '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
      win32: process.env.LOCALAPPDATA + '\\Google\\Chrome SxS\\Application\\chrome.exe'
    },

    /**
     * Chromium
     *
     * @property chromium
     * @type object
     */

    chromium: {
      name: 'Chromium',
      process: (process.platform === 'win32' ? 'chromium.exe' : 'Chromium'),
      linux: 'chromium-browser',
      darwin: '/Applications/Chromium.app/Contents/MacOS/Chromium',
      win32: process.env.LOCALAPPDATA + '\\Google\\Chrome SxS\\Application\\chrome.exe'
    }
  },

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
   * Resolves the maximum range for the driver port
   *
   * @method getMaxPort
   * @return {integer} port Max WebDriver server port range
   */

  getMaxPort: function () {
    return this.maxPort;
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
   * (which implicitly launches Chrome itself)
   * and checks for an available port
   *
   * @method launch
   * @param {object} configuration Browser configuration
   * @param {EventEmitter2} events EventEmitter (Reporter Emitter instance)
   * @param {Dalek.Internal.Config} config Dalek configuration class
   * @return {object} promise Browser promise
   */

  launch: function (configuration, events, config) {
    var deferred = Q.defer();

    // store injected configuration/log event handlers
    this.reporterEvents = events;
    this.configuration = configuration;
    this.config = config;

    // check for a user set port
    var browsers = this.config.get('browsers');
    if (browsers && Array.isArray(browsers)) {
      browsers.forEach(this._checkUserDefinedPorts.bind(this));
    }

    if (configuration) {
      if (configuration.chromeOptions) {
        this.desiredCapabilities.chromeOptions = configuration.chromeOptions;
      }

      // check for a user defined binary
      if (configuration.binary) {
        var binaryExists = this._checkUserDefinedBinary(configuration.binary);
        if (binaryExists) {
          // check for new verbose & process name
          this.longName = this._modifyVerboseBrowserName(configuration);
          this.processName = this._fetchProcessName(configuration);
        }
      }
    }

    // check if the current port is in use, if so, scan for free ports
    portscanner.findAPortNotInUse(this.getPort(), this.getMaxPort(), this.getHost(), this._checkPorts.bind(this, deferred));
    return deferred.promise;
  },

  /**
   * Kills the ChromeWebDriverServer
   * & Chrome browser processes
   *
   * @method kill
   * @chainable
   */

  kill: function () {
    this._processes(process.platform, this._checkProcesses.bind(this));
    return this;
  },

  /**
   * Modifies the verbose browser name
   *
   * @method _modifyVerboseBrowserName
   * @param {object} configuration User configuration
   * @return {string} Verbose browser name
   * @private
   */

  _modifyVerboseBrowserName: function (configuration) {
    if (configuration.type && this.browserTypes[configuration.type]) {
      return this.browserTypes[configuration.type].name + ' (' + this.longName + ')';
    }

    return this.longName;
  },

  /**
   * Change the process name for browser instances like Canary &amp; Chromium
   *
   * @method _fetchProcessName
   * @param {object} configuration User configuration
   * @return {string} Verbose browser name
   * @private
   */

  _fetchProcessName: function (configuration) {
    // check if the process name must be overridden (to shut down the browser)
    if (this.browserTypes[configuration.type] && this.browserTypes[configuration.type].process) {
      return this.browserTypes[configuration.type].process;
    }

    return this.processName;
  },

  /**
   * Process user defined ports
   *
   * @method _checkUserDefinedPorts
   * @param {object} browser Browser configuration
   * @chainable
   * @private
   */

  _checkUserDefinedPorts: function (browser) {
    // check for a single defined port
    if (browser.chrome && browser.chrome.port) {
      this.port = parseInt(browser.chrome.port, 10);
      this.maxPort = this.port + 90;
      this.reporterEvents.emit('report:log:system', 'dalek-browser-chrome: Switching to user defined port: ' + this.port);
    }

    // check for a port range
    if (browser.chrome && browser.chrome.portRange && browser.chrome.portRange.length === 2) {
      this.port = parseInt(browser.chrome.portRange[0], 10);
      this.maxPort = parseInt(browser.chrome.portRange[1], 10);
      this.reporterEvents.emit('report:log:system', 'dalek-browser-chrome: Switching to user defined port(s): ' + this.port + ' -> ' + this.maxPort);
    }

    return this;
  },

  /**
   * Checks if the binary exists,
   * when set manually by the user
   *
   * @method _checkUserDefinedBinary
   * @param {string} binary Path to the browser binary
   * @return {bool} Binary exists
   * @private
   */

  _checkUserDefinedBinary: function (binary) {
    // check if we need to replace the users home directory
    if (process.platform === 'darwin' && binary.trim()[0] === '~') {
      binary = binary.replace('~', process.env.HOME);
    }
    
    // check if the binary exists
    if (!fs.existsSync(binary)) {
      this.reporterEvents.emit('error', 'dalek-driver-chrome: Binary not found: ' + binary);
      process.exit(127);
      return false;
    }

    // add the binary to the desired capabilities
    this.desiredCapabilities.chromeOptions.binary = binary;

    return true;
  },

  /**
   * Checks if the def. port is blocked & if we need to switch to another port
   * Kicks off the process manager (for closing the opened browsers after the run has been finished)
   * Also starts the chromedriver instance 
   *
   * @method _checkPorts
   * @param {object} deferred Promise
   * @param {null|object} error Error object
   * @param {integer} port Found open port
   * @private
   * @chainable
   */

  _checkPorts: function(deferred, error, port) {
    // check if the port was blocked & if we need to switch to another port
    if (this.port !== port) {
      this.reporterEvents.emit('report:log:system', 'dalek-browser-chrome: Switching to port: ' + port);
      this.port = port;
    }

    // get the currently running processes & invoke the chromedriver afterwards
    this._processes(process.platform, this._startChromedriver.bind(this, deferred));
    return this;
  },

  /**
   * Spawns an instance of Chromedriver
   * 
   * @method _startChromedriver
   * @param {object} deferred Promise
   * @param {null|object} error Error object
   * @param {string} result List of open chrome processes BEFORE the test browser has been launched
   * @private
   * @chainable
   */

  _startChromedriver: function (deferred, err, result) {
    var args = ['--port=' + this.getPort(), '--url-base=' + this.path];
    this.spawned = cp.spawn(chromedriver.path, args);
    this.openProcesses = result;
    this.spawned.stdout.on('data', this._catchDriverLogs.bind(this, deferred));
    return this;
  },

  /**
   * Watches the chromedriver console output to capture the starting message
   * 
   * @method _catchDriverLogs
   * @param {object} deferred Promise
   * @param {buffer} data Chromedriver console output
   * @private
   * @chainable
   */

  _catchDriverLogs: function (deferred, data) {
    var dataStr = data + '';
    var timeout = null;

    // timeout to catch if chromedriver couldnt be launched
    if (dataStr.search('DVFreeThread') === -1) {
      timeout = setTimeout(function () {
        deferred.reject();
        this.reporterEvents.emit('error', 'Chromedriver: ' + dataStr.trim());
        this.reporterEvents.emit('error', 'dalek-driver-chrome: Could not launch Chromedriver');
        process.exit(127);
      }.bind(this), 2000);
    }

    // look for the success message
    if (dataStr.search('Starting ChromeDriver') !== -1) {
      this.reporterEvents.emit('report:log:system', 'dalek-browser-chrome: Started ChromeDriver');
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      deferred.resolve();
    }

    return this;
  },

  /**
   * Remove the chromedriver log that is written to the current working directory
   * 
   * @method _unlinkChromedriverLog
   * @param {bool} retry Delete has been tried min 1 time before
   * @private
   * @chainable
   */

  _unlinkChromedriverLog: function (retry) {
    var logfile = process.cwd() + '/chromedriver.log';
    try {
      if (fs.existsSync(logfile)) {
        fs.unlinkSync(logfile);
      }
    } catch (e) {
      if (!retry) {
        setTimeout(this._unlinkChromedriverLog.bind(this, true), 1000);
      }
    }
    
    return this;
  },

  /**
   * Tracks running browser processes for chrome on mac & linux
   *
   * @method _processes
   * @param {string} platform Current OS
   * @param {function} fn Callback
   * @chainable
   * @private
   */

  _processes: function (platform, fn) {
    if (platform === 'win32') {
      this._processesWin(fn);
      return this;
    }
    
    this._processesNix(fn);
    return this;
  },

  /**
   * Kills all associated processes
   * 
   * @method _checkProcesses
   * @param {object|null} err Error object or null
   * @param {array} result List of running processes
   * @chainable
   * @private
   */

  _checkProcesses: function (err, result) {
    // log that the driver shutdown process has been initiated
    this.reporterEvents.emit('report:log:system', 'dalek-browser-chrome: Shutting down ChromeDriver');
    // kill leftover chrome browser processes
    result.forEach(this[(process.platform === 'win32' ? '_killWindows' : '_killNix')].bind(this));
    // kill chromedriver binary      
    this.spawned.kill('SIGTERM');
    // clean up the file mess the chromedriver leaves us behind
    this._unlinkChromedriverLog();
    return this;
  },

  // UNIX ONLY
  // ---------

  /**
   * Kills a process
   * 
   * @method _killNix
   * @param {integer} processID Process ID
   * @chainable
   * @private
   */

  _killNix: function (processID) {
    var kill = true;
    this.openProcesses.forEach(function (pid) {
      if (pid === processID) {
        kill = false;
      }
    });

    if (kill === true) {
      var killer = cp.spawn;
      killer('kill', [processID]);
    }

    return this;
  },

  /**
   * Lists all chrome processes on *NIX systems
   * 
   * @method _processesNix
   * @param {function} fn Calback
   * @chainable
   * @private
   */

  _processesNix: function (fn) {
    var processName = process.platform === 'darwin' ? this.processName : this.processName.toLowerCase();
    var cmd = ['ps -ax', '|', 'grep ' + processName];
    cp.exec(cmd.join(' '), this._processListNix.bind(this, fn));
    return this;
  },

  /**
   * Deserializes a process list on nix
   * 
   * @method _processListNix
   * @param {function} fn Calback
   * @param {object|null} err Error object
   * @param {string} stdout Output of the process list shell command
   * @chainable
   * @private
   */

  _processListNix: function(fn, err, stdout) {
    var result = [];
    stdout.split('\n').forEach(this._splitProcessListNix.bind(this, result));
    fn(err, result);
    return this;
  },

  /**
   * Reformats the process list output on *NIX systems
   * 
   * @method _splitProcessListNix
   * @param {array} result Reference to the process list
   * @param {string} line Single process in text representation
   * @chainable
   * @private
   */

  _splitProcessListNix: function(result, line) {
    var data = line.split(' ');
    data = data.filter(this._filterProcessItemsNix.bind(this));
    result.push(data[0]);
    return this;
  },

  /**
   * Filters empty process list entries on *NIX
   * 
   * @method _filterProcessItemsNix
   * @param {string} item Item to check
   * @return {string|bool} Item or falsy
   * @private
   */

  _filterProcessItemsNix: function (item) {
    if (item !== '') {
      return item;
    }
    return false;
  },

  // WIN ONLY
  // --------

  /**
   * Lists all running processes (win only)
   *
   * @method _processesWin
   * @param {Function} callback Receives the process object as the only callback argument
   * @chainable
   * @private
   */

  _processesWin: function (callback) {
    cp.exec('tasklist /FO CSV', this._processListWin.bind(this, callback));
    return this;
  },

  /**
   * Deserializes the process list on win
   * 
   * @method _processListWin
   * @param {function} callback Callback to be executed after the list has been transformed
   * @param {object|null} err Error if error, else null
   * @param {string} stdout Output of the process list command
   * @chainable
   * @private
   */

  _processListWin: function (callback, err, stdout) {
    var p = [];
    stdout.split('\r\n').forEach(this._splitProcessListWin.bind(this, p));
    var proc = [];
    var head = null;
    while (p.length > 1) {
      var rec = p.shift();
      rec = rec.replace(/\"\,/gi,'";').replace(/\"|\'/gi,'').split(';');
      if (head === null){
        head = rec;
        for (var i=0;i<head.length;i++){
          head[i] = head[i].replace(/ /gi,'');
        }
      } else {
        var tmp = {};
        for (var j=0;j<rec.length;j++){
          tmp[head[j]] = rec[j].replace(/\"|\'/gi,'');
        }
        proc.push(tmp);
      }
    }

    var result = [];
    proc.forEach(this._filterProcessItemsWin.bind(this, result));
    callback(null, result);
    return this;
  },

  /**
   * Processes (transforms) the list of processes
   * 
   * @method _filterProcessItemsWin
   * @param {array} result Reference to the result process list
   * @param {object} process Single piece of process information
   * @chainable
   * @private
   */

  _filterProcessItemsWin: function (result, process) {
    Object.keys(process).forEach(function (key) {
      if (process[key] === this.processName) {
        result.push(process.PID);
      }
    }.bind(this));
    return this;
  },

  /**
   * Filters empty lines out of the process result
   * 
   * @method _splitProcessListWin
   * @param {array} p Reference to the process list
   * @param {string} line Process item
   * @chainable
   * @private
   */

  _splitProcessListWin: function (p, line) {
    if (line.trim().length !== 0) {
      p.push(line);
    }
    return this;
  },

  /**
   * Kills a process (based on a PID)
   * that was not opened BEFORE Dalek has
   * been started
   *
   * @method _killWindows
   * @param {integer} pid Process id
   * @chainable
   * @private
   */

  _killWindows: function (pid) {
    var kill = true;

    // check if the process was running BEFORE we started dalek
    this.openProcesses.forEach(function (opid) {
      if (opid === pid) {
        kill = false;
      }
    });

    // kill the browser process
    if (kill === true) {
      cp.exec('taskkill /PID ' + pid + ' /f', function(){});
    }

    return this;
  }

};

// expose the module
module.exports = ChromeDriver;
