'use strict';

var request = require('request');

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

            client.say(channel, message);
        }
    });

    function mergeConditions(weather) {
        var result = "unavailable";
        if (weather)
        {
            if (weather.length == 1) {
                result = weather[0].description;
            }
            else if (weather.length == 2) {
                result = weather[0].description + ' and ' + weather[1].description;
            }
            else if (weather.length > 2) {
                result = "";
                for (var i = 0; i < weather.length - 1; i++) {
                    result += weather[i].description + ', ';
                }
                result += 'and ' + weather[weather.length-1].description;
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
            return celciusDegrees + ' °C';
        }
        else {
            fahrenheitDegrees = +fahrenheitDegrees.toFixed(2);
            return fahrenheitDegrees + ' °F';
        }
    }
};
