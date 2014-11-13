'use strict';

var request = require('request');
var wutil = require('./weather-util');

module.exports = function (client, from, channel, command, args) {
    request('http://api.openweathermap.org/data/2.5/weather?q=' + encodeURIComponent(args), function(error, response, body) {
        var data = JSON.parse(body);
        if (data.message) {
            client.say(channel, from + ": " + data.message);
        }
        else
        {
            var dewpoint = data.main.temp - ((100 - data.main.humidity) / 5);

            var message = from + ': Weather for ' + data.name + ' (' + data.sys.country + ') is "';
            message += wutil.mergeConditions(data.weather) + '." Temperature: ';
            message += wutil.formatTemp(data.main.temp, data.sys.country) + " ";
            if ((data.main.temp_min != data.main.temp) || (data.main.temp_max != data.main.temp)) {
                message += "(Low: " + wutil.formatTemp(data.main.temp_min, data.sys.country) + ", ";
                message += "High: " + wutil.formatTemp(data.main.temp_max, data.sys.country) + "), ";
            }
            message += "Humidity: " + data.main.humidity + "%, ";
            message += "Dew Point: " + wutil.formatTemp(dewpoint, data.sys.country) + ", ";
            message += "Pressure: " + data.main.pressure + " hPa";

            if (data.wind) {
                message += ", Wind: " + data.wind.speed + " m/s (" + Math.round(data.wind.deg) + "°)";
                if (data.wind.gust) {
                    message += ", gusting to " + data.wind.gust + " m/s";
                }
            }

            client.say(channel, message);
        }
    });
};
