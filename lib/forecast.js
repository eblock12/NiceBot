'use strict';

var request = require('request');
var moment = require('moment');
var util = require('util');

var maxDays = 5

module.exports = function (client, from, channel, command, args) {
    request('http://api.openweathermap.org/data/2.5/forecast/daily?cnt=' + maxDays + '&q=' + encodeURIComponent(args), function(error, response, body) {
        var data = JSON.parse(body);
        console.log(util.inspect(data, {depth: 3}));
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
                message += mergeConditions(forecast.weather);
                message += ' (' + formatTemp(forecast.temp.min, data.city.country);
                message += '/' + formatTemp(forecast.temp.max, data.city.country) + ')';
                if (i < data.list.length - 1) {
                    message += ', ';
                }
            }

/*            }

            message += mergeConditions(data.weather) + '." Temperature: ';
            message += formatTemp(data.main.temp, data.sys.country) + " ";
            if ((data.main.temp_min != data.main.temp) || (data.main.temp_max != data.main.temp)) {
                message += "(Low: " + formatTemp(data.main.temp_min, data.sys.country) + ", ";
                message += "High: " + formatTemp(data.main.temp_max, data.sys.country) + "), ";
            }
            message += "Humidity: " + data.main.humidity + "%, ";
            message += "Dew Point: " + formatTemp(dewpoint, data.sys.country) + ", ";
            message += "Pressure: " + data.main.pressure + " hPa";

            if (data.wind) {
                message += ", Wind: " + data.wind.speed + " m/s (" + Math.round(data.wind.deg) + "°)";
                if (data.wind.gust) {
                    message += ", gusting to " + data.wind.gust + " m/s";
                }
            }
*/
            client.say(channel, message);
        }
    });

    function mergeConditions(weather) {
        var result = "unavailable";
        if (weather)
        {
            if (weather.length == 1) {
                result = weather[0].main;
            }
            else if (weather.length == 2) {
                result = weather[0].main + ' and ' + weather[1].main;
            }
            else if (weather.length > 2) {
                result = "";
                for (var i = 0; i < weather.length - 1; i++) {
                    result += weather[i].main + ', ';
                }
                result += 'and ' + weather[weather.length-1].main;
            }
        }
        return result;
    }

    function formatTemp(kelvinDegrees, country) {
        country = country.toLowerCase();
        var useMetric = (country != "us") && (country != 'united states of america');

        var celciusDegrees = kelvinDegrees - 273.15;
        var fahrenheitDegrees = (celciusDegrees * 9/5) + 32;

        if (useMetric) {
            celciusDegrees = +celciusDegrees.toFixed(2);
            return celciusDegrees + '°C';
        }
        else {
            fahrenheitDegrees = +fahrenheitDegrees.toFixed(2);
            return fahrenheitDegrees + '°F';
        }
    }
};
