dalek-browser-chrome
=====================

> DalekJS browser plugin for Google Chrome

[![Build Status](https://travis-ci.org/dalekjs/dalek-browser-chrome.png)](https://travis-ci.org/dalekjs/dalek-browser-chrome)
[![Build Status](https://drone.io/github.com/dalekjs/dalek-browser-chrome/status.png)](https://drone.io/github.com/dalekjs/dalek-browser-chrome/latest)
[![Dependency Status](https://david-dm.org/dalekjs/dalek-browser-chrome.png)](https://david-dm.org/dalekjs/dalek-browser-chrome)
[![devDependency Status](https://david-dm.org/dalekjs/dalek-browser-chrome/dev-status.png)](https://david-dm.org/dalekjs/dalek-browser-chrome#info=devDependencies)
[![NPM version](https://badge.fury.io/js/dalek-browser-chrome.png)](http://badge.fury.io/js/dalek-browser-chrome)
[![Coverage](http://dalekjs.com/package/dalek-browser-chrome/master/coverage/coverage.png)](http://dalekjs.com/package/dalek-browser-chrome/master/coverage/index.html)
[![unstable](https://rawgithub.com/hughsk/stability-badges/master/dist/unstable.svg)](http://github.com/hughsk/stability-badges)

[![NPM](https://nodei.co/npm/dalek-browser-chrome.png)](https://nodei.co/npm/dalek-browser-chrome/)
[![NPM](https://nodei.co/npm-dl/dalek-browser-chrome.png)](https://nodei.co/npm/dalek-browser-chrome/)

## Ressources

[API Docs](http://dalekjs.com/package/dalek-browser-chrome/master/api/index.html) -
[Trello](https://trello.com/b/xhw6Jv7A/dalek-browser-chrome) -
[Code coverage](http://dalekjs.com/package/dalek-browser-chrome/master/coverage/index.html) -
[Code complexity](http://dalekjs.com/package/dalek-browser-chrome/master/complexity/index.html) -
[Contributing](https://github.com/dalekjs/dalek-browser-chrome/blob/master/CONTRIBUTING.md) -
[User Docs](http://dalekjs.com/docs/chrome.html) -
[Homepage](http://dalekjs.com) -
[Twitter](http://twitter.com/dalekjs)

## Docs

This module is a browser plugin for [DalekJS](//github.com/dalekjs/dalek).
It provides all a WebDriverServer & browser launcher for Google Chrome.

The browser plugin can be installed with the following command:

```
$ npm install dalek-browser-chrome --save-dev
```

You can use the browser plugin by adding a config option to the your [Dalekfile](/pages/config.html)

```
"browser": ["chrome"]
```

Or you can tell Dalek that it should test in this browser via the command line:

```
$ dalek mytest.js -b chrome
```

The Webdriver Server tries to open Port 9002 by default,
if this port is blocked, it tries to use a port between 9003 & 9092
You can specifiy a different port from within your [Dalekfile](/pages/config.html) like so:

```
"browsers": [{
  "chrome": {
    "port": 5555
  }
}]
```

It is also possible to specify a range of ports:

```
"browsers": [{
  "chrome": {
    "portRange": [6100, 6120]
  }
}]
```

If you would like to test Chrome Canary oder Chromium releases, you can simply apply a snd. argument,
which defines the browser type:

```
$ dalek mytest.js -b chrome:canary
```

for canary, and if you would like to use chromium, just append `:chromium`:

```
$ dalek mytest.js -b chrome:chromium
```

This will only work if you installed your browser in the default locations,
if the browsers binary is located in a non default location, you are able to specify
its location in your [Dalekfile](/pages/config.html):

```javascript
"browsers": [{
  "chrome": {
    "binary": "/Applications/Custom\ Located\ Chrome.app/Contents/MacOS/Google\ Chrome"
  }
}]
```

This also works for the canary & chromium builds

```javascript
"browsers": [{
  "chrome": {
    "binary": "/Applications/Custom\ Located\ Chrome.app/Contents/MacOS/Google\ Chrome"
  }
}]
```

```
$ dalek mytest.js -b chrome
```
### Launch Chrome with flags enabled

Set `chromeOptions` to start a custom instance of Chrome with flags / command lines switches enabled
for various experimental features. [All command line switches for Chrome](http://peter.sh/experiments/chromium-command-line-switches/).

```javascript
"browsers": [{
  "chrome": {
    "chromeOptions": {
      "args": ["enable-experimental-web-platform-features", "js-flags=--harmony"]
    }
  }
}]
```

## Help Is Just A Click Away

### #dalekjs on FreeNode.net IRC

Join the `#daleksjs` channel on [FreeNode.net](http://freenode.net) to ask questions and get help.

### [Google Group Mailing List](https://groups.google.com/forum/#!forum/dalekjs)

Get announcements for new releases, share your projects and ideas that are
using DalekJS, and join in open-ended discussion that does not fit in
to the Github issues list or StackOverflow Q&A.

**For help with syntax, specific questions on how to implement a feature
using DalekJS, and other Q&A items, use StackOverflow.**

### [StackOverflow](http://stackoverflow.com/questions/tagged/dalekjs)

Ask questions about using DalekJS in specific scenarios, with
specific features. For example, help with syntax, understanding how a feature works and
how to override that feature, browser specific problems and so on.

Questions on StackOverflow often turn in to blog posts or issues.

### [Github Issues](//github.com/dalekjs/dalek-browser-chrome/issues)

Report issues with DalekJS, submit pull requests to fix problems, or to
create summarized and documented feature requests (preferably with pull
requests that implement the feature).

**Please don't ask questions or seek help in the issues list.** There are
other, better channels for seeking assistance, like StackOverflow and the
Google Groups mailing list.

![DalekJS](https://raw.github.com/dalekjs/dalekjs.com/master/img/logo.png)

## Legal FooBar (MIT License)

Copyright (c) 2013 Sebastian Golasch

Distributed under [MIT license](https://github.com/dalekjs/dalek-browser-chrome/blob/master/LICENSE-MIT)
