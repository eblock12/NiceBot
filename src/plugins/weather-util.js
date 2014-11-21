'use string';

module.exports = {
    mergeConditions: function(weather) {
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
    },

    formatTemp: function (kelvinDegrees, country) {
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
    },

    safeParseJson: function (json) {
        var result;
        try {
            result = JSON.parse(json);
        }
        catch (err) {
            result = { message: String(err) };
        }
        return result;
    }
};
