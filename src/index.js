'use strict';

var irc = require('irc');
var util = require('util');

var commandMap = {};

// TODO: Implement proper config/settings
var config = require("./NiceBot.json");

// node-irc api docs @ https://node-irc.readthedocs.org/en/latest/API.html
var client = new irc.Client(config.irc.serverHost, config.irc.nickName, config.irc);

// implement dynamic command registration
commandMap["eval"] = require("./plugins/eval.js"); // jshint ignore:line
commandMap["forecast"] = require("./plugins/forecast.js");
commandMap["weather"] = require("./plugins/weather.js");

commandMap["help"] = function (client, from, channel, command, args) {
    var commands = Object.getOwnPropertyNames(commandMap);
    client.say(channel, "Available commands: " + commands.join(', '));
};

client.on('error', function (err) {
});

client.on('message', function (from, to, message) {
    if (message) {
        var command = matchGroup(message, /^@(\w+)/, 1 /*groupIndex*/);
        if (command) {
            command = command.toLowerCase();
            var args = matchGroup(message, /\s+(.+)/, 1 /*groupIndex*/);
            if (commandMap[command]) {
                commandMap[command](client, from, to, command, args);
            }
        }
    }
});

client.on('join', function (channel, nick, message) {
});

client.connect();

function matchGroup(str, regex, groupIndex) {
    var result;
    var matches = str.match(regex);
    if (matches && (matches.length > groupIndex)) {
        result = matches[groupIndex];
    }
    return result;
}
