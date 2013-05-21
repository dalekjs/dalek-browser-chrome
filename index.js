var Q = require('q');
var spawn = require('child_process').spawn;
var chromedriver = require('./lib/chromedriver');

module.exports = {
    port: 9002,
    host: 'localhost',
    path: '/',
    spawned: null,
    launch: function () {
        var deferred = Q.defer();
        var stream = '';
        this.spawned = spawn(chromedriver.path, ['--port=9002']);

        this.spawned.stdout.on('data', function (data) {
            var dataStr = new String(data);
            stream += dataStr;
            if (stream.search('Started ChromeDriver') !== -1) {
                deferred.resolve();
            }
        });
        return deferred.promise;
    },
    kill: function () {
        this.spawned.kill('SIGTERM');
    }
};
