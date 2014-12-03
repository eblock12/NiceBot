'use strict';

var cp = require('child_process');

var resultLengthSoftLimit = 512;
var resultLengthHardLimit = 4096;
var resultLineCountSoftLimit = 2;
var resultLineCountHardLimit = 8;

var resultTimeout = 1000; // milliseconds

module.exports = function (client, from, channel, command, args) {
    var dest = channel;

    var childProcess = cp.fork('src/plugins/eval-worker.js');

    var timerID = setTimeout(function () {
        childProcess.kill('SIGKILL');
        client.say(dest, from + ": Calculation timed out!");
    }, resultTimeout);

    childProcess.on('message', function(result) {
        clearTimeout(timerID);

        result = String(result);

        var lineCount = result.split(/\r\n|\r|\n/).length;

        if ((lineCount >= resultLineCountHardLimit) || (result.length + from.length + 2 > resultLengthHardLimit)) {
            client.say(dest, from + ": Error: Result is way too long, giving up!");
            dest = from;
            return; // early return
        }
        else if ((lineCount >= resultLineCountSoftLimit) || (result.length + from.length + 2 > resultLengthSoftLimit)) {
            client.say(dest, from + ": Result is too long, sending privately...");
            dest = from;
        }

        client.say(dest, from + ": " + result);
    });

    childProcess.send(args);
};
