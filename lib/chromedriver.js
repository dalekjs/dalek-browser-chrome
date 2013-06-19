// Copyright 2013 The Obvious Corporation.

/**
 * @fileoverview Helpers made available via require('dalek-browser-chrome') once package is
 * installed.
 */

var path = require('path');

/**
 * Where the chromedriver binary can be found.
 * @type {string}
 */
exports.path = process.platform === 'win32' ?
    path.join(__dirname, 'bin', 'chromedriver.exe') :
    path.join(__dirname, 'bin', 'chromedriver');


/**
 * The version of chromedriver installed by this package.
 * @type {number}
 */
exports.version = '26.0.0';
