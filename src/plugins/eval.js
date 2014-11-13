'use strict';

var math = require('mathjs');

var resultLengthSoftLimit = 512;
var resultLengthHardLimit = 4096;

math.config({
  number: 'bignumber'
});

module.exports = function (client, from, channel, command, args) {
    var dest = channel;
    var result = "";

    try
    {
        result = math.eval(args); // jshint ignore:line
    }
    catch (err) {
        result = err.toString();
    }

    if (typeof result === "function") {
        result = undefined;
    }

    result = String(result);
    if (result.length + from.length + 2 > resultLengthHardLimit) {
        client.say(dest, from + ": Error: Result is way too long, giving up!");
        dest = from;
        return; // early return
    }
    else if (result.length + from.length + 2 > resultLengthSoftLimit) {
        client.say(dest, from + ": Result is too long, sending privately...");
        dest = from;
    }

    client.say(dest, from + ": " + result);
};
