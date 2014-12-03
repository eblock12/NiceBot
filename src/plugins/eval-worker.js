'use strict';

var math = require('mathjs');

math.config({
  number: 'bignumber'
});

process.on('message', function(message) {
    var result = "";

    try
    {
        result = math.eval(message); // jshint ignore:line
    }
    catch (err) {
        result = err.toString();
    }

    if (typeof result === "function") {
        result = "undefined";
    }

    result = String(result);

    process.send(result);
    process.exit(0);
});
