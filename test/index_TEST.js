'use strict';

var expect = require('chai').expect;
var ChromeDriver = require('../index');

describe('dalek-browser-chrome', function() {

  it('should get default webdriver port', function(){
    expect(ChromeDriver.port).to.equal(9002);
  });

});
