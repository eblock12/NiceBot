'use strict';

var context = require('../context.js');
var fs = require('fs');
var _ = require('lodash');

var PlaceData = function(file) {
    // { channelA: { userA: 5, userB: 10 }, channelB: { userA: 10, userB: 5 } }
    var data = {};
    var dirty = true;
    var loading = false;
    var saving = false;
    var dead = false;

    var saveCheckTime = 5 * 1000 * 60; // 5 minutes
    var saveTimer = setTimeout(doWriteCheck, saveCheckTime);

    if (!file) {
        file = "place.json";
    }
    loadFile(file);

    this.getPlaceData = function(channel, limit) {
        if (!limit) {
            limit = 10;
        }
        var result;
        if (isReadable() && (data[channel] !== undefined)) {
            var chanData = data[channel];
            result = _(chanData)
                .pairs()
                .sortBy(function (pair) {
                    return -pair[1];
                })
                .map(function (pair) {
                    return {
                        nick: pair[0],
                        lines: pair[1]
                    };
                })
                .first(limit)
                .value();
        }
        return result;
    };

    this.incrementLineCount = function(channel, nick) {
        if (isWritable()) {
            if (data[channel] === undefined) {
                data[channel] = {};
            }
            var chanData = data[channel];
            if (chanData[nick] === undefined) {
                chanData[nick] = 0;
            }
            chanData[nick]++;
            dirty = true;
        }
    };

    this.save = function(callback) {
        clearTimeout(saveTimer);
        doWriteCheck(callback);
    };

    function isReadable() {
        return !dead && !loading;
    }

    function isWritable() {
        return !dead && !loading;
    }

    function loadFile() {
        console.log('Loading place data from ' + file + '...');

        loading = true;
        fs.readFile(file, function (err, contents) {
            if (err) {
                if (err.code === "ENOENT") {
                    console.log("Place data file doesn't exist yet, will create a new one");
                    data = {};
                    dirty = true;
                    dead = false;
                }
                else {
                    console.log('Failed to place data file from "' + file + '" Error: ' + String(err));
                    dead = true;
                }
            }
            else {
                try {
                    data = JSON.parse(contents);
                    console.log("Finished loading place data");
                    dead = false;
                    dirty = false;
                }
                catch (jsonError) {
                    console.log("Failed to load place data. Error: " + String(jsonError));
                    dead = true;
                }
            }
            loading = false;
        });
    }

    function saveFile(callback) {
        saving = true;
        console.log("Saving place data...");

        fs.writeFile(file, JSON.stringify(data), function (err) {
            if (err) {
                console.log("Failed to save place data. Error: " + String(err));
            }
            else {
                console.log("Finished saving place data");
            }
            saving = false;
            if (callback) {
                callback();
            }
        });
    }

    function setClean() {
        dirty = false;
    }

    function doWriteCheck(callback) {
        if (dirty && !loading && !saving && !dead) {
            setClean();
            saveFile(callback);
        }
        else if (callback) {
            callback();
        }

        saveTimer = setTimeout(doWriteCheck, saveCheckTime);
    }
};

var placeData = new PlaceData();

process.on("SIGTERM", function() {
    console.log("Got SIGTERM");
    shutdown();
});
process.on("SIGINT", function() {
    console.log("Got SIGINT");
    shutdown();
});

function shutdown() {
    console.log("Shutting down...");
    placeData.save(function() {
        process.exit();
    });
}

var client = context.getClient();
client.on('message', function (from, to, message) {
    placeData.incrementLineCount(to, from);
});

module.exports = function (client, from, channel, command, args) {
    var response = "";
    var sortedData, i, entry;
    if (args) {
        sortedData = placeData.getPlaceData(channel, 10000 /*TODO: Remove limit hack*/);
        if (!sortedData) {
            client.say(channel, "No place data is currently available for " + channel);
        }
        else {
            var ranking, len;
            // TODO: Make this faster?
            for (i = 0, len = sortedData.length; i < len; i++) {
                if (sortedData[i].nick === args) {
                    entry = sortedData[i];
                    ranking = i + 1;
                    break;
                }
            }
            if (entry) {
                response += entry.nick + ' is ranked at ' + formatRanking(ranking) + ' place with ' + entry.lines + ' lines';
            }
            else {
                response += from + ': No place data found for that user';
            }
        }
    }
    else {
        sortedData = placeData.getPlaceData(channel);
        if (!sortedData) {
            client.say(channel, "No place data is currently available for " + channel);
        }
        else {
            for (i = 0; i < sortedData.length; i++) {
                entry = sortedData[i];
                response += String(i + 1) + ". ";
                response += entry.nick.replace('will`', 'butt');
                response += '(' + entry.lines + ') ';
            }
        }
    }
    client.say(channel, response);

    function formatRanking(rank) {
        var result = String(rank);
        switch (rank) {
            case 1:
                result += 'st';
                break;
            case 2:
                result += 'nd';
                break;
            case 3:
                result += 'rd';
                break;
            default:
                result += 'th';
                break;
        }
        return result;
    }
};
