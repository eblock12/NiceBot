'use strict';

var request = require('request');
var moment = require('moment');
var wutil = require('./weather-util');

var maxDays = 5;

module.exports = function (client, from, channel, command, args) {
    request('http://api.openweathermap.org/data/2.5/forecast/daily?cnt=' + maxDays + '&q=' + encodeURIComponent(args), function(error, response, body) {
        var data = JSON.parse(body);

        if (data.cod === '404') {
            client.say(channel, from + ": Location not found :(");
        }
        else
        {
            var location = Boolean(data.city.name) ? data.city.name : data.city.country;
            var message = from + ': ' + location + ' Forecast for ';

            for (var i = 0; i < data.list.length; i++) {
                var forecast = data.list[i];

                var day = String.fromCharCode(2) + moment.unix(forecast.dt).format("ddd") + String.fromCharCode(2);

                message += day + ': ';
                message += wutil.mergeConditions(forecast.weather);
                message += ' (' + wutil.formatTemp(forecast.temp.min, data.city.country);
                message += '/' + wutil.formatTemp(forecast.temp.max, data.city.country) + ')';
                if (i < data.list.length - 1) {
                    message += ', ';
                }
            }

            client.say(channel, message);
        }
    });
};
